import { google, gmail_v1 } from 'googleapis';
import { MessageSourceInterface, MessageContent, MessageSource } from '../../message-processor/types';
import { supabase } from '../../../integrations/supabase/client';
import { OAuth2Client } from 'google-auth-library';

export class GmailAdapter implements MessageSourceInterface {
    private oauth2Client: OAuth2Client;
    private gmail: gmail_v1.Gmail;
    private userId: string;
    public readonly name = 'Gmail';
    public readonly sourceType = MessageSource.GMAIL;

    constructor(userId: string, credentials?: { access_token: string; refresh_token: string }) {
        this.userId = userId;
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        if (credentials) {
            this.oauth2Client.setCredentials({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token
            });
        }

        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    }

    public async connect(): Promise<void> {
        const { data: credentials } = await supabase
            .from('gmail_connections')
            .select('access_token, refresh_token')
            .eq('user_id', this.userId)
            .single();

        if (!credentials) {
            throw new Error('Gmail credentials not found');
        }

        this.oauth2Client.setCredentials({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token
        });
    }

    public async fetchMessages(filter?: { unreadOnly?: boolean; limit?: number }): Promise<MessageContent[]> {
        if (!this.gmail) {
            throw new Error('Gmail adapter not initialized');
        }

        const response = await this.gmail.users.messages.list({
            userId: 'me',
            maxResults: filter?.limit ?? 50,
            q: filter?.unreadOnly ? 'is:unread' : undefined
        });

        if (!response.data.messages) {
            return [];
        }

        const messages = await Promise.all(
            response.data.messages.map(async (msg) => {
                const details = await this.gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!
                });

                const headers = details.data.payload?.headers || [];
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const from = headers.find(h => h.name === 'From')?.value || '';
                const content = details.data.snippet || '';

                return {
                    id: msg.id!,
                    source: MessageSource.GMAIL,
                    sender: from,
                    subject,
                    content,
                    timestamp: new Date(Number(details.data.internalDate)).toISOString(),
                    raw: JSON.parse(JSON.stringify(details.data))
                } as MessageContent;
            })
        );

        return messages;
    }

    public async getMetadata(): Promise<{ lastSyncTime: string; unreadMessages: number }> {
        if (!this.gmail) {
            throw new Error('Gmail adapter not initialized');
        }

        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: 'is:unread'
            });

            return {
                lastSyncTime: new Date().toISOString(),
                unreadMessages: response.data.resultSizeEstimate || 0
            };
        } catch (error) {
            console.error('Error getting Gmail metadata:', error);
            throw error;
        }
    }
}
