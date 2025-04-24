import { google } from 'googleapis';
import { MessageSourceInterface, MessageContent, MessageSource } from '../../message-processor/types.js';
import { supabase } from '../../../integrations/auth/client.js';

interface GmailHeader {
    name: string;
    value: string;
}

interface GmailMessage {
    id: string;
    payload?: {
        headers?: GmailHeader[];
        parts?: Array<{
            mimeType: string;
            body?: {
                data?: string;
            };
        }>;
        body?: {
            data?: string;
        };
    };
    internalDate?: string;
    snippet?: string;
}

export class GmailAdapter implements MessageSourceInterface {
    private gmail: any; // Using any to bypass type mismatch between googleapis versions
    private userId: string;
    public readonly name = 'Gmail';
    public readonly sourceType = MessageSource.GMAIL;

    constructor(userId: string, credentials?: { access_token: string; refresh_token: string }) {
        this.userId = userId;
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        if (credentials) {
            auth.setCredentials({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token
            });
        }

        this.gmail = google.gmail({ version: 'v1', auth });
    }

    public async connect(): Promise<void> {
        // Connection is handled by OAuth2Client
    }

    public async fetchMessages(filter?: { unreadOnly?: boolean; limit?: number }): Promise<MessageContent[]> {
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults: filter?.limit ?? 10,
                q: filter?.unreadOnly ? 'is:unread' : undefined
            });

            if (!response.data.messages) {
                return [];
            }

            const messages: MessageContent[] = [];
            for (const msg of response.data.messages) {
                if (!msg.id) continue;

                const details = await this.gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id
                });

                if (!details.data) continue;

                const message = details.data as GmailMessage;
                const headers = message.payload?.headers || [];
                const subject = headers.find((h: GmailHeader) => h.name === 'Subject')?.value || '';
                const from = headers.find((h: GmailHeader) => h.name === 'From')?.value || '';
                const content = this.extractContent(message);

                messages.push({
                    id: msg.id,
                    source: MessageSource.GMAIL,
                    sender: from,
                    subject,
                    content,
                    timestamp: new Date(Number(message.internalDate) || Date.now()).toISOString(),
                    raw: JSON.parse(JSON.stringify(message))
                });
            }

            return messages;
        } catch (error) {
            console.error('Error fetching Gmail messages:', error);
            throw error;
        }
    }

    private extractContent(message: GmailMessage): string {
        const parts = message.payload?.parts || [];
        const body = message.payload?.body;

        if (body?.data) {
            return Buffer.from(body.data, 'base64').toString();
        }

        let content = '';
        for (const part of parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                content += Buffer.from(part.body.data, 'base64').toString();
            }
        }

        return content || message.snippet || '';
    }

    public async getMetadata(): Promise<{ lastSyncTime: string; unreadMessages: number }> {
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: 'is:unread',
                maxResults: 1
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
