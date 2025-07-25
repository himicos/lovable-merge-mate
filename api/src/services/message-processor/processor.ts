import { db } from '../database/client.js';
import { redis } from '../redis/client.js';
import { ClaudeAPI } from '../../integrations/ai/claude/api.js';
import { ElevenLabsClient } from '../../integrations/ai/voice/client.js';
import { MessageCategory, MessageAction, MessageContent, ProcessedMessage } from './types.js';

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
            const query = `
                INSERT INTO processed_messages (
                    id, user_id, original_message_id, source, sender, subject, 
                    content, category, action, summary, prompt, raw_data, 
                    requires_voice_response, processed_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `;
            
            const values = [
                processedMessage.id,
                processedMessage.user_id,
                processedMessage.id, // original_message_id
                processedMessage.source,
                processedMessage.sender,
                processedMessage.subject,
                processedMessage.content,
                processedMessage.category,
                processedMessage.action,
                processedMessage.summary,
                processedMessage.prompt,
                JSON.stringify(processedMessage.raw),
                processedMessage.requires_voice_response,
                processedMessage.processed_at
            ];

            await db.query(query, values);

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
