// Switched from Supabase to direct Postgres queries via the shared database client
import { db } from '../database/client.js';
import type { MessageContent } from '../message-processor/types.js';
import type { QueueItem, QueueOptions } from './types.js';

export class MessageQueue {
    private static instance: MessageQueue;
    private processor: ((message: MessageContent, userId: string) => Promise<void>) | null = null;
    private isProcessing = false;
    private metrics = {
        totalProcessed: 0,
        totalFailed: 0,
        averageProcessingTime: 0,
        itemsInQueue: 0,
        itemsByStatus: {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            cancelled: 0
        }
    };

    private constructor() {}

    public static getInstance(): MessageQueue {
        if (!MessageQueue.instance) {
            MessageQueue.instance = new MessageQueue();
        }
        return MessageQueue.instance;
    }

    setProcessor(processor: (message: MessageContent, userId: string) => Promise<void>): void {
        this.processor = processor;
    }

    async enqueue(
        message: MessageContent,
        userId: string,
        options: QueueOptions = {}
    ): Promise<string> {
        const {
            priority = 0,
            maxRetries = 3,
            visibilityTimeout = 30
        } = options;

        const visibleAfter = new Date(
            Date.now() + visibilityTimeout * 1000
        ).toISOString();

        const result = await db.query(
            `INSERT INTO message_queue (user_id, message_id, source, priority, max_retries, visible_after, payload)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
                userId,
                message.id,
                message.source,
                priority,
                maxRetries,
                visibleAfter,
                JSON.stringify(message)
            ]
        );

        return result.rows[0].id as string;
    }

    async processQueue(): Promise<void> {
        if (this.isProcessing || !this.processor) return;

        this.isProcessing = true;
        try {
            const { rows: items } = await db.query(
                `SELECT *
                 FROM message_queue
                 WHERE status = 'pending'
                   AND visible_after <= NOW()
                 ORDER BY priority DESC, created_at ASC
                 LIMIT 10`
            );

            if (!items.length) return;

            for (const item of items) {
                try {
                    const startTime = Date.now();
                    await this.processor(item.payload, item.user_id);
                    const processingTime = Date.now() - startTime;

                    await this.updateItemStatus(item.id, 'completed');
                    this.updateMetrics(processingTime, true);
                } catch (error) {
                    console.error('Error processing message:', error);
                    await this.updateItemStatus(item.id, 'failed', error instanceof Error ? error.message : String(error));
                    this.updateMetrics(0, false);
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    private async updateItemStatus(
        id: string,
        status: QueueItem['status'],
        error?: string
    ): Promise<void> {
        await db.query(
            `UPDATE message_queue
             SET status = $1,
                 error = $2,
                 updated_at = NOW()
             WHERE id = $3`,
            [status, error ?? null, id]
        );
    }

    private updateMetrics(processingTime: number, success: boolean): void {
        if (success) {
            this.metrics.totalProcessed++;
            this.metrics.averageProcessingTime = (
                (this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) +
                    processingTime) /
                this.metrics.totalProcessed
            );
        } else {
            this.metrics.totalFailed++;
        }
    }
}
