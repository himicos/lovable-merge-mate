import { OAuth2Client } from 'google-auth-library';
import { createOAuth2Client, getAuthUrl, getGmailService } from './client.js';
import { supabase } from '../../supabase/client.js';

export class GmailService {
    private authPromise: Promise<OAuth2Client> | null = null;
    private userId: string;

    private constructor(userId: string) {
        this.userId = userId;
    }

    public static async create(userId: string): Promise<GmailService> {
        const service = new GmailService(userId);
        await service.initialize();
        return service;
    }

    private async initialize(): Promise<void> {
        // Create OAuth client and initialize it
        this.authPromise = createOAuth2Client();
        const { data: connection } = await supabase
            .from('gmail_connections')
            .select('refresh_token')
            .eq('user_id', this.userId)
            .single();

        if (connection?.refresh_token) {
            const auth = await this.authPromise;
            auth.setCredentials({
                refresh_token: connection.refresh_token
            });
        }
    }

    public async getAuthUrl(): Promise<string> {
        if (!this.authPromise) {
            this.authPromise = createOAuth2Client();
        }
        const auth = await this.authPromise;
        return getAuthUrl(auth);
    }

    public async handleCallback(code: string, userId: string): Promise<void> {
        if (!this.authPromise) {
            this.authPromise = createOAuth2Client();
        }
        const auth = await this.authPromise;
        const { tokens } = await auth.getToken(code);
        auth.setCredentials(tokens);

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
        if (!this.authPromise) {
            throw new Error('Gmail service not initialized');
        }
        const gmail = await getGmailService(await this.authPromise);
        const messages = await gmail.users.messages.list({
            userId: 'me',
            q: query
        });
        return messages.data.messages || [];
    }

    public async getMessage(messageId: string): Promise<any> {
        if (!this.authPromise) {
            throw new Error('Gmail service not initialized');
        }
        const gmail = await getGmailService(await this.authPromise);
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });
        return response.data;
    }
}
