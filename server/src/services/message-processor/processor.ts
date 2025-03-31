import { ClaudeAPI } from '../../integrations/claude/api';
import { VoiceAPI } from '../../integrations/elevenlabs/api';
import { supabase } from '../../integrations/supabase/client';
import { ProcessedMessage, MessageContent, MessageCategory, MessageAction } from './types';

export class MessageProcessor {
    private claudeApi: ClaudeAPI;
    private voiceApi: VoiceAPI;
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
        this.claudeApi = new ClaudeAPI(userId);
        this.voiceApi = new VoiceAPI(userId);
    }

    public async processMessage(message: MessageContent): Promise<ProcessedMessage> {
        const { data: settings } = await supabase
            .from('user_settings')
            .select('voice_enabled')
            .eq('user_id', this.userId)
            .single();

        const analysis = await this.claudeApi.analyze({
            subject: message.subject,
            content: message.content,
            sender: message.sender
        });

        const processedMessage: ProcessedMessage = {
            ...message,
            category: analysis.category,
            action: analysis.action,
            summary: analysis.summary,
            prompt: analysis.prompt,
            requires_voice_response: analysis.action === MessageAction.GENERATE_PROMPT && settings?.voice_enabled,
            processed_at: new Date().toISOString()
        };

        await this.saveProcessedMessage(processedMessage);

        if (processedMessage.requires_voice_response) {
            await this.generateVoiceResponse(processedMessage);
        }

        return processedMessage;
    }

    private async saveProcessedMessage(message: ProcessedMessage): Promise<void> {
        const { error } = await supabase
            .from('processed_messages')
            .insert({
                user_id: this.userId,
                message_id: message.id,
                source: message.source,
                sender: message.sender,
                subject: message.subject,
                content: message.content,
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

    private async generateVoiceResponse(message: ProcessedMessage): Promise<void> {
        try {
            const response = await this.voiceApi.generateResponse({
                text: message.prompt || message.summary,
                messageId: message.id
            });

            await this.voiceApi.saveResponse({
                messageId: message.id,
                audioUrl: response.audioUrl,
                duration: response.duration
            });
        } catch (error) {
            console.error('Error generating voice response:', error);
            throw error;
        }
    }
}
