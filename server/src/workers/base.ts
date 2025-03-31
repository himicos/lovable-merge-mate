import type { Worker, WorkerConfig, WorkerStatus } from './types';

export abstract class BaseWorker implements Worker {
    protected status: WorkerStatus = 'idle';
    protected config: WorkerConfig;
    protected lastRun: string | null = null;
    protected lastError: string | null = null;
    protected consecutiveFailures = 0;
    protected processedCount = 0;
    protected timer: NodeJS.Timeout | null = null;

    constructor(public readonly name: string, config: WorkerConfig) {
        this.config = {
            enabled: config.enabled ?? true,
            pollInterval: config.pollInterval,
            maxRetries: config.maxRetries,
            retryDelay: config.retryDelay
        };
    }

    abstract process(): Promise<void>;

    async start(): Promise<void> {
        if (this.status === 'running') {
            return;
        }

        if (!this.config.enabled) {
            return;
        }

        this.status = 'running';
        await this.runLoop();
    }

    async stop(): Promise<void> {
        if (this.status !== 'running') {
            return;
        }

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.status = 'stopped';
    }

    getStatus(): WorkerStatus {
        return this.status;
    }

    async isHealthy(): Promise<boolean> {
        return this.status === 'running' && this.consecutiveFailures === 0;
    }

    protected async runLoop(): Promise<void> {
        this.timer = setTimeout(async () => {
            try {
                await this.process();
                this.lastRun = new Date().toISOString();
                this.consecutiveFailures = 0;
                this.lastError = null;
                this.processedCount++;
            } catch (error) {
                this.consecutiveFailures++;
                this.lastError = error instanceof Error ? error.message : String(error);
                this.status = 'error';

                if (this.consecutiveFailures >= this.config.maxRetries) {
                    await this.stop();
                }
            }

            // Schedule next run if still running
            if (this.status === 'running') {
                await this.runLoop();
            }
        }, this.config.pollInterval);
    }
}
