import type { MessageContent } from '../message-processor/types';

export interface MessageSourceConfig {
    userId: string;
    enabled?: boolean;
    pollInterval?: number;
    credentials?: Record<string, any>;
}

export interface MessageFilter {
    since?: Date;
    until?: Date;
    limit?: number;
    labels?: string[];
    folders?: string[];
    channels?: string[];
    [key: string]: any;
}

export interface MessageSourceMetadata {
    lastSyncTime?: string;
    cursor?: string;
    nextPageToken?: string;
    [key: string]: any;
}

export interface MessageSource {
    readonly name: string;
    readonly sourceType: 'email' | 'slack' | 'teams';
    
    initialize(config: MessageSourceConfig): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    
    // Get new messages since last sync
    fetchMessages(filter?: MessageFilter): Promise<any[]>;
    
    // Mark message as read/moved
    markMessageAsRead(messageId: string): Promise<void>;
    moveMessage(messageId: string, destination: string): Promise<void>;
    
    // Get and update source metadata
    getMetadata(): MessageSourceMetadata;
    updateMetadata(metadata: Partial<MessageSourceMetadata>): Promise<void>;
    
    // Health check
    isHealthy(): Promise<boolean>;
}
