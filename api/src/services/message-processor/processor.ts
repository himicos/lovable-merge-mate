import { db } from '../database/client.js';
import { redis } from '../redis/client.js';
import { ClaudeAPI } from '../../integrations/ai/claude/api.js';
import { ElevenLabsClient } from '../../integrations/ai/voice/client.js';
import { MessageCategory, MessageAction, MessageContent, ProcessedMessage } from './types.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

interface ProcessorConfig {
    voice_enabled: boolean;
}

interface MessageAnalysis {
    category: MessageCategory;
    action: MessageAction;
    summary: string;
    prompt: string;
}

interface ClaudeAnalysisInput {
    subject: string;
    content: string;
    sender: string;
}

export class MessageProcessor {
    private claudeAPI: ClaudeAPI | null = null;
    private voiceAPI: ElevenLabsClient | null = null;
    private userId: string;

    private constructor(userId: string) {
        this.userId = userId;
    }

    public static async create(userId: string): Promise<MessageProcessor> {
        const processor = new MessageProcessor(userId);
        await processor.initialize();
        return processor;
    }

    private async initialize(): Promise<void> {
        this.claudeAPI = await ClaudeAPI.create(this.userId);
        this.voiceAPI = ElevenLabsClient.getInstance();
        await this.voiceAPI.initializeApiKey();
    }

    private async analyzeMessage(message: MessageContent): Promise<MessageAnalysis> {
        if (!this.claudeAPI) {
            throw new Error('Claude API not initialized');
        }

        const analysisInput: ClaudeAnalysisInput = {
            subject: message.subject ?? '',
            content: message.content,
            sender: message.sender
        };

        const result = await this.claudeAPI.analyze(analysisInput);

        return {
            category: result.category as MessageCategory,
            action: result.action as MessageAction,
            summary: result.summary ?? '',
            prompt: result.prompt ?? ''
        };
    }

    public async processMessage(message: MessageContent, config: ProcessorConfig): Promise<void> {
        try {
            // Analyze message with Claude
            const analysis = await this.analyzeMessage(message);
            
            // Create processed message
            const processedMessage: ProcessedMessage = {
                id: message.id,
                user_id: this.userId,
                source: message.source,
                sender: message.sender,
                subject: message.subject ?? '',
                content: message.content,
                category: analysis.category,
                action: analysis.action,
                summary: analysis.summary,
                prompt: analysis.prompt,
                requires_voice_response: analysis.action === MessageAction.GENERATE_PROMPT && config.voice_enabled,
                processed_at: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                raw: message.raw ?? {}
            };

            // Save to database
            const { error } = await supabase
                .from('processed_messages')
                .insert(processedMessage);

            if (error) {
                throw new Error(`Failed to save processed message: ${error.message}`);
            }

            // Generate voice response if needed
            if (processedMessage.requires_voice_response && this.voiceAPI) {
                try {
                    const audioBlob = await this.voiceAPI.textToSpeech({
                        text: processedMessage.prompt,
                        voice_id: this.voiceAPI.defaultVoiceId
                    });
                } catch (error) {
                    console.error('Failed to generate voice response:', error);
                }
            }
        } catch (error) {
            console.error('Error processing message:', error);
            throw error;
        }
    }
}
