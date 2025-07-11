import { OAuth2Client } from 'google-auth-library';
import { createOAuth2Client, getAuthUrl, getGmailService } from './client.js';
import { db } from '../../../services/database/client.js';

export class GmailService {
    private auth: OAuth2Client | null = null;
    private userId: string;

    private constructor(userId: string) {
        this.userId = userId;
        this.auth = createOAuth2Client();
    }

    public static async create(userId: string): Promise<GmailService> {
        const service = new GmailService(userId);
        await service.initialize();
        return service;
    }

    private async initialize(): Promise<void> {
        if (!this.auth) {
            this.auth = createOAuth2Client();
        }

        const result = await db.query(
            'SELECT refresh_token FROM gmail_connections WHERE user_id = $1',
            [this.userId]
        );

        if (result.rows.length > 0 && result.rows[0].refresh_token) {
            this.auth.setCredentials({
                refresh_token: result.rows[0].refresh_token
            });
        }
    }

    public async getAuthUrl(): Promise<string> {
        if (!this.auth) {
            this.auth = createOAuth2Client();
        }
        return getAuthUrl(this.auth, this.userId);
    }

    public async handleCallback(code: string, userId: string): Promise<void> {
        if (!this.auth) {
            this.auth = createOAuth2Client();
        }
        const { tokens } = await this.auth.getToken(code);
        this.auth.setCredentials(tokens);

        // Store refresh token
        await db.query(`
            INSERT INTO gmail_connections (user_id, refresh_token, updated_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id) 
            DO UPDATE SET refresh_token = $2, updated_at = $3
        `, [userId, tokens.refresh_token, new Date().toISOString()]);
    }

    public async listMessages(query: string): Promise<any[]> {
        if (!this.auth) {
            throw new Error('Gmail service not initialized');
        }
        const gmail = await getGmailService(this.auth);
        const messages = await gmail.users.messages.list({
            userId: 'me',
            q: query
        });
        return messages.data.messages || [];
    }

    public async getMessage(messageId: string): Promise<any> {
        if (!this.auth) {
            throw new Error('Gmail service not initialized');
        }
        const gmail = await getGmailService(this.auth);
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });
        return response.data;
    }
}
