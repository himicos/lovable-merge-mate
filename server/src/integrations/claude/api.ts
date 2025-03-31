import { sendMessage } from './client';
import type { ClaudeMessage } from './types';
import { supabase } from '../supabase/client';
import { MessageCategory, MessageAction } from '../../services/message-processor/types';
import { Configuration, OpenAIApi } from 'openai';

interface AnalysisResult {
    category: MessageCategory;
    action: MessageAction;
    summary?: string;
    prompt?: string;
}

interface AnalysisInput {
    subject: string;
    content: string;
    sender: string;
}

export class ClaudeAPI {
    private api: OpenAIApi | null = null;
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
        const { data: { session } } = await supabase.auth.getSession();
        const apiKey = session?.user?.user_metadata?.claude_api_key;

        if (!apiKey) {
            throw new Error('Claude API key not found in user metadata');
        }

        this.api = new OpenAIApi(new Configuration({ apiKey }));
    }

    async chat(messages: ClaudeMessage[], systemPrompt?: string) {
        try {
            if (!this.api) throw new Error('API not initialized');
            const response = await sendMessage(messages, systemPrompt);
            return response;
        } catch (error) {
            console.error('Error in Claude chat:', error);
            throw error;
        }
    }

    async complete(prompt: string, systemPrompt?: string) {
        try {
            if (!this.api) throw new Error('API not initialized');
            const messages: ClaudeMessage[] = [{
                role: 'user',
                content: prompt
            }];
            
            const response = await sendMessage(messages, systemPrompt);
            return response;
        } catch (error) {
            console.error('Error in Claude completion:', error);
            throw error;
        }
    }

    public async analyze(input: AnalysisInput): Promise<AnalysisResult> {
        if (!this.api) throw new Error('API not initialized');

        try {
            const analysisPrompt = `
                Analyze this message:
                From: ${input.sender}
                Subject: ${input.subject}
                Content: ${input.content}

                Categorize it as one of:
                - IMPORTANT (requires immediate action)
                - INDIRECTLY_RELEVANT (good to know)
                - MARKETING (promotional)
                - SYSTEM_ALERT (system notification)
                - UNKNOWN (can't determine)

                Also provide a brief summary and suggest an action if needed.
            `;

            const response = await this.api.createChatCompletion({
                model: 'gpt-4',
                messages: [{ role: 'user', content: analysisPrompt }],
                temperature: 0.3,
                max_tokens: 500
            });

            const result = response.data.choices[0]?.message?.content;
            if (!result) throw new Error('No analysis result from Claude');

            // Parse the result to extract category, action, and summary
            const lines = result.split('\n');
            const category = this.parseCategory(lines.find((line: string) => line.includes('Category:')) || '');
            const action = this.determineAction(category);
            const summary = lines.find((line: string) => line.includes('Summary:'))?.replace('Summary:', '').trim();
            const responsePrompt = category === MessageCategory.IMPORTANT ? 
                this.generatePrompt(input, summary || '') : undefined;

            return { category, action, summary, prompt: responsePrompt };
        } catch (error) {
            console.error('Error analyzing message with Claude:', error);
            return {
                category: MessageCategory.UNKNOWN,
                action: MessageAction.MARK_READ
            };
        }
    }

    private parseCategory(categoryLine: string): MessageCategory {
        if (categoryLine.includes('IMPORTANT')) return MessageCategory.IMPORTANT;
        if (categoryLine.includes('INDIRECTLY_RELEVANT')) return MessageCategory.INDIRECTLY_RELEVANT;
        if (categoryLine.includes('MARKETING')) return MessageCategory.MARKETING;
        if (categoryLine.includes('SYSTEM_ALERT')) return MessageCategory.SYSTEM_ALERT;
        return MessageCategory.UNKNOWN;
    }

    private determineAction(category: MessageCategory): MessageAction {
        switch (category) {
            case MessageCategory.IMPORTANT:
                return MessageAction.GENERATE_PROMPT;
            case MessageCategory.INDIRECTLY_RELEVANT:
                return MessageAction.CREATE_SUMMARY;
            case MessageCategory.MARKETING:
                return MessageAction.MARK_READ;
            case MessageCategory.SYSTEM_ALERT:
                return MessageAction.MOVE;
            default:
                return MessageAction.MARK_READ;
        }
    }

    private generatePrompt(input: AnalysisInput, summary: string): string {
        return `Based on this message:
            From: ${input.sender}
            Subject: ${input.subject}
            Summary: ${summary}

            Here's what you should do:
            1. Review the message content
            2. Take appropriate action based on the summary
            3. Respond if necessary`;
    }
}
