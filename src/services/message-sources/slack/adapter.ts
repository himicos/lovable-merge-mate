import { WebClient } from '@slack/web-api';
import { supabase } from '../../../integrations/supabase/client';
import type { MessageSource, MessageSourceConfig, MessageSourceMetadata, MessageFilter } from '../types';

export class SlackAdapter implements MessageSource {
    readonly name = 'Slack';
    readonly sourceType = 'slack' as const;
    private userId: string;
    private enabled = false;
    private pollInterval = 60000;
    private client: WebClient | null = null;

    async initialize(config: MessageSourceConfig): Promise<void> {
        this.userId = config.userId;
        this.enabled = config.enabled ?? true;
        this.pollInterval = config.pollInterval ?? 60000;

        const { data: credentials, error } = await supabase
            .from('slack_connections')
            .select('*')
            .eq('user_id', this.userId)
            .single();

        if (error || !credentials) {
            throw new Error('Slack credentials not found');
        }

        this.client = new WebClient(credentials.access_token);
    }

    async connect(): Promise<void> {
        if (!this.client) {
            throw new Error('Slack adapter not initialized');
        }

        // Test connection by calling auth.test
        await this.client.auth.test();
    }

    async disconnect(): Promise<void> {
        this.client = null;
    }

    async fetchMessages(filter?: MessageFilter): Promise<any[]> {
        if (!this.client) {
            throw new Error('Slack adapter not initialized');
        }

        const messages = [];
        const limit = filter?.limit ?? 10;

        // Get list of channels
        const { channels } = await this.client.conversations.list({
            limit: 100,
            exclude_archived: true,
            types: 'public_channel,private_channel,im,mpim'
        });

        if (!channels) {
            return [];
        }

        // Get messages from each channel
        for (const channel of channels) {
            try {
                const params: any = {
                    channel: channel.id,
                    limit
                };

                if (filter?.since) {
                    params.oldest = (filter.since.getTime() / 1000).toString();
                }

                const { messages: channelMessages } = await this.client.conversations.history(params);

                if (channelMessages) {
                    messages.push(...channelMessages.map(msg => ({
                        id: msg.ts,
                        source: this.sourceType,
                        channelId: channel.id,
                        channelName: channel.name,
                        text: msg.text,
                        user: msg.user,
                        timestamp: new Date(parseInt(msg.ts) * 1000).toISOString(),
                        raw: msg
                    })));
                }
            } catch (error) {
                console.error(`Error fetching messages from channel ${channel.id}:`, error);
            }
        }

        return messages;
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
}
