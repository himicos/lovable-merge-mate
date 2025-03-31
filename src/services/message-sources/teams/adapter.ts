import { Client } from '@microsoft/microsoft-graph-client';
import { supabase } from '../../../integrations/supabase/client.js';
import { MessageContent, MessageSource } from '../../message-processor/types.js';
import type { MessageSourceInterface, MessageSourceConfig, MessageSourceMetadata, MessageFilter } from '../types.js';

export class TeamsAdapter implements MessageSourceInterface {
    readonly name = 'Teams';
    readonly sourceType = MessageSource.TEAMS;
    private client: Client | null = null;
    private userId: string;

    constructor(userId: string, token: string) {
        this.userId = userId;
        this.client = Client.init({
            authProvider: (done: (error: Error | null, token?: string) => void) => {
                done(null, token);
            }
        });
    }

    async initialize(config: MessageSourceConfig): Promise<void> {
        this.userId = config.userId;

        const { data: credentials, error } = await supabase
            .from('teams_connections')
            .select('*')
            .eq('user_id', this.userId)
            .single();

        if (error || !credentials) {
            throw new Error('Teams credentials not found');
        }

        this.client = Client.init({
            authProvider: (done: (error: Error | null, token?: string) => void) => {
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

    async fetchMessages(filter?: MessageFilter): Promise<MessageContent[]> {
        if (!this.client) {
            throw new Error('Teams adapter not initialized');
        }

        const messages: MessageContent[] = [];
        const limit = filter?.limit ?? 10;

        try {
            // Get chats
            const chats = await this.client
                .api('/me/chats')
                .top(50)
                .get();

            for (const chat of chats.value) {
                try {
                    const params: any = {
                        $top: limit,
                        $orderby: 'createdDateTime desc'
                    };

                    if (filter?.since) {
                        params.$filter = `createdDateTime gt ${filter.since}`;
                    }

                    const response = await this.client.api(`/me/chats/${chat.id}/messages`)
                        .select('id,content,from,createdDateTime,importance')
                        .get();

                    for (const msg of response.value) {
                        let timestamp: string;
                        if (typeof msg.createdDateTime === 'string') {
                            timestamp = msg.createdDateTime;
                        } else {
                            timestamp = new Date().toISOString();
                        }

                        messages.push({
                            id: msg.id,
                            source: MessageSource.TEAMS,
                            chatId: chat.id,
                            chatTopic: chat.topic,
                            sender: msg.from?.user?.displayName || msg.from?.user?.id || 'Unknown',
                            content: msg.body?.content || '',
                            timestamp,
                            importance: msg.importance,
                            raw: JSON.parse(JSON.stringify(msg))
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching messages from chat ${chat.id}:`, error);
                }
            }

            return messages;
        } catch (error) {
            console.error('Error fetching Teams messages:', error);
            throw error;
        }
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

    async getMetadata(): Promise<MessageSourceMetadata> {
        if (!this.client) {
            throw new Error('Teams adapter not initialized');
        }

        try {
            const chats = await this.client
                .api('/me/chats')
                .get();

            let unreadMessages = 0;
            for (const chat of chats.value) {
                const unreadCount = await this.client
                    .api(`/me/chats/${chat.id}/messages?$filter=unread eq true&$count=true`)
                    .header('ConsistencyLevel', 'eventual')
                    .get();

                unreadMessages += unreadCount['@odata.count'] || 0;
            }

            const now = new Date();
            return {
                lastSyncTime: now.toISOString(),
                unreadMessages
            };
        } catch (error) {
            console.error('Error getting Teams metadata:', error);
            throw error;
        }
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
