import { supabase } from '../../integrations/supabase/client';
import { ClaudeAPI } from '../../integrations/claude/api';
import { VoiceAPI } from '../../integrations/elevenlabs/api';
import { MessageCategory, MessageAction, ProcessedMessage, MessageContent } from './types';

export class MessageProcessor {
    private claudeApi: ClaudeAPI | null = null;
    private voiceApi: VoiceAPI | null = null;
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    public static async create(userId: string): Promise<MessageProcessor> {
        const processor = new MessageProcessor(userId);
        await processor.initialize();
        return processor;
    }

    private async initialize(): Promise<void> {
        this.claudeApi = await ClaudeAPI.create(this.userId);
        this.voiceApi = await VoiceAPI.create(this.userId);
    }

    public async processMessage(message: MessageContent, settings: { voice_enabled: boolean }): Promise<ProcessedMessage> {
        if (!this.claudeApi) throw new Error('Claude API not initialized');
        if (!this.voiceApi) throw new Error('Voice API not initialized');

        try {
            const { category, action, summary, prompt } = await this.claudeApi.analyze({
                subject: message.subject || '',
                content: message.content || '',
                sender: message.sender || ''
            });

            const processedMessage: ProcessedMessage = {
                ...message,
                category,
                action,
                summary: summary || '',
                prompt: prompt || '',
                requires_voice_response: action === MessageAction.GENERATE_PROMPT && settings.voice_enabled,
                processed_at: new Date().toISOString()
            };

            await this.saveProcessedMessage(processedMessage);

            if (processedMessage.requires_voice_response && prompt) {
                const voiceResponse = await this.voiceApi.generateResponse({
                    text: prompt,
                    messageId: message.id
                });

                await this.voiceApi.saveResponse({
                    messageId: message.id,
                    audioUrl: voiceResponse.audioUrl,
                    duration: voiceResponse.duration
                });
            }

            return processedMessage;
        } catch (error) {
            console.error('Error processing message:', error);
            throw error;
        }
    }

    private async saveProcessedMessage(message: ProcessedMessage): Promise<void> {
        const { error } = await supabase
            .from('processed_messages')
            .insert({
                user_id: this.userId,
                message_id: message.id,
                source: message.source,
                category: message.category,
                action: message.action,
                summary: message.summary,
                prompt: message.prompt,
                requires_voice_response: message.requires_voice_response,
                processed_at: message.processed_at,
                raw: message.raw
            });

        if (error) throw error;
    }
}
