import { google } from 'googleapis';
import { supabase } from '../../../integrations/supabase/client';
import type { MessageSource, MessageSourceConfig, MessageSourceMetadata, MessageFilter } from '../types';
import { MessageSource as MessageSourceEnum } from '../../message-processor/types';

export class GmailAdapter implements MessageSource {
    readonly name = 'Gmail';
    readonly sourceType = 'email' as const;
    private userId: string;
    private enabled = false;
    private pollInterval = 60000;
    private oauth2Client: any;

    async initialize(config: MessageSourceConfig): Promise<void> {
        this.userId = config.userId;
        this.enabled = config.enabled ?? true;
        this.pollInterval = config.pollInterval ?? 60000;

        const { data: credentials, error } = await supabase
            .from('gmail_connections')
            .select('*')
            .eq('user_id', this.userId)
            .single();

        if (error || !credentials) {
            throw new Error('Gmail credentials not found');
        }

        this.oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
        );

        this.oauth2Client.setCredentials({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token,
            expiry_date: credentials.expiry_date
        });
    }

    async connect(): Promise<void> {
        if (!this.oauth2Client) {
            throw new Error('Gmail adapter not initialized');
        }

        // Check if token needs refresh
        if (this.oauth2Client.isTokenExpiring()) {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            await this.updateCredentials(credentials);
        }
    }

    async disconnect(): Promise<void> {
        this.oauth2Client = null;
    }

    async getNewMessages(filter?: MessageFilter): Promise<any[]> {
        const messages = await this.fetchMessages(filter);
        return messages.map((message: any) => ({
            id: message.id,
            source: MessageSourceEnum.EMAIL,
            sender: message.payload.headers.find((h: any) => h.name === 'From')?.value ?? '',
            subject: message.payload.headers.find((h: any) => h.name === 'Subject')?.value ?? '',
            content: this.extractMessageContent(message.payload),
            timestamp: new Date(parseInt(message.internalDate)).toISOString(),
            raw: message
        }));
    }

    async fetchMessages(filter?: MessageFilter): Promise<any[]> {
        if (!this.oauth2Client) {
            throw new Error('Gmail adapter not initialized');
        }

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        const messages = [];

        const params: any = {
            userId: 'me',
            maxResults: filter?.limit ?? 10,
            q: 'is:unread'
        };

        if (filter?.since) {
            params.q += ` after:${filter.since.getTime() / 1000}`;
        }

        const response = await gmail.users.messages.list(params);
        const messageIds = response.data.messages || [];

        for (const { id } of messageIds) {
            const message = await gmail.users.messages.get({
                userId: 'me',
                id
            });

            messages.push({
                id: message.data.id,
                source: this.sourceType,
                threadId: message.data.threadId,
                snippet: message.data.snippet,
                payload: message.data.payload,
                labelIds: message.data.labelIds,
                internalDate: message.data.internalDate
            });
        }

        return messages;
    }

    private extractMessageContent(payload: any): string {
        if (payload.body?.data) {
            return Buffer.from(payload.body.data, 'base64').toString('utf-8');
        }

        if (payload.parts) {
            const textPart = payload.parts.find((part: any) => 
                part.mimeType === 'text/plain' || part.mimeType === 'text/html'
            );
            if (textPart?.body?.data) {
                return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
        }

        return '';
    }

    async markMessageAsRead(messageId: string): Promise<void> {
        if (!this.oauth2Client) {
            throw new Error('Gmail adapter not initialized');
        }

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD']
            }
        });
    }

    async moveMessage(messageId: string, destination: string): Promise<void> {
        if (!this.oauth2Client) {
            throw new Error('Gmail adapter not initialized');
        }

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds: [destination]
            }
        });
    }

    getMetadata(): MessageSourceMetadata {
        return {
            lastSyncTime: new Date().toISOString()
        };
    }

    async updateMetadata(metadata: Partial<MessageSourceMetadata>): Promise<void> {
        // Not implemented
    }

    async isHealthy(): Promise<boolean> {
        try {
            await this.connect();
            return true;
        } catch {
            return false;
        }
    }

    private async updateCredentials(credentials: any): Promise<void> {
        const { error } = await supabase
            .from('gmail_connections')
            .update({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token,
                expiry_date: credentials.expiry_date
            })
            .eq('user_id', this.userId);

        if (error) {
            throw new Error('Failed to update Gmail credentials');
        }
    }
}
