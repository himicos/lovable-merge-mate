import { BaseWorker } from './base';
import type { MessageMonitorConfig, WorkerConfig } from './types';
import { GmailAdapter } from '../services/message-sources/gmail/adapter';
import { SlackAdapter } from '../services/message-sources/slack/adapter';
import { TeamsAdapter } from '../services/message-sources/teams/adapter';
import type { MessageSourceInterface } from '../services/message-processor/types';
import { supabase } from '../integrations/supabase/client';
import type { MessageContent } from '../services/message-processor/types';

export class MessageMonitorWorker extends BaseWorker {
    private sources: MessageSourceInterface[] = [];
    private readonly userId: string;
    protected override config: MessageMonitorConfig = {
        enabled: true,
        pollInterval: 60000,
        maxRetries: 3,
        retryDelay: 5000,
        batchSize: 10,
        sources: {
            gmail: true,
            slack: true,
            teams: true
        }
    };

    constructor(userId: string, workerConfig: Partial<MessageMonitorConfig> = {}) {
        const baseConfig: WorkerConfig = {
            enabled: workerConfig.enabled ?? true,
            pollInterval: workerConfig.pollInterval ?? 60000,
            maxRetries: workerConfig.maxRetries ?? 3,
            retryDelay: workerConfig.retryDelay ?? 5000
        };

        super('message-monitor', baseConfig);

        this.userId = userId;
        this.config = {
            ...this.config,
            ...baseConfig,
            batchSize: workerConfig.batchSize ?? this.config.batchSize,
            sources: {
                gmail: workerConfig.sources?.gmail ?? true,
                slack: workerConfig.sources?.slack ?? true,
                teams: workerConfig.sources?.teams ?? true
            }
        };
    }

    private async loadCredentials(source: 'gmail' | 'slack' | 'teams'): Promise<Record<string, string> | null> {
        const { data } = await supabase
            .from(`${source}_connections`)
            .select('*')
            .eq('user_id', this.userId)
            .single();
        
        return data;
    }

    public async initialize(): Promise<void> {
        if (this.config.sources.gmail) {
            const credentials = await this.loadCredentials('gmail');
            if (credentials) {
                this.sources.push(new GmailAdapter(this.userId, credentials));
            }
        }

        if (this.config.sources.slack) {
            const credentials = await this.loadCredentials('slack');
            if (credentials) {
                this.sources.push(new SlackAdapter(this.userId, credentials));
            }
        }

        if (this.config.sources.teams) {
            const credentials = await this.loadCredentials('teams');
            if (credentials) {
                this.sources.push(new TeamsAdapter(this.userId));
            }
        }
    }

    async process(): Promise<void> {
        if (this.sources.length === 0) {
            await this.initialize();
        }

        for (const source of this.sources) {
            try {
                await source.connect();
                const messages = await source.fetchMessages();

                for (const message of messages) {
                    await this.enqueueMessage(message);
                }
            } catch (error) {
                console.error(`Error processing messages from ${source.name}:`, error);
                throw error;
            }
        }
    }

    private async enqueueMessage(message: MessageContent): Promise<void> {
        const { error } = await supabase
            .from('message_queue')
            .insert({
                user_id: this.userId,
                message_id: message.id,
                source: message.source,
                sender: message.sender,
                subject: message.subject,
                content: message.content,
                timestamp: message.timestamp,
                raw_data: message.raw,
                status: 'pending',
                created_at: new Date().toISOString()
            });

        if (error) throw error;
    }
}
