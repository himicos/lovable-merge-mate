import { Redis } from 'ioredis';

interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    enableReadyCheck?: boolean;
    lazyConnect?: boolean;
    maxRetriesPerRequest?: number;
    tls?: {
        rejectUnauthorized?: boolean;
    };
}

class RedisClient {
    private client: Redis;

    constructor() {
        // Determine if we're in production (Railway) or development
        const isProduction = process.env.NODE_ENV === 'production';
        const isRailway = process.env.RAILWAY_ENVIRONMENT_ID || process.env.REDIS_URL?.includes('railway');
        
        // Railway-specific Redis configuration for TLS connections
        if (process.env.REDIS_URL && isRailway) {
            console.log('🚂 Configuring Redis for Railway with IPv6 and TLS support');
            
            // Parse Railway Redis URL to determine if it's TLS
            const url = new URL(process.env.REDIS_URL);
            const isTls = url.protocol === 'rediss:' || url.hostname.includes('railway');
            
            this.client = new Redis(process.env.REDIS_URL, {
                enableReadyCheck: false,
                lazyConnect: true,
                maxRetriesPerRequest: 3,
                family: 0, // Enable dual stack (IPv4 + IPv6) for Railway private networking
                // Configure TLS for Railway Redis
                tls: isTls ? {
                    rejectUnauthorized: false, // Allow self-signed certificates
                } : undefined,
                connectTimeout: 10000,
                commandTimeout: 5000,
                // Add custom reconnect strategy
                reconnectOnError: (err) => {
                    const targetError = 'READONLY';
                    return err.message.includes(targetError);
                },
            });
        } else if (process.env.REDIS_URL) {
            // Standard Redis URL configuration (non-Railway)
            console.log('🔗 Configuring Redis with provided URL');
            this.client = new Redis(process.env.REDIS_URL, {
                enableReadyCheck: false,
                lazyConnect: true,
                maxRetriesPerRequest: 3,
            });
        } else {
            // Fallback to individual config parameters
            console.log('⚙️ Configuring Redis with individual parameters');
            const config: RedisConfig = {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD || undefined,
                db: parseInt(process.env.REDIS_DB || '0'),
                enableReadyCheck: false,
                lazyConnect: true,
                maxRetriesPerRequest: 3,
            };
            this.client = new Redis(config);
        }

        // Handle Redis events with better logging
        this.client.on('connect', () => {
            console.log('✅ Redis connection established');
        });

        this.client.on('ready', () => {
            console.log('✅ Redis client ready');
        });

        this.client.on('error', (error: any) => {
            console.error('❌ Redis connection error:', error.message || error);
            
            // Log specific Railway-related error guidance
            if (error.message?.includes('ENOTFOUND') && error.message?.includes('railway')) {
                console.error('💡 Railway Redis Error: Check if Redis service is linked to your app and private networking is enabled');
            }
            
            if (error.message?.includes('SELF_SIGNED_CERT_IN_CHAIN')) {
                console.error('💡 TLS Certificate Error: This should be handled automatically for Railway Redis');
            }
        });

        this.client.on('close', () => {
            console.log('🔌 Redis connection closed');
        });

        this.client.on('reconnecting', (ms: number) => {
            console.log(`🔄 Redis reconnecting in ${ms}ms...`);
        });

        // Test connection only if not in CI/test environment
        if (!process.env.CI && !process.env.NODE_ENV?.includes('test')) {
            this.testConnection();
        }
    }

    private async testConnection(): Promise<void> {
        try {
            console.log('🧪 Testing Redis connection...');
            await this.client.ping();
            console.log('✅ Redis connection test successful');
        } catch (error: any) {
            console.error('❌ Redis connection test failed:', error.message || error);
            
            // Provide helpful debugging information
            if (error.message?.includes('ECONNREFUSED')) {
                console.log('💡 Redis not available - this is normal in development without local Redis');
            } else if (error.message?.includes('ENOTFOUND')) {
                console.log('💡 Redis hostname not found - check Railway service linking');
            } else if (error.message?.includes('MaxRetriesPerRequestError')) {
                console.log('💡 Redis max retries exceeded - connection may be unstable');
            }
        }
    }

    // Basic Redis operations with fallback handling
    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`⚠️ Redis GET failed for key "${key}":`, error.message);
                return null;
            }
            throw error;
        }
    }

    public async set(key: string, value: string, ttl?: number): Promise<string> {
        try {
            if (ttl) {
                return await this.client.setex(key, ttl, value);
            }
            return await this.client.set(key, value);
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`⚠️ Redis SET failed for key "${key}":`, error.message);
                return 'OK'; // Fake success for development
            }
            throw error;
        }
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

    // Check if Redis is available for use
    public isAvailable(): boolean {
        return this.client.status === 'ready' || this.client.status === 'connect';
    }

    // Graceful operation wrapper
    private async safeOperation<T>(operation: () => Promise<T>, fallback: T, operationName: string): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`⚠️ Redis ${operationName} failed:`, error.message);
                return fallback;
            }
            throw error;
        }
    }

    // Health check with better error handling
    public async healthCheck(): Promise<boolean> {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (error: any) {
            // Log error details but don't crash the app in development
            if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️ Redis health check failed (development mode):', error.message || error);
                return false; // Return false but don't crash
            } else {
                console.error('❌ Redis health check failed (production):', error.message || error);
                return false;
            }
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