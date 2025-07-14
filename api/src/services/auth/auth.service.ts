import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../database/client.js';
import { OAuth2Client } from 'google-auth-library';
import { redis } from '../redis/client.js';

declare const process: NodeJS.Process;

interface User {
    id: string;
    email: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    picture: string;
}

export class AuthService {
    private jwtSecret: string;
    private refreshSecret: string;
    private googleClient: OAuth2Client;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-default-jwt-secret';
        this.refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'your-default-refresh-secret';
        this.googleClient = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    // Generate Google OAuth URL
    public async getGoogleAuthUrl(): Promise<string> {
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ];

        const authUrl = this.googleClient.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true
        });

        return authUrl;
    }

    // Handle Google OAuth callback
    public async handleGoogleCallback(code: string): Promise<{ user: User; tokens: AuthTokens }> {
        try {
            // Exchange code for tokens
            const { tokens } = await this.googleClient.getToken(code);
            this.googleClient.setCredentials(tokens);

            // Get user info from Google
            const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
            
            if (!response.ok) {
                throw new Error('Failed to get user info from Google');
            }
            
            const googleUser = await response.json();

            // Check if user exists
            let result = await db.query(
                'SELECT id, email, email_verified, created_at, updated_at FROM users WHERE email = $1',
                [googleUser.email]
            );

            let user: User;

            if (result.rows.length === 0) {
                // Create new user
                result = await db.query(
                    `INSERT INTO users (email, email_verified) 
                     VALUES ($1, $2) 
                     RETURNING id, email, email_verified, created_at, updated_at`,
                    [googleUser.email, googleUser.verified_email || true]
                );
                user = result.rows[0];

                // Store Google auth provider info
                await db.query(
                    `INSERT INTO user_auth_providers (user_id, provider, provider_id, email, access_token) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [user.id, 'google', googleUser.id, googleUser.email, tokens.access_token]
                );
            } else {
                user = result.rows[0];

                // Update or insert Google auth provider info
                await db.query(
                    `INSERT INTO user_auth_providers (user_id, provider, provider_id, email, access_token) 
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (provider, provider_id) 
                     DO UPDATE SET access_token = $5, updated_at = NOW()`,
                    [user.id, 'google', googleUser.id, googleUser.email, tokens.access_token]
                );
            }

            const authTokens = this.generateTokens(user.id, user.email);

            // Store refresh token in Redis
            await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, authTokens.refresh_token);

            return { user, tokens: authTokens };
        } catch (error) {
            console.error('Google callback error:', error);
            throw new Error('Failed to handle Google OAuth callback');
        }
    }

    // Generate JWT tokens
    private generateTokens(userId: string, email: string): AuthTokens {
        const access_token = jwt.sign(
            { userId, email, type: 'access' },
            this.jwtSecret,
            { expiresIn: '15m' }
        );

        const refresh_token = jwt.sign(
            { userId, email, type: 'refresh' },
            this.refreshSecret,
            { expiresIn: '7d' }
        );

        return {
            access_token,
            refresh_token,
            expires_in: 900 // 15 minutes
        };
    }

    // Verify JWT token
    public verifyAccessToken(token: string): { userId: string; email: string } | null {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as any;
            if (decoded.type !== 'access') return null;
            return { userId: decoded.userId, email: decoded.email };
        } catch (error) {
            return null;
        }
    }

    // Verify refresh token
    public verifyRefreshToken(token: string): { userId: string; email: string } | null {
        try {
            const decoded = jwt.verify(token, this.refreshSecret) as any;
            if (decoded.type !== 'refresh') return null;
            return { userId: decoded.userId, email: decoded.email };
        } catch (error) {
            return null;
        }
    }

    // Sign up with email and password
    public async signUp(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('User already exists');
        }

        // Hash password
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await db.query(
            `INSERT INTO users (email, password_hash, email_verified) 
             VALUES ($1, $2, $3) 
             RETURNING id, email, email_verified, created_at, updated_at`,
            [email, password_hash, false]
        );

        const user = result.rows[0];
        const tokens = this.generateTokens(user.id, user.email);

        // Store refresh token in Redis
        await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refresh_token);

        return { user, tokens };
    }

    // Sign in with email and password
    public async signIn(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
        // Get user with password
        const result = await db.query(
            'SELECT id, email, password_hash, email_verified, created_at, updated_at FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            throw new Error('Invalid credentials');
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        const tokens = this.generateTokens(user.id, user.email);

        // Store refresh token in Redis
        await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refresh_token);

        return {
            user: {
                id: user.id,
                email: user.email,
                email_verified: user.email_verified,
                created_at: user.created_at,
                updated_at: user.updated_at
            },
            tokens
        };
    }

    // Sign in with Google OAuth
    public async signInWithGoogle(accessToken: string): Promise<{ user: User; tokens: AuthTokens }> {
        try {
            // Verify Google token by calling Google's tokeninfo endpoint
            const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`);
            
            if (!response.ok) {
                throw new Error('Invalid Google token');
            }
            
            const tokenInfo = await response.json();
            
            // Verify audience matches our client ID
            if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
                throw new Error('Invalid token audience');
            }
            
            // Verify token is not expired
            if (tokenInfo.exp && Date.now() >= tokenInfo.exp * 1000) {
                throw new Error('Token expired');
            }

            const googleUser: GoogleUserInfo = {
                id: tokenInfo.sub,
                email: tokenInfo.email,
                verified_email: tokenInfo.email_verified === 'true',
                name: tokenInfo.name || '',
                picture: tokenInfo.picture || ''
            };

            // Check if user exists
            let result = await db.query(
                'SELECT id, email, email_verified, created_at, updated_at FROM users WHERE email = $1',
                [googleUser.email]
            );

            let user: User;

            if (result.rows.length === 0) {
                // Create new user
                result = await db.query(
                    `INSERT INTO users (email, email_verified) 
                     VALUES ($1, $2) 
                     RETURNING id, email, email_verified, created_at, updated_at`,
                    [googleUser.email, googleUser.verified_email]
                );
                user = result.rows[0];

                // Store Google auth provider info
                await db.query(
                    `INSERT INTO user_auth_providers (user_id, provider, provider_id, email, access_token) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [user.id, 'google', googleUser.id, googleUser.email, accessToken]
                );
            } else {
                user = result.rows[0];

                // Update or insert Google auth provider info
                await db.query(
                    `INSERT INTO user_auth_providers (user_id, provider, provider_id, email, access_token) 
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (provider, provider_id) 
                     DO UPDATE SET access_token = $5, updated_at = NOW()`,
                    [user.id, 'google', googleUser.id, googleUser.email, accessToken]
                );
            }

            const tokens = this.generateTokens(user.id, user.email);

            // Store refresh token in Redis
            await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refresh_token);

            return { user, tokens };
        } catch (error) {
            console.error('Google sign in error:', error);
            throw new Error('Failed to authenticate with Google');
        }
    }

    // Refresh access token
    public async refreshToken(refreshToken: string): Promise<AuthTokens> {
        const decoded = this.verifyRefreshToken(refreshToken);
        if (!decoded) {
            throw new Error('Invalid refresh token');
        }

        // Check if refresh token exists in Redis
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
        if (storedToken !== refreshToken) {
            throw new Error('Invalid refresh token');
        }

        // Generate new tokens
        const tokens = this.generateTokens(decoded.userId, decoded.email);

        // Store new refresh token in Redis
        await redis.setex(`refresh_token:${decoded.userId}`, 7 * 24 * 60 * 60, tokens.refresh_token);

        return tokens;
    }

    // Sign out
    public async signOut(userId: string, refreshToken?: string): Promise<void> {
        // Remove refresh token from Redis
        await redis.del(`refresh_token:${userId}`);
        
        if (refreshToken) {
            // Optionally blacklist the refresh token
            await redis.setex(`blacklisted_token:${refreshToken}`, 7 * 24 * 60 * 60, 'true');
        }
    }

    // Get user by ID
    public async getUser(userId: string): Promise<User | null> {
        const result = await db.query(
            'SELECT id, email, email_verified, created_at, updated_at FROM users WHERE id = $1',
            [userId]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    // Update user email verification
    public async verifyEmail(userId: string): Promise<void> {
        await db.query(
            'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1',
            [userId]
        );
    }

    // Update user password
    public async updatePassword(userId: string, newPassword: string): Promise<void> {
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(newPassword, saltRounds);
        
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [password_hash, userId]
        );
    }
} 