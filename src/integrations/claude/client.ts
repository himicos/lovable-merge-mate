import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../supabase/client';

let anthropicClient: Anthropic | null = null;

export const initClaudeClient = async () => {
    try {
        // Get the API key from Supabase auth user's metadata
        const { data: { user } } = await supabase.auth.getUser();
        const claudeApiKey = user?.user_metadata?.claude_api_key;

        if (!claudeApiKey) {
            throw new Error('Claude API key not found in user metadata');
        }

        anthropicClient = new Anthropic({
            apiKey: claudeApiKey,
        });

        return anthropicClient;
    } catch (error) {
        console.error('Failed to initialize Claude client:', error);
        throw error;
    }
};

export const getClaudeClient = async () => {
    if (!anthropicClient) {
        await initClaudeClient();
    }
    return anthropicClient;
};

export const sendMessage = async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string
) => {
    try {
        const client = await getClaudeClient();
        if (!client) {
            throw new Error('Claude client not initialized');
        }

        const response = await client.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4096,
            system: systemPrompt,
            messages: messages,
        });

        return response;
    } catch (error) {
        console.error('Error sending message to Claude:', error);
        throw error;
    }
};

export class ClaudeAPI {
    private static instance: ClaudeAPI;
    private apiKey: string | null = null;

    private constructor() {}

    public static getInstance(): ClaudeAPI {
        if (!ClaudeAPI.instance) {
            ClaudeAPI.instance = new ClaudeAPI();
        }
        return ClaudeAPI.instance;
    }

    private async initialize(): Promise<void> {
        if (this.apiKey) return;

        const { data, error } = await supabase
            .from('secrets')
            .select('claude_api_key')
            .single();

        if (error || !data?.claude_api_key) {
            throw new Error('Failed to get Claude API key');
        }

        this.apiKey = data.claude_api_key;
    }

    async complete(
        messages: Array<{ role: string; content: string }>,
        systemPrompt?: string
    ): Promise<any> {
        await this.initialize();

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': this.apiKey!,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 4096,
                system: systemPrompt,
                messages
            }),
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.statusText}`);
        }

        return response.json();
    }

    async analyze(message: any): Promise<{ category: string; summary?: string }> {
        const systemPrompt = `You are an AI assistant analyzing communications. 
        Categorize this message as one of: IMPORTANT (requires action), INDIRECTLY_RELEVANT (relevant but no action needed), 
        MARKETING (promotional/spam), or SYSTEM_ALERT (automated system message).
        If IMPORTANT or INDIRECTLY_RELEVANT, provide a brief summary.
        
        Respond in JSON format:
        {
            "category": "CATEGORY_HERE",
            "summary": "SUMMARY_HERE" // Only for IMPORTANT or INDIRECTLY_RELEVANT
        }`;

        const response = await this.complete([
            { role: 'user', content: JSON.stringify(message) }
        ], systemPrompt);

        try {
            const result = JSON.parse(response.content[0].text);
            return {
                category: result.category,
                summary: result.summary
            };
        } catch (error) {
            console.error('Error parsing Claude response:', error);
            throw error;
        }
    }

    async generatePrompt(message: any, summary: string): Promise<string> {
        const systemPrompt = `You are an AI assistant generating voice prompts for important messages.
        Create a clear, concise prompt that the user can respond to verbally.
        The prompt should summarize the key points and ask what action to take.`;

        const response = await this.complete([
            { 
                role: 'user', 
                content: `Message: ${JSON.stringify(message)}\nSummary: ${summary}`
            }
        ], systemPrompt);

        return response.content[0].text;
    }
}
