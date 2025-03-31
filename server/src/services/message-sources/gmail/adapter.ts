import { google } from 'googleapis';
import { MessageContent, MessageSource } from '../../message-processor/types.js';
import type { MessageSourceInterface, MessageSourceConfig, MessageSourceMetadata, MessageFilter } from '../types.js';

export class GmailAdapter implements MessageSourceInterface {
    readonly name = 'Gmail';
    readonly sourceType = MessageSource.GMAIL;
    private auth: any = null;
    private gmail: any = null;
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    async initialize(config: MessageSourceConfig): Promise<void> {
        this.userId = config.userId;
        this.auth = new google.auth.OAuth2();
        this.auth.setCredentials({
            access_token: config.credentials.access_token,
            refresh_token: config.credentials.refresh_token
        });
        this.gmail = google.gmail({ version: 'v1', auth: this.auth });
    }

    async disconnect(): Promise<void> {
        this.auth = null;
        this.gmail = null;
    }

    async fetchMessages(filter?: MessageFilter): Promise<MessageContent[]> {
        if (!this.gmail) {
            throw new Error('Gmail adapter not initialized');
        }

        const messages: MessageContent[] = [];
        const limit = filter?.limit ?? 10;

        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults: limit,
                q: filter?.unreadOnly ? 'is:unread' : undefined
            });

            for (const msg of response.data.messages || []) {
                const message = await this.gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id,
                    format: 'full'
                });

                const headers = message.data.payload.headers;
                const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
                const from = headers.find((h: any) => h.name === 'From')?.value || '';
                const date = headers.find((h: any) => h.name === 'Date')?.value || '';

                messages.push({
                    id: msg.id,
                    source: MessageSource.GMAIL,
                    sender: from,
                    content: subject,
                    timestamp: new Date(date).toISOString(),
                    raw: JSON.parse(JSON.stringify(message.data))
                });
            }

            return messages;
        } catch (error) {
            console.error('Error fetching Gmail messages:', error);
            throw error;
        }
    }

    async getMetadata(): Promise<MessageSourceMetadata> {
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
