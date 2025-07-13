import { WebClient } from '@slack/web-api';
import { MessageContent, MessageSource } from '../../message-processor/types.js';
import type { MessageSourceInterface, MessageSourceConfig, MessageSourceMetadata, MessageFilter } from '../types.js';
import { db } from '../../database/client.js';

export class SlackAdapter implements MessageSourceInterface {
    readonly name = 'Slack';
    readonly sourceType = MessageSource.SLACK;
    private client: WebClient | null = null;
    private userId: string;

    constructor(userId: string, credentials?: { access_token: string }) {
        this.userId = userId;
        this.client = new WebClient(credentials?.access_token);
    }

    async initialize(config: MessageSourceConfig): Promise<void> {
        await this.connect();
    }

    async disconnect(): Promise<void> {
        this.client = null;
    }

    async connect(): Promise<void> {
        // Try to get credentials from PostgreSQL database
        const result = await db.query(
            'SELECT access_token FROM slack_connections WHERE user_id = $1',
            [this.userId]
        );

        if (result.rows.length === 0) {
            throw new Error('Slack credentials not found');
        }

        this.client = new WebClient(result.rows[0].access_token);
    }

    async fetchMessages(filter?: MessageFilter): Promise<MessageContent[]> {
        if (!this.client) {
            throw new Error('Slack adapter not initialized');
        }

        try {
            const result = await this.client.conversations.list();
            const channels = result.channels || [];
            const messages: MessageContent[] = [];
            const limit = filter?.limit ?? 10;

            for (const channel of channels) {
                if (!channel.id) continue;

                const history = await this.client.conversations.history({
                    channel: channel.id,
                    limit
                });

                const channelMessages = history.messages || [];
                for (const msg of channelMessages) {
                    if (!msg.ts || !msg.text) continue;

                    messages.push({
                        id: msg.ts,
                        source: MessageSource.SLACK,
                        sender: msg.user || 'unknown',
                        content: msg.text,
                        timestamp: new Date(Number(msg.ts) * 1000).toISOString(),
                        raw: JSON.parse(JSON.stringify(msg))
                    });
                }
            }

            return messages;
        } catch (error) {
            console.error('Error fetching Slack messages:', error);
            throw error;
        }
    }

    async getMetadata(): Promise<MessageSourceMetadata> {
        if (!this.client) {
            throw new Error('Slack adapter not initialized');
        }

        try {
            const result = await this.client.conversations.list();
            let unreadMessages = 0;

            for (const channel of result.channels || []) {
                if (channel.id) {
                    const info = await this.client.conversations.info({
                        channel: channel.id
                    });
                    
                    if (info.channel && 'unread_count' in info.channel) {
                        unreadMessages += info.channel.unread_count as number;
                    }
                }
            }

            return {
                lastSyncTime: new Date().toISOString(),
                unreadMessages
            };
        } catch (error) {
            console.error('Error getting Slack metadata:', error);
            throw error;
        }
    }

    async markMessageAsRead(messageId: string): Promise<void> {
        // Not implemented - Slack doesn't have a direct "mark as read" API
    }

    async moveMessage(messageId: string, destination: string): Promise<void> {
        if (!this.client) {
            throw new Error('Slack adapter not initialized');
        }

        // In Slack, we can only move messages by copying them to another channel
        const [channelId, timestamp] = messageId.split(':');
        
        await this.client.chat.postMessage({
            channel: destination,
            text: 'Message moved from another channel',
            thread_ts: timestamp
        });
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
}
