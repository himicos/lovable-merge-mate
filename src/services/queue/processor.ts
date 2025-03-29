import { MessageProcessor } from '../message-processor/processor';
import type { QueueItem, QueueProcessor } from './types';

export class MessageQueueProcessor implements QueueProcessor {
    private messageProcessor: MessageProcessor;

    constructor() {
        this.messageProcessor = MessageProcessor.getInstance();
    }

    async processItem(item: QueueItem): Promise<void> {
        try {
            await this.messageProcessor.processMessage(
                item.payload,
                item.user_id
            );
        } catch (error) {
            throw new Error(`Failed to process message: ${(error as Error).message}`);
        }
    }

    async handleError(item: QueueItem, error: Error): Promise<void> {
        // Log the error
        console.error(`Error processing message ${item.message_id}:`, error);

        // Here we could implement additional error handling:
        // - Send notifications to admins
        // - Log to error tracking service
        // - Update user's error statistics
        // - etc.
    }
}
