import { MessageCategory, MessageAction } from '../../../services/message-processor/types.js';
import { supabase } from '../../supabase/client.js';
import Anthropic from '@anthropic-ai/sdk';

interface ClaudeResponse {
    category: MessageCategory;
    action: MessageAction;
    summary?: string;
    prompt?: string;
}

export class ClaudeAPI {
    private client: Anthropic | null = null;
    private userId: string;

    private constructor(userId: string) {
        this.userId = userId;
    }

    public static async create(userId: string): Promise<ClaudeAPI> {
        const api = new ClaudeAPI(userId);
        await api.initialize();
        return api;
    }

    private async initialize(): Promise<void> {
        const { data: settings } = await supabase
            .from('user_settings')
            .select('claude_api_key')
            .eq('user_id', this.userId)
            .single();

        if (!settings?.claude_api_key) {
            throw new Error('Claude API key not found in user settings');
        }

        this.client = new Anthropic({
            apiKey: settings.claude_api_key
        });
    }

    public async analyze(input: { subject: string; content: string; sender: string }): Promise<ClaudeResponse> {
        if (!this.client) {
            throw new Error('Claude API not initialized');
        }

        try {
            const prompt = `Analyze this message and categorize it:
Subject: ${input.subject}
From: ${input.sender}
Content: ${input.content}

Provide a JSON response with:
1. category (important/indirect/marketing/system)
2. action (generate_prompt/summarize/mark_read/move)
3. summary (brief description)
4. prompt (if action is generate_prompt)`;

            const response = await this.client.messages.create({
                model: 'claude-3-opus-20240229',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            });

            const result = JSON.parse(response.content[0].text);

            // Map the response to our enums
            const category = this.mapCategory(result.category);
            const action = this.mapAction(result.action);

            return {
                category,
                action,
                summary: result.summary,
                prompt: result.prompt
            };

        } catch (error) {
            console.error('Error analyzing message with Claude:', error);
            return {
                category: MessageCategory.MARKETING,
                action: MessageAction.MARK_READ
            };
        }
    }

    private mapCategory(category: string): MessageCategory {
        switch (category.toLowerCase()) {
            case 'important':
                return MessageCategory.IMPORTANT;
            case 'indirect':
                return MessageCategory.INDIRECT;
            case 'system':
                return MessageCategory.SYSTEM;
            case 'marketing':
            default:
                return MessageCategory.MARKETING;
        }
    }

    private mapAction(action: string): MessageAction {
        switch (action.toLowerCase()) {
            case 'generate_prompt':
                return MessageAction.GENERATE_PROMPT;
            case 'summarize':
                return MessageAction.SUMMARIZE;
            case 'move':
                return MessageAction.MOVE;
            case 'mark_read':
            default:
                return MessageAction.MARK_READ;
        }
    }
}
