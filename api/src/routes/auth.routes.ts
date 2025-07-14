import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
const authService = new AuthService();

// Sign up with email and password
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const result = await authService.signUp(email, password);
        
        res.status(201).json({
            message: 'User created successfully',
            user: result.user,
            tokens: result.tokens
        });
    } catch (error: any) {
        console.error('Sign up error:', error);
        
        if (error.message === 'User already exists') {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sign in with email and password
router.post('/signin', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await authService.signIn(email, password);
        
        res.json({
            message: 'Sign in successful',
            user: result.user,
            tokens: result.tokens
        });
    } catch (error: any) {
        console.error('Sign in error:', error);
        
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Google OAuth URL
router.get('/google/url', async (req: Request, res: Response) => {
    try {
        const authUrl = await authService.getGoogleAuthUrl();
        
        res.json({
            url: authUrl
        });
    } catch (error: any) {
        console.error('Google OAuth URL error:', error);
        res.status(500).json({ error: 'Failed to generate Google OAuth URL' });
    }
});

// Handle Google OAuth callback
router.get('/google/callback', async (req: Request, res: Response) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const result = await authService.handleGoogleCallback(code as string);
        
        // Redirect to frontend with tokens in URL hash (for client-side handling)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const redirectUrl = `${frontendUrl}/auth/callback#access_token=${result.tokens.access_token}&refresh_token=${result.tokens.refresh_token}&expires_in=${result.tokens.expires_in}`;
        
        res.redirect(redirectUrl);
    } catch (error: any) {
        console.error('Google callback error:', error);
        
        // Redirect to frontend with error
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const errorUrl = `${frontendUrl}/login?error=oauth_failed`;
        
        res.redirect(errorUrl);
    }
});

// Sign in with Google
router.post('/google', async (req: Request, res: Response) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Google access token is required' });
        }

        const result = await authService.signInWithGoogle(accessToken);
        
        res.json({
            message: 'Google sign in successful',
            user: result.user,
            tokens: result.tokens
        });
    } catch (error: any) {
        console.error('Google sign in error:', error);
        
        if (error.message.includes('Google') || error.message.includes('token')) {
            return res.status(401).json({ error: 'Invalid Google token' });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const tokens = await authService.refreshToken(refreshToken);
        
        res.json({
            message: 'Token refreshed successfully',
            tokens
        });
    } catch (error: any) {
        console.error('Token refresh error:', error);
        
        if (error.message === 'Invalid refresh token') {
            return res.status(401).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sign out
router.post('/signout', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user!.userId;

        await authService.signOut(userId, refreshToken);
        
        res.json({ message: 'Sign out successful' });
    } catch (error: any) {
        console.error('Sign out error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const user = await authService.getUser(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify email (placeholder - you'd implement email verification logic)
router.post('/verify-email', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        await authService.verifyEmail(userId);
        
        res.json({ message: 'Email verified successfully' });
    } catch (error: any) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update password
router.patch('/password', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user!.userId;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        await authService.updatePassword(userId, newPassword);
        
        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export { router as authRoutes }; 