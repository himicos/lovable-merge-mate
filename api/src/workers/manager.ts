import type { Worker, WorkerStatus } from './types.js';
import { MessageMonitorWorker } from './message-monitor.js';

export class WorkerManager {
    private static instance: WorkerManager;
    private workers: Map<string, Worker> = new Map();

    private constructor() {
        // Initialize workers
        this.registerWorker(new MessageMonitorWorker('system', {
            enabled: true,
            pollInterval: 60000,
            maxRetries: 3,
            retryDelay: 5000,
            batchSize: 10,
            sources: {
                gmail: true,
                slack: true,
                teams: true
            }
        }));
    }

    public static getInstance(): WorkerManager {
        if (!WorkerManager.instance) {
            WorkerManager.instance = new WorkerManager();
        }
        return WorkerManager.instance;
    }

    registerWorker(worker: Worker): void {
        this.workers.set(worker.name, worker);
    }

    async startWorker(name: string): Promise<void> {
        const worker = this.workers.get(name);
        if (!worker) {
            throw new Error(`Worker ${name} not found`);
        }
        await worker.start();
    }

    async stopWorker(name: string): Promise<void> {
        const worker = this.workers.get(name);
        if (!worker) {
            throw new Error(`Worker ${name} not found`);
        }
        await worker.stop();
    }

    async startAll(): Promise<void> {
        await Promise.all(Array.from(this.workers.values()).map(worker => worker.start()));
    }

    async stopAll(): Promise<void> {
        await Promise.all(Array.from(this.workers.values()).map(worker => worker.stop()));
    }

    getWorker(name: string): Worker | undefined {
        return this.workers.get(name);
    }

    getWorkers(): Worker[] {
        return Array.from(this.workers.values());
    }

    getWorkerStatus(name: string): WorkerStatus {
        const worker = this.workers.get(name);
        if (!worker) {
            throw new Error(`Worker ${name} not found`);
        }
        return worker.getStatus();
    }

    getAllWorkerStatuses(): Record<string, WorkerStatus> {
        const statuses: Record<string, WorkerStatus> = {};
        for (const [name, worker] of this.workers.entries()) {
            statuses[name] = worker.getStatus();
        }
        return statuses;
    }

    async checkHealth(): Promise<Record<string, boolean>> {
        const health: Record<string, boolean> = {};
        for (const [name, worker] of this.workers.entries()) {
            health[name] = await worker.isHealthy();
        }
        return health;
    }
}
