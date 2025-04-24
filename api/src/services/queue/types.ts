import type { MessageContent } from '../message-processor/types.js';

export type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface QueueItem {
    id: string;
    user_id: string;
    message_id: string;
    source: string;
    priority: number;
    status: QueueItemStatus;
    retry_count: number;
    max_retries: number;
    visible_after: string;
    created_at: string;
    updated_at: string;
    payload: MessageContent;
    error?: string;
}

export interface QueueOptions {
    priority?: number;
    maxRetries?: number;
    visibilityTimeout?: number; // in seconds
}

export interface QueueProcessor {
    processItem(item: QueueItem): Promise<void>;
    handleError(item: QueueItem, error: Error): Promise<void>;
}

export interface QueueMetrics {
    totalProcessed: number;
    totalFailed: number;
    averageProcessingTime: number;
    itemsInQueue: number;
    itemsByStatus: Record<QueueItemStatus, number>;
}
