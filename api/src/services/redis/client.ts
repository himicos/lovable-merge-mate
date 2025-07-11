import Redis from 'ioredis';

interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    retryDelayOnFailover?: number;
    enableReadyCheck?: boolean;
    lazyConnect?: boolean;
    maxRetriesPerRequest?: number;
}

class RedisClient {
    private client: Redis;

    constructor() {
        const config: RedisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            db: parseInt(process.env.REDIS_DB || '0'),
            retryDelayOnFailover: 100,
            enableReadyCheck: false,
            lazyConnect: true,
            maxRetriesPerRequest: 3,
        };

        // If Redis URL is provided (Railway format), use it directly
        if (process.env.REDIS_URL) {
            this.client = new Redis(process.env.REDIS_URL, {
                retryDelayOnFailover: 100,
                enableReadyCheck: false,
                lazyConnect: true,
                maxRetriesPerRequest: 3,
            });
        } else {
            this.client = new Redis(config);
        }

        // Handle Redis events
        this.client.on('connect', () => {
            console.log('✅ Redis connection established');
        });

        this.client.on('ready', () => {
            console.log('✅ Redis client ready');
        });

        this.client.on('error', (error) => {
            console.error('❌ Redis connection error:', error);
        });

        this.client.on('close', () => {
            console.log('Redis connection closed');
        });

        this.client.on('reconnecting', () => {
            console.log('Redis reconnecting...');
        });

        // Test connection
        this.testConnection();
    }

    private async testConnection(): Promise<void> {
        try {
            await this.client.ping();
            console.log('✅ Redis connection test successful');
        } catch (error) {
            console.error('❌ Redis connection test failed:', error);
        }
    }

    // Basic Redis operations
    public async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    public async set(key: string, value: string, ttl?: number): Promise<string> {
        if (ttl) {
            return await this.client.setex(key, ttl, value);
        }
        return await this.client.set(key, value);
    }

    public async setex(key: string, seconds: number, value: string): Promise<string> {
        return await this.client.setex(key, seconds, value);
    }

    public async del(key: string): Promise<number> {
        return await this.client.del(key);
    }

    public async exists(key: string): Promise<number> {
        return await this.client.exists(key);
    }

    public async expire(key: string, seconds: number): Promise<number> {
        return await this.client.expire(key, seconds);
    }

    public async ttl(key: string): Promise<number> {
        return await this.client.ttl(key);
    }

    // Hash operations for complex data
    public async hget(key: string, field: string): Promise<string | null> {
        return await this.client.hget(key, field);
    }

    public async hset(key: string, field: string, value: string): Promise<number> {
        return await this.client.hset(key, field, value);
    }

    public async hgetall(key: string): Promise<Record<string, string>> {
        return await this.client.hgetall(key);
    }

    public async hdel(key: string, field: string): Promise<number> {
        return await this.client.hdel(key, field);
    }

    // List operations for queues
    public async lpush(key: string, value: string): Promise<number> {
        return await this.client.lpush(key, value);
    }

    public async rpush(key: string, value: string): Promise<number> {
        return await this.client.rpush(key, value);
    }

    public async lpop(key: string): Promise<string | null> {
        return await this.client.lpop(key);
    }

    public async rpop(key: string): Promise<string | null> {
        return await this.client.rpop(key);
    }

    public async llen(key: string): Promise<number> {
        return await this.client.llen(key);
    }

    // JSON operations (for complex objects)
    public async setJson(key: string, value: object, ttl?: number): Promise<string> {
        const jsonString = JSON.stringify(value);
        return await this.set(key, jsonString, ttl);
    }

    public async getJson<T = any>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;
        
        try {
            return JSON.parse(value) as T;
        } catch (error) {
            console.error('Failed to parse JSON from Redis:', error);
            return null;
        }
    }

    // Session management helpers
    public async setSession(sessionId: string, sessionData: object, ttlSeconds: number = 3600): Promise<void> {
        await this.setJson(`session:${sessionId}`, sessionData, ttlSeconds);
    }

    public async getSession<T = any>(sessionId: string): Promise<T | null> {
        return await this.getJson<T>(`session:${sessionId}`);
    }

    public async deleteSession(sessionId: string): Promise<void> {
        await this.del(`session:${sessionId}`);
    }

    // Rate limiting helpers
    public async incrementCounter(key: string, ttl: number = 3600): Promise<number> {
        const pipeline = this.client.pipeline();
        pipeline.incr(key);
        pipeline.expire(key, ttl);
        const results = await pipeline.exec();
        return results?.[0]?.[1] as number || 0;
    }

    // Cache invalidation patterns
    public async deletePattern(pattern: string): Promise<number> {
        const keys = await this.client.keys(pattern);
        if (keys.length === 0) return 0;
        return await this.client.del(...keys);
    }

    // Health check
    public async healthCheck(): Promise<boolean> {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }

    // Close connection
    public async close(): Promise<void> {
        await this.client.quit();
        console.log('Redis connection closed');
    }

    // Get Redis client info
    public async getInfo(): Promise<string> {
        return await this.client.info();
    }

    // Raw client access for advanced operations
    public getClient(): Redis {
        return this.client;
    }
}

// Create singleton instance
export const redis = new RedisClient();

// Export class for testing or multiple instances
export { RedisClient }; 