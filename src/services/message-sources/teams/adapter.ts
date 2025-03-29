import { Client } from '@microsoft/microsoft-graph-client';
import { supabase } from '../../../integrations/supabase/client';
import type { MessageSource, MessageSourceConfig, MessageSourceMetadata, MessageFilter } from '../types';

export class TeamsAdapter implements MessageSource {
    readonly name = 'Teams';
    readonly sourceType = 'teams' as const;
    private userId: string;
    private enabled = false;
    private pollInterval = 60000;
    private client: Client | null = null;

    async initialize(config: MessageSourceConfig): Promise<void> {
        this.userId = config.userId;
        this.enabled = config.enabled ?? true;
        this.pollInterval = config.pollInterval ?? 60000;

        const { data: credentials, error } = await supabase
            .from('teams_connections')
            .select('*')
            .eq('user_id', this.userId)
            .single();

        if (error || !credentials) {
            throw new Error('Teams credentials not found');
        }

        this.client = Client.init({
            authProvider: (done) => {
                done(null, credentials.access_token);
            }
        });
    }

    async connect(): Promise<void> {
        if (!this.client) {
            throw new Error('Teams adapter not initialized');
        }

        // Test connection by getting user profile
        await this.client.api('/me').get();
    }

    async disconnect(): Promise<void> {
        this.client = null;
    }

    async fetchMessages(filter?: MessageFilter): Promise<any[]> {
        if (!this.client) {
            throw new Error('Teams adapter not initialized');
        }

        const messages = [];
        const limit = filter?.limit ?? 10;

        // Get chats (direct messages and group chats)
        const chats = await this.client.api('/me/chats')
            .select('id,topic,lastMessage')
            .top(50)
            .get();

        // Get messages from each chat
        for (const chat of chats.value) {
            try {
                const params: any = {
                    $top: limit,
                    $orderby: 'createdDateTime desc'
                };

                if (filter?.since) {
                    params.$filter = `createdDateTime gt ${filter.since.toISOString()}`;
                }

                const response = await this.client.api(`/me/chats/${chat.id}/messages`)
                    .select('id,content,from,createdDateTime,importance')
                    .get();

                messages.push(...response.value.map((msg: any) => ({
                    id: msg.id,
                    source: this.sourceType,
                    chatId: chat.id,
                    chatTopic: chat.topic,
                    content: msg.content,
                    from: msg.from,
                    timestamp: msg.createdDateTime,
                    importance: msg.importance,
                    raw: msg
                })));
            } catch (error) {
                console.error(`Error fetching messages from chat ${chat.id}:`, error);
            }
        }

        return messages;
    }

    async markMessageAsRead(messageId: string): Promise<void> {
        if (!this.client) {
            throw new Error('Teams adapter not initialized');
        }

        const [chatId, msgId] = messageId.split(':');
        await this.client.api(`/me/chats/${chatId}/messages/${msgId}/setRead`)
            .post({});
    }

    async moveMessage(messageId: string, destination: string): Promise<void> {
        // Not implemented - Teams doesn't support moving messages between chats
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
