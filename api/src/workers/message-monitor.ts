
import { BaseWorker } from './base.js';
import type { MessageMonitorConfig, WorkerConfig } from './types.js';
import { GmailAdapter } from '../services/message-sources/gmail/adapter.js';
import { SlackAdapter } from '../services/message-sources/slack/adapter.js';
import { TeamsAdapter } from '../services/message-sources/teams/adapter.js';
import type { MessageSourceInterface } from '../services/message-processor/types.js';
import { db } from '../services/database/client.js';
import type { MessageContent } from '../services/message-processor/types.js';

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

    static async create(userId: string, workerConfig: Partial<MessageMonitorConfig> = {}): Promise<MessageMonitorWorker> {
        const worker = new MessageMonitorWorker(userId, workerConfig);
        await worker.initialize();
        return worker;
    }

    private async initialize(): Promise<void> {
        // Initialize message processor
        // this.processor = await MessageProcessor.create(this.userId);

        // Determine which integrations are enabled by checking presence of connection records
        // Gmail
        const gmailConn = await db.query(
            `SELECT access_token, refresh_token
             FROM gmail_connections
             WHERE user_id = $1
             LIMIT 1`,
            [this.userId]
        );

        if (gmailConn.rows.length) {
            this.sources.push(new GmailAdapter(this.userId, gmailConn.rows[0]));
        }

        // Slack
        const slackConn = await db.query(
            `SELECT access_token
             FROM slack_connections
             WHERE user_id = $1
             LIMIT 1`,
            [this.userId]
        );

        if (slackConn.rows.length) {
            this.sources.push(new SlackAdapter(this.userId, slackConn.rows[0]));
        }

        // Teams
        const teamsConn = await db.query(
            `SELECT access_token
             FROM teams_connections
             WHERE user_id = $1
             LIMIT 1`,
            [this.userId]
        );

        if (teamsConn.rows.length) {
            this.sources.push(new TeamsAdapter(this.userId, teamsConn.rows[0]));
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
        await db.query(
            `INSERT INTO message_queue (user_id, message_id, source, sender, subject, content, payload, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())`,
            [
                this.userId,
                message.id,
                message.source,
                message.sender,
                message.subject,
                message.content,
                JSON.stringify(message.raw ?? message)
            ]
        );
    }
}
