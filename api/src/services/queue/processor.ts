import { db } from '../database/client.js';
import { MessageProcessor } from '../message-processor/processor.js';
import { MessageContent } from '../message-processor/types.js';

export interface QueueItem {
    id: string;
    user_id: string;
    payload: MessageContent;
    created_at: string;
    processed_at?: string;
    error?: string;
}

export class QueueProcessor {
    private processor: MessageProcessor | null = null;

    private constructor() {}

    public static async create(): Promise<QueueProcessor> {
        return new QueueProcessor();
    }

    public async processItem(item: QueueItem): Promise<void> {
        try {
            // Get user settings for voice (default to false if not found)
            const result = await db.query(
                'SELECT voice_enabled FROM user_settings WHERE user_id = $1',
                [item.user_id]
            );

            const voiceEnabled = result.rows.length > 0 ? result.rows[0].voice_enabled : false;

            // Initialize processor for this user
            const processor = await MessageProcessor.create(item.user_id);

            // Process the message
            await processor.processMessage(item.payload, {
                voice_enabled: voiceEnabled
            });

            // Update queue item status
            await db.query(
                'UPDATE message_queue SET processed_at = $1 WHERE id = $2',
                [new Date().toISOString(), item.id]
            );

        } catch (error) {
            console.error('Failed to process queue item:', error);
            
            // Update queue item with error
            await db.query(
                'UPDATE message_queue SET error = $1, processed_at = $2 WHERE id = $3',
                [(error as Error).message, new Date().toISOString(), item.id]
            );

            throw error;
        }
    }
}
