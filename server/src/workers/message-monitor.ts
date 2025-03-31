import { BaseWorker } from './base';
import type { MessageMonitorConfig, WorkerConfig } from './types';
import { GmailAdapter } from '../services/message-sources/gmail/adapter';
import { SlackAdapter } from '../services/message-sources/slack/adapter';
import { TeamsAdapter } from '../services/message-sources/teams/adapter';
import type { MessageSourceInterface } from '../services/message-processor/types';
import { supabase } from '../integrations/supabase/client';
import type { MessageContent } from '../services/message-processor/types';

interface GmailCredentials {
    access_token: string;
    refresh_token: string;
}

interface SlackCredentials {
    access_token: string;
}

interface TeamsCredentials {
    access_token: string;
}

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

    private static async create(userId: string, workerConfig: Partial<MessageMonitorConfig> = {}): Promise<MessageMonitorWorker> {
        const worker = new MessageMonitorWorker(userId, workerConfig);
        await worker.initialize();
        return worker;
    }

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

    private async initialize(): Promise<void> {
        // Initialize message processor
        // this.processor = await MessageProcessor.create(this.userId);

        // Get user settings
        const { data: settings } = await supabase
            .from('user_settings')
            .select('gmail_enabled, teams_enabled, slack_enabled')
            .eq('user_id', this.userId)
            .single();

        if (!settings) {
            throw new Error('User settings not found');
        }

        // Get credentials
        const { data: credentials } = await supabase
            .from('user_credentials')
            .select('gmail_credentials, teams_credentials, slack_credentials')
            .eq('user_id', this.userId)
            .single();

        // Initialize enabled sources
        if (settings.gmail_enabled && credentials?.gmail_credentials) {
            this.sources.push(new GmailAdapter(
                this.userId,
                credentials.gmail_credentials
            ));
        }

        if (settings.teams_enabled && credentials?.teams_credentials) {
            this.sources.push(new TeamsAdapter(
                this.userId,
                credentials.teams_credentials
            ));
        }

        if (settings.slack_enabled && credentials?.slack_credentials) {
            this.sources.push(new SlackAdapter(
                this.userId,
                credentials.slack_credentials
            ));
        }
    }

    public async start(): Promise<void> {
        if (this.config.enabled) {
            while (true) {
                try {
                    await this.process();
                    await new Promise(resolve => setTimeout(resolve, this.config.pollInterval)); // Wait for poll interval
                } catch (error) {
                    console.error('Error in message monitor loop:', error);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay)); // Wait for retry delay on error
                }
            }
        }
    }

    public async stop(): Promise<void> {
        this.config.enabled = false;
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
