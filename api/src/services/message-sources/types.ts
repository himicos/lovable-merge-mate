import type { Json } from '../../integrations/auth/database.types.js';
import { MessageContent, MessageSource as MessageSourceEnum } from '../message-processor/types.js';

export interface MessageSourceConfig {
    userId: string;
    credentials: {
        access_token: string;
        refresh_token?: string;
        expiry_date?: number;
    };
}

export interface MessageSourceMetadata {
    lastSyncTime?: string;
    nextSyncTime?: string;
    totalMessages?: number;
    unreadMessages?: number;
}

export interface MessageFilter {
    since?: string;
    until?: string;
    limit?: number;
    unreadOnly?: boolean;
}

export interface MessageSourceInterface {
    readonly name: string;
    readonly sourceType: MessageSourceEnum;
    initialize(config: MessageSourceConfig): Promise<void>;
    disconnect(): Promise<void>;
    fetchMessages(filter?: MessageFilter): Promise<MessageContent[]>;
    getMetadata(): Promise<MessageSourceMetadata>;
}

export type { MessageContent };
export { MessageSourceEnum as MessageSource };
