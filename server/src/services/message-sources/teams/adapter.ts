import { Client } from '@microsoft/microsoft-graph-client';
import { MessageSourceInterface, MessageContent, MessageSource } from '../../message-processor/types.js';
import { supabase } from '../../../integrations/supabase/client.js';

export class TeamsAdapter implements MessageSourceInterface {
    private client: Client;
    private userId: string;
    public readonly name = 'Teams';

    constructor(userId: string, credentials?: { access_token: string }) {
        this.userId = userId;
        this.client = Client.init({
            authProvider: (done) => {
                done(null, credentials?.access_token || '');
            }
        });
    }

    public async connect(): Promise<void> {
        const { data: credentials } = await supabase
            .from('teams_connections')
            .select('access_token')
            .eq('user_id', this.userId)
            .single();

        if (!credentials) {
            throw new Error('Teams credentials not found');
        }

        this.client = Client.init({
            authProvider: (done) => {
                done(null, credentials.access_token);
            }
        });
    }

    public async fetchMessages(): Promise<MessageContent[]> {
        try {
            const response = await this.client
                .api('/me/messages')
                .select('id,subject,bodyPreview,from,receivedDateTime')
                .top(50)
                .get();

            return response.value.map((msg: any) => ({
                id: msg.id,
                source: MessageSource.TEAMS,
                sender: msg.from.emailAddress.address,
                subject: msg.subject,
                content: msg.bodyPreview,
                timestamp: msg.receivedDateTime,
                raw: JSON.parse(JSON.stringify(msg))
            }));
        } catch (error) {
            console.error('Error fetching Teams messages:', error);
            throw error;
        }
    }
}
