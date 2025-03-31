import { Client, AuthProviderCallback } from '@microsoft/microsoft-graph-client';
import { MessageContent, MessageSourceInterface, MessageSource } from '../../message-processor/types.js';
import { supabase } from '../../../integrations/supabase/client.js';

export class TeamsAdapter implements MessageSourceInterface {
    private client: Client;
    private userId: string;
    public readonly name = 'Teams';

    constructor(userId: string) {
        this.userId = userId;

        this.client = Client.init({
            authProvider: (done: AuthProviderCallback, _resource?: string) => {
                this.getAccessToken()
                    .then(token => done(null, token))
                    .catch(error => done(error));
            },
            defaultVersion: 'v1.0',
            debugLogging: false
        });
    }

    private async getAccessToken(): Promise<string> {
        const { data: credentials, error } = await supabase
            .from('teams_connections')
            .select('access_token')
            .eq('user_id', this.userId)
            .single();

        if (error || !credentials?.access_token) {
            throw new Error('Teams credentials not found');
        }

        return credentials.access_token;
    }

    public async connect(): Promise<void> {
        // Test connection
        await this.client.api('/me').get();
    }

    public async fetchMessages(): Promise<MessageContent[]> {
        const response = await this.client.api('/me/messages')
            .select('id,subject,body,sender,receivedDateTime')
            .top(50)
            .get();

        return response.value.map((msg: any) => ({
            id: msg.id,
            source: MessageSource.TEAMS,
            sender: msg.sender.emailAddress.address,
            subject: msg.subject,
            content: msg.body.content,
            timestamp: new Date(msg.receivedDateTime).toISOString(),
            raw: msg
        }));
    }
}
