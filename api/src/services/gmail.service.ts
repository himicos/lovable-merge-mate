import { OAuth2Client, Credentials } from 'google-auth-library';
import { google, gmail_v1, oauth2_v2 } from 'googleapis';
import { db } from './database/client.js';

interface TokenData {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

interface UserProfile {
    email: string;
    name: string;
}

export class GmailService {
    private static instances: Map<string, GmailService> = new Map();
    private oauth2Client: OAuth2Client;
    private gmail: gmail_v1.Gmail;
    private oauth2: oauth2_v2.Oauth2;

    private constructor(userId: string) {
        this.oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Initialize Gmail API
        this.gmail = google.gmail({ 
            version: 'v1', 
            auth: this.oauth2Client as any // Type cast needed due to version mismatch in google-auth-library
        });

        // Initialize OAuth2 API
        this.oauth2 = google.oauth2({ 
            version: 'v2', 
            auth: this.oauth2Client as any // Type cast needed due to version mismatch in google-auth-library
        });
    }

    public static async create(userId: string): Promise<GmailService> {
        if (!GmailService.instances.has(userId)) {
            const instance = new GmailService(userId);
            await instance.loadTokens(userId);
            GmailService.instances.set(userId, instance);
        }
        return GmailService.instances.get(userId)!;
    }

    private async loadTokens(userId: string): Promise<void> {
        const result = await db.query(
            'SELECT access_token, refresh_token, expires_at FROM gmail_connections WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length > 0) {
            const connection = result.rows[0];
            this.oauth2Client.setCredentials({
                access_token: connection.access_token,
                refresh_token: connection.refresh_token,
                expiry_date: connection.expires_at ? new Date(connection.expires_at).getTime() : Date.now() + 3600000,
            });
        }
    }

    public getAuthUrl(): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'profile',
                'email',
            ],
        });
    }

    public async handleCallback(code: string, userId: string): Promise<void> {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        const { data: profile } = await this.oauth2.userinfo.get() as { data: UserProfile };

        await db.query(`
            INSERT INTO gmail_connections (user_id, email, access_token, refresh_token, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, email) 
            DO UPDATE SET 
                access_token = $3,
                refresh_token = $4,
                expires_at = $5,
                updated_at = NOW()
        `, [
            userId,
            profile.email,
            tokens.access_token,
            tokens.refresh_token,
            tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null
        ]);
    }

    public async refreshTokens(userId: string): Promise<void> {
        const result = await db.query(
            'SELECT access_token, refresh_token, expires_at FROM gmail_connections WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length > 0) {
            const connection = result.rows[0];
            const tokens = {
                access_token: connection.access_token,
                refresh_token: connection.refresh_token,
                expires_in: connection.expires_at ? 
                    Math.floor((new Date(connection.expires_at).getTime() - Date.now()) / 1000) : 3600
            } as TokenData;
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: process.env.GOOGLE_CLIENT_ID!,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                    refresh_token: tokens.refresh_token,
                    grant_type: 'refresh_token',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const newTokens = await response.json() as TokenResponse;
            const credentials: Credentials = {
                access_token: newTokens.access_token,
                expiry_date: Date.now() + (newTokens.expires_in * 1000),
                refresh_token: tokens.refresh_token,
                token_type: 'Bearer',
            };

            await db.query(`
                UPDATE gmail_connections 
                SET access_token = $1, expires_at = $2, updated_at = NOW()
                WHERE user_id = $3
            `, [
                credentials.access_token,
                new Date(credentials.expiry_date || Date.now() + (newTokens.expires_in * 1000)).toISOString(),
                userId
            ]);

            this.oauth2Client.setCredentials(credentials);
        }
    }

    public async getMessage(messageId: string): Promise<any> {
        try {
            const { data: message } = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });
            return message;
        } catch (error) {
            if ((error as any).code === 401) {
                const profile = await this.getUserProfile();
                await this.refreshTokens(profile.email);
                const { data: message } = await this.gmail.users.messages.get({
                    userId: 'me',
                    id: messageId,
                    format: 'full',
                });
                return message;
            }
            throw error;
        }
    }

    public async listMessages(query = ''): Promise<any[]> {
        try {
            const { data } = await this.gmail.users.messages.list({
                userId: 'me',
                q: query,
            });

            return data.messages || [];
        } catch (error) {
            if ((error as any).code === 401) {
                const profile = await this.getUserProfile();
                await this.refreshTokens(profile.email);
                const { data } = await this.gmail.users.messages.list({
                    userId: 'me',
                    q: query,
                });
                return data.messages || [];
            }
            throw error;
        }
    }

    private async getUserProfile(): Promise<UserProfile> {
        const { data } = await this.oauth2.userinfo.get() as { data: UserProfile };
        return data;
    }

    public async markAsRead(messageId: string): Promise<void> {
        await this.gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD'],
            },
        });
    }

    public async moveToFolder(messageId: string, folderId: string): Promise<void> {
        await this.gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds: [folderId],
            },
        });
    }

    private getMessageContent(message: any): string {
        let content = '';

        if (message.payload.parts) {
            for (const part of message.payload.parts) {
                if (part.mimeType === 'text/plain') {
                    content = Buffer.from(part.body.data, 'base64').toString('utf8');
                    break;
                }
            }
        } else if (message.payload.body.data) {
            content = Buffer.from(message.payload.body.data, 'base64').toString('utf8');
        }

        return content;
    }

    public async watchInbox(): Promise<void> {
        try {
            const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/watch', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${(this.oauth2Client.credentials as Credentials).access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    labelIds: ['INBOX'],
                    topicName: 'projects/your-project/topics/gmail-notifications',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to set up inbox watch');
            }
        } catch (error) {
            console.error('Error setting up inbox watch:', error);
            throw error;
        }
    }
}
