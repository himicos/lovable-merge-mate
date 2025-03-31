import { ClaudeAPI } from '../../integrations/claude';
import { VoiceAPI } from '../../integrations/elevenlabs';
import { supabase } from '../../integrations/supabase/client';
import type { MessageContent, ProcessedMessage, UserSettings } from './types';
import { MessageCategory, MessageAction, MessageSource } from './types';

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
        const { data: settings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        if (!settings) throw new Error('User settings not found');

        return settings as UserSettings;
    }

    private async analyzeMessage(message: MessageContent): Promise<{ category: MessageCategory; summary?: string }> {
        try {
            const result = await this.claudeApi.analyzeMessage(message);
            return {
                category: result.category || MessageCategory.UNKNOWN,
                summary: result.summary
            };
        } catch (error) {
            console.error('Error analyzing message:', error);
            return { category: MessageCategory.UNKNOWN };
        }
    }

    private determineAction(category: MessageCategory, settings: UserSettings): MessageAction {
        switch (category) {
            case MessageCategory.IMPORTANT:
                return MessageAction.GENERATE_PROMPT;
            case MessageCategory.INDIRECTLY_RELEVANT:
                return MessageAction.CREATE_SUMMARY;
            case MessageCategory.MARKETING:
                return settings.marketing_email_policy === 'trash' ? MessageAction.DELETE : MessageAction.MARK_READ;
            case MessageCategory.SYSTEM_ALERT:
                return MessageAction.MOVE;
            default:
                return MessageAction.MARK_READ;
        }
    }

    private async generatePrompt(message: MessageContent, summary: string): Promise<string> {
        return this.claudeApi.generatePrompt(message, summary);
    }

    public async processMessage(message: MessageContent, userId: string): Promise<ProcessedMessage> {
        try {
            const settings = await this.getUserSettings(userId);
            const { category, summary } = await this.analyzeMessage(message);
            const action = this.determineAction(category, settings);
            let prompt: string | undefined;

            if (action === MessageAction.GENERATE_PROMPT) {
                prompt = await this.generatePrompt(message, summary!);
                
                if (settings.voice_enabled) {
                    await this.voiceApi.speakText(prompt);
                }
            }

            const processedMessage: ProcessedMessage = {
                ...message,
                category,
                action,
                summary,
                prompt,
                requires_voice_response: action === MessageAction.GENERATE_PROMPT && settings.voice_enabled,
                processed_at: new Date().toISOString()
            };

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
                source: message.source,
                sender: message.sender,
                subject: message.subject,
                content: message.content,
                timestamp: message.timestamp,
                category: message.category,
                action: message.action,
                summary: message.summary,
                prompt: message.prompt,
                requires_voice_response: message.requires_voice_response,
                processed_at: message.processed_at,
                raw_data: message.raw
            });

        if (error) throw error;
    }

    public async handleVoiceResponse(messageId: string, userId: string): Promise<string> {
        const response = await this.voiceApi.recordResponse();
        if (!response) throw new Error('No voice response recorded');

        const { error } = await supabase
            .from('message_responses')
            .insert({
                message_id: messageId,
                user_id: userId,
                response,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return response;
    }
}
