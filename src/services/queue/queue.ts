import { supabase } from '../../integrations/supabase/client';
import type { MessageContent } from '../message-processor/types';
import type { QueueItem, QueueOptions, QueueProcessor, QueueMetrics } from './types';

export class MessageQueue {
    private static instance: MessageQueue;
    private processor: QueueProcessor | null = null;
    private isProcessing = false;
    private metrics: QueueMetrics = {
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

    setProcessor(processor: QueueProcessor): void {
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

        const { data, error } = await supabase
            .from('message_queue')
            .insert({
                user_id: userId,
                message_id: message.id,
                source: message.source,
                priority,
                max_retries: maxRetries,
                visible_after: visibleAfter,
                payload: message
            })
            .select('id')
            .single();

        if (error) throw error;
        return data.id;
    }

    async startProcessing(batchSize: number = 10, pollInterval: number = 1000): Promise<void> {
        if (!this.processor) {
            throw new Error('No processor set');
        }

        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        await this.processBatch(batchSize, pollInterval);
    }

    async stopProcessing(): Promise<void> {
        this.isProcessing = false;
    }

    private async processBatch(batchSize: number, pollInterval: number): Promise<void> {
        while (this.isProcessing) {
            try {
                // Get batch of messages
                const { data: items, error } = await supabase
                    .from('message_queue')
                    .select('*')
                    .in('status', ['pending'])
                    .lte('visible_after', new Date().toISOString())
                    .order('priority', { ascending: false })
                    .order('created_at', { ascending: true })
                    .limit(batchSize);

                if (error) throw error;

                if (items.length === 0) {
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    continue;
                }

                // Process items in parallel
                await Promise.all(
                    items.map(async (item: QueueItem) => {
                        try {
                            // Mark as processing
                            await this.updateItemStatus(item.id, 'processing');

                            const startTime = Date.now();
                            await this.processor!.processItem(item);
                            const processingTime = Date.now() - startTime;

                            // Update metrics
                            this.updateMetrics(processingTime, true);

                            // Mark as completed
                            await this.updateItemStatus(item.id, 'completed');
                        } catch (error) {
                            await this.handleProcessingError(item, error as Error);
                        }
                    })
                );
            } catch (error) {
                console.error('Error processing batch:', error);
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
        }
    }

    private async handleProcessingError(item: QueueItem, error: Error): Promise<void> {
        try {
            // Update metrics
            this.updateMetrics(0, false);

            // Call processor's error handler
            await this.processor!.handleError(item, error);

            const shouldRetry = item.retry_count < item.max_retries;
            if (shouldRetry) {
                // Calculate next retry time with exponential backoff
                const backoffDelay = Math.pow(2, item.retry_count) * 1000;
                const visibleAfter = new Date(Date.now() + backoffDelay).toISOString();

                await supabase
                    .from('message_queue')
                    .update({
                        status: 'pending',
                        retry_count: item.retry_count + 1,
                        visible_after: visibleAfter,
                        error: error.message
                    })
                    .eq('id', item.id);
            } else {
                await this.updateItemStatus(item.id, 'failed', error.message);
            }
        } catch (err) {
            console.error('Error handling processing error:', err);
        }
    }

    private async updateItemStatus(
        id: string,
        status: QueueItem['status'],
        error?: string
    ): Promise<void> {
        const { error: updateError } = await supabase
            .from('message_queue')
            .update({ status, error })
            .eq('id', id);

        if (updateError) throw updateError;
    }

    private updateMetrics(processingTime: number, success: boolean): void {
        if (success) {
            this.metrics.totalProcessed++;
            this.metrics.averageProcessingTime = (
                this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) +
                processingTime
            ) / this.metrics.totalProcessed;
        } else {
            this.metrics.totalFailed++;
        }
    }

    async getMetrics(): Promise<QueueMetrics> {
        // Get current queue stats
        const { data, error } = await supabase
            .from('message_queue')
            .select('status')
            .not('status', 'eq', 'completed');

        if (error) throw error;

        // Update items by status
        this.metrics.itemsByStatus = {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            cancelled: 0
        };

        data.forEach(item => {
            this.metrics.itemsByStatus[item.status as keyof typeof this.metrics.itemsByStatus]++;
        });

        this.metrics.itemsInQueue = data.length;

        return { ...this.metrics };
    }

    async clearQueue(userId?: string): Promise<void> {
        let query = supabase
            .from('message_queue')
            .delete()
            .in('status', ['pending', 'processing']);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { error } = await query;
        if (error) throw error;
    }
}
