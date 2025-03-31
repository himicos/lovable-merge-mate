import { BaseWorker } from './base';
import type { MessageMonitorConfig, WorkerConfig } from './types';
import { GmailAdapter } from '../services/message-sources/gmail/adapter';
import { SlackAdapter } from '../services/message-sources/slack/adapter';
import { TeamsAdapter } from '../services/message-sources/teams/adapter';
import type { MessageSource } from '../services/message-sources/types';
import { supabase } from '../integrations/supabase/client';

export class MessageMonitorWorker extends BaseWorker {
    private sources: MessageSource[] = [];
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
            pollInterval: workerConfig.pollInterval ?? 60000, // 1 minute
            maxRetries: workerConfig.maxRetries ?? 3,
            retryDelay: workerConfig.retryDelay ?? 5000 // 5 seconds
        };

        super('message-monitor', baseConfig);

        this.userId = userId;
        this.config = {
            ...this.config,
            ...baseConfig,
            batchSize: workerConfig.batchSize ?? this.config.batchSize,
            sources: workerConfig.sources ?? this.config.sources
        };

        // Initialize message sources
        if (this.config.sources.gmail) {
            const gmail = new GmailAdapter();
            gmail.initialize({ userId }).catch(console.error);
            this.sources.push(gmail);
        }

        if (this.config.sources.slack) {
            const slack = new SlackAdapter();
            slack.initialize({ userId }).catch(console.error);
            this.sources.push(slack);
        }

        if (this.config.sources.teams) {
            const teams = new TeamsAdapter();
            teams.initialize({ userId }).catch(console.error);
            this.sources.push(teams);
        }
    }

    async process(): Promise<void> {
        for (const source of this.sources) {
            try {
                await source.connect();
                const messages = await source.fetchMessages();

                for (const message of messages) {
                    await this.enqueueMessage(message);
                }
            } catch (error) {
                console.error(`Error processing messages from ${source.name}:`, error);
                throw error; // Let base worker handle retry logic
            }
        }
    }

    private async enqueueMessage(message: any): Promise<void> {
        const { error } = await supabase
            .from('message_queue')
            .insert({
                user_id: this.userId,
                message_id: message.id,
                source: message.source,
                priority: 1,
                status: 'pending',
                retry_count: 0,
                max_retries: this.config.maxRetries,
                next_retry_at: null
            });

        if (error) {
            console.error('Error enqueueing message:', error);
            throw error;
        }
    }
}
