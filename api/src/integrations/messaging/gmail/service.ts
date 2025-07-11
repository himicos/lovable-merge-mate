import { OAuth2Client } from 'google-auth-library';
import { createOAuth2Client, getAuthUrl, getGmailService } from './client.js';

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

        const { data: connection } = await supabase
            .from('gmail_connections')
            .select('refresh_token')
            .eq('user_id', this.userId)
            .single();

        if (connection?.refresh_token) {
            this.auth.setCredentials({
                refresh_token: connection.refresh_token
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
        await supabase
            .from('gmail_connections')
            .upsert({
                user_id: userId,
                refresh_token: tokens.refresh_token,
                updated_at: new Date().toISOString()
            });
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
