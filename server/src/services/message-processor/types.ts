import type { Json } from '../../integrations/supabase/types.js';

export enum MessageSource {
    EMAIL = 'email',
    GMAIL = 'gmail',
    SLACK = 'slack',
    TEAMS = 'teams'
}

export enum MessageCategory {
    IMPORTANT = 'important',
    INDIRECT = 'indirect',
    MARKETING = 'marketing',
    SYSTEM = 'system',
    UNKNOWN = 'unknown'
}

export enum MessageAction {
    GENERATE_PROMPT = 'generate_prompt',
    CREATE_SUMMARY = 'create_summary',
    MARK_READ = 'mark_read',
    MOVE = 'move'
}

export interface MessageContent {
    id: string;
    source: MessageSource;
    sender: string;
    subject?: string;
    content: string;
    timestamp: string;
    raw: Json;
    [key: string]: Json | undefined; 
}

export interface ProcessedMessage extends MessageContent {
    category: MessageCategory;
    action?: MessageAction;
    summary?: string;
    prompt?: string;
    requires_voice_response: boolean;
    processed_at: string;
}

export interface UserSettings {
    marketing_email_policy: 'trash' | 'leave';
    system_alert_policy: 'trash' | 'leave';
    voice_enabled: boolean;
    auto_process_enabled: boolean;
}

export interface QueueProcessor {
    (message: MessageContent, userId: string): Promise<void>;
}
