import { supabase } from '../../integrations/supabase/client';
import { MessageProcessor } from '../message-processor/processor';
import { MessageContent } from '../message-processor/types';

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
            // Get user settings for voice
            const { data: settings } = await supabase
                .from('user_settings')
                .select('voice_enabled')
                .eq('user_id', item.user_id)
                .single();

            if (!settings) {
                throw new Error('User settings not found');
            }

            // Initialize processor for this user
            const processor = await MessageProcessor.create(item.user_id);

            // Process the message
            await processor.processMessage(item.payload, {
                voice_enabled: settings.voice_enabled
            });

            // Update queue item status
            await supabase
                .from('message_queue')
                .update({
                    processed_at: new Date().toISOString()
                })
                .eq('id', item.id);

        } catch (error) {
            console.error('Failed to process queue item:', error);
            
            // Update queue item with error
            await supabase
                .from('message_queue')
                .update({
                    error: (error as Error).message,
                    processed_at: new Date().toISOString()
                })
                .eq('id', item.id);

            throw error;
        }
    }
}
