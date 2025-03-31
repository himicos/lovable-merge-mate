import { ClaudeAPI } from '../../integrations/claude';
import { VoiceAPI } from '../../integrations/elevenlabs';
import { supabase } from '../../integrations/supabase/client';
import type { MessageContent, ProcessedMessage, UserSettings } from './types';
import { MessageCategory, MessageAction } from './types';

export class MessageProcessor {
    private static instance: MessageProcessor;
    private claudeApi: ClaudeAPI;
    private voiceApi: VoiceAPI;

    private constructor() {
        this.claudeApi = ClaudeAPI.getInstance();
        this.voiceApi = VoiceAPI.getInstance();
    }

    public static getInstance(): MessageProcessor {
        if (!MessageProcessor.instance) {
            MessageProcessor.instance = new MessageProcessor();
        }
        return MessageProcessor.instance;
    }

    private async getUserSettings(userId: string): Promise<UserSettings> {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return {
            marketing_email_policy: data.marketing_email_policy as 'trash' | 'leave',
            system_alert_policy: data.system_alert_policy as 'trash' | 'leave',
            voice_enabled: data.voice_enabled,
            auto_process_enabled: data.auto_process_enabled
        };
    }

    private async analyzeMessage(message: MessageContent): Promise<{category: MessageCategory; summary?: string}> {
        const response = await this.claudeApi.analyze(message);
        return {
            category: response.category as MessageCategory,
            summary: response.summary
        };
    }

    private determineAction(category: MessageCategory, settings: UserSettings): MessageAction {
        switch (category) {
            case MessageCategory.IMPORTANT:
                return MessageAction.GENERATE_PROMPT;
            
            case MessageCategory.INDIRECTLY_RELEVANT:
                return MessageAction.CREATE_SUMMARY;
            
            case MessageCategory.MARKETING:
                return settings.marketing_email_policy === 'trash' ? 
                    MessageAction.MOVE : MessageAction.MARK_READ;
            
            case MessageCategory.SYSTEM_ALERT:
                return settings.system_alert_policy === 'trash' ? 
                    MessageAction.MOVE : MessageAction.MARK_READ;
            
            default:
                return MessageAction.MARK_READ;
        }
    }

    private async generatePrompt(message: MessageContent, summary: string): Promise<string> {
        return this.claudeApi.generatePrompt(message, summary);
    }

    async processMessage(message: MessageContent, userId: string): Promise<ProcessedMessage> {
        try {
            const settings = await this.getUserSettings(userId);
            const { category, summary } = await this.analyzeMessage(message);
            const action = this.determineAction(category, settings);

            let prompt: string | undefined;
            if (action === MessageAction.GENERATE_PROMPT) {
                prompt = await this.generatePrompt(message, summary!);
                
                // If voice is enabled, speak the prompt
                if (settings.voice_enabled) {
                    await this.voiceApi.speakText(prompt);
                }
            }

            const processedMessage: ProcessedMessage = {
                id: message.id,
                originalMessage: message,
                category,
                action,
                summary,
                prompt,
                requires_voice_response: action === MessageAction.GENERATE_PROMPT && settings.voice_enabled,
                processed_at: new Date().toISOString()
            };

            // Store the processed message in Supabase
            await this.storeProcessedMessage(processedMessage, userId);

            return processedMessage;
        } catch (error) {
            console.error('Error processing message:', error);
            throw error;
        }
    }

    private async storeProcessedMessage(message: ProcessedMessage, userId: string): Promise<void> {
        const { error } = await supabase
            .from('processed_messages')
            .insert({
                id: message.id,
                user_id: userId,
                original_message_id: message.originalMessage.id,
                source: message.originalMessage.source,
                sender: message.originalMessage.sender,
                subject: message.originalMessage.subject,
                content: message.originalMessage.content,
                category: message.category,
                action: message.action,
                summary: message.summary,
                prompt: message.prompt,
                requires_voice_response: message.requires_voice_response,
                processed_at: message.processed_at,
                raw_data: message.originalMessage.raw
            });

        if (error) throw error;
    }

    async handleVoiceResponse(messageId: string, userId: string): Promise<string> {
        try {
            const response = await this.voiceApi.startListening();
            
            // Store the voice response in Supabase
            const { error } = await supabase
                .from('message_responses')
                .insert({
                    message_id: messageId,
                    user_id: userId,
                    response_text: response,
                    response_type: 'voice',
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
            return response;
        } catch (error) {
            console.error('Error handling voice response:', error);
            throw error;
        }
    }
}
