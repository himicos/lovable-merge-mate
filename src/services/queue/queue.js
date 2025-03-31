import { supabase } from '../../integrations/supabase/client.js';
export class MessageQueue {
    constructor() {
        Object.defineProperty(this, "processor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isProcessing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
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
            }
        });
    }
    static getInstance() {
        if (!MessageQueue.instance) {
            MessageQueue.instance = new MessageQueue();
        }
        return MessageQueue.instance;
    }
    setProcessor(processor) {
        this.processor = processor;
    }
    async enqueue(message, userId, options = {}) {
        const { priority = 0, maxRetries = 3, visibilityTimeout = 30 } = options;
        const visibleAfter = new Date(Date.now() + visibilityTimeout * 1000).toISOString();
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
        if (error)
            throw error;
        return data.id;
    }
    async processQueue() {
        if (this.isProcessing || !this.processor)
            return;
        this.isProcessing = true;
        try {
            const { data: items } = await supabase
                .from('message_queue')
                .select('*')
                .eq('status', 'pending')
                .order('priority', { ascending: false })
                .order('created_at', { ascending: true })
                .limit(10);
            if (!items?.length)
                return;
            for (const item of items) {
                try {
                    const startTime = Date.now();
                    await this.processor(item.payload, item.user_id);
                    const processingTime = Date.now() - startTime;
                    await this.updateItemStatus(item.id, 'completed');
                    this.updateMetrics(processingTime, true);
                }
                catch (error) {
                    console.error('Error processing message:', error);
                    await this.updateItemStatus(item.id, 'failed', error instanceof Error ? error.message : String(error));
                    this.updateMetrics(0, false);
                }
            }
        }
        finally {
            this.isProcessing = false;
        }
    }
    async updateItemStatus(id, status, error) {
        await supabase
            .from('message_queue')
            .update({
            status,
            error,
            updated_at: new Date().toISOString()
        })
            .eq('id', id);
    }
    updateMetrics(processingTime, success) {
        if (success) {
            this.metrics.totalProcessed++;
            this.metrics.averageProcessingTime = ((this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) +
                processingTime) /
                this.metrics.totalProcessed);
        }
        else {
            this.metrics.totalFailed++;
        }
    }
}
