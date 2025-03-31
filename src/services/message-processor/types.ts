import type { Json } from '../../integrations/supabase/types';

export enum MessageSource {
    EMAIL = 'email',
    SLACK = 'slack',
    TEAMS = 'teams'
}

export enum MessageCategory {
    IMPORTANT = 'important',
    INDIRECTLY_RELEVANT = 'indirectly_relevant',
    MARKETING = 'marketing',
    SYSTEM_ALERT = 'system_alert'
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
    raw?: Json;
    [key: string]: Json | undefined; 
}

export interface ProcessedMessage {
    id: string;
    originalMessage: MessageContent;
    category: MessageCategory;
    action: MessageAction;
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

export type QueueProcessor = (message: MessageContent, userId: string) => Promise<void>;
