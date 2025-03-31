import type { Json } from '../../integrations/supabase/types.js';

export enum MessageSource {
    EMAIL = 'EMAIL',
    GMAIL = 'GMAIL',
    SLACK = 'SLACK',
    TEAMS = 'TEAMS'
}

export enum MessageCategory {
    IMPORTANT = 'IMPORTANT',
    INDIRECTLY_RELEVANT = 'INDIRECTLY_RELEVANT',
    UNRELATED = 'UNRELATED',
    SYSTEM_ALERT = 'SYSTEM_ALERT',
    MARKETING = 'MARKETING',
    UNKNOWN = 'UNKNOWN'
}

export enum MessageAction {
    VOICE_RESPONSE = 'VOICE_RESPONSE',
    SAVE_FOR_LATER = 'SAVE_FOR_LATER',
    ARCHIVE = 'ARCHIVE',
    DELETE = 'DELETE',
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
    raw: Record<string, any>;
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

export interface MessageSourceConfig {
    userId: string;
    credentials: Record<string, any>;
}

export interface MessageSourceInterface {
    connect(): Promise<void>;
    fetchMessages(): Promise<MessageContent[]>;
    name: string;
}

export interface QueueProcessor {
    (message: MessageContent, userId: string): Promise<void>;
}
