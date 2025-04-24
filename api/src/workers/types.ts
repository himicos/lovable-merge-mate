export interface WorkerConfig {
    enabled: boolean;
    pollInterval: number;
    maxRetries: number;
    retryDelay: number;
}

export interface MessageMonitorConfig extends WorkerConfig {
    batchSize?: number;
    sources?: {
        gmail?: boolean;
        slack?: boolean;
        teams?: boolean;
    };
}

export type WorkerStatus = 'idle' | 'running' | 'stopped' | 'error';

export interface Worker {
    readonly name: string;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): WorkerStatus;
    isHealthy(): Promise<boolean>;
}
