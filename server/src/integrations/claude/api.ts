import { sendMessage } from './client';
import type { ClaudeMessage } from './types';

export class ClaudeAPI {
    private static instance: ClaudeAPI;
    private constructor() {}

    public static getInstance(): ClaudeAPI {
        if (!ClaudeAPI.instance) {
            ClaudeAPI.instance = new ClaudeAPI();
        }
        return ClaudeAPI.instance;
    }

    async chat(messages: ClaudeMessage[], systemPrompt?: string) {
        try {
            const response = await sendMessage(messages, systemPrompt);
            return response;
        } catch (error) {
            console.error('Error in Claude chat:', error);
            throw error;
        }
    }

    async complete(prompt: string, systemPrompt?: string) {
        try {
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
}
