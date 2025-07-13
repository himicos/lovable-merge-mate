import { Pool, PoolClient, QueryResult } from 'pg';
import { URL } from 'url';

interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

class DatabaseClient {
    private pool: Pool;

    constructor() {
        const config = this.parseConfig();
        this.pool = new Pool(config);
    }

    private parseConfig(): DatabaseConfig {
        // Try to parse DATABASE_URL first
        if (process.env.DATABASE_URL) {
            try {
                const dbUrl = new URL(process.env.DATABASE_URL);
                return {
                    host: dbUrl.hostname,
                    port: parseInt(dbUrl.port) || 5432,
                    database: dbUrl.pathname.slice(1), // Remove leading slash
                    user: dbUrl.username,
                    password: dbUrl.password,
                    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                    max: 20,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 2000,
                };
            } catch (error) {
                console.warn('Failed to parse DATABASE_URL, falling back to individual environment variables:', error);
            }
        }

        // Fallback to individual environment variables
        return {
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432'),
            database: process.env.DATABASE_NAME || 'lovable_merge_mate',
            user: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD || '',
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            max: 20, // maximum number of connections in the pool
            idleTimeoutMillis: 30000, // close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
        };

        // Handle pool errors
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });

        // Test connection on startup
        this.testConnection();
    }

    private async testConnection(): Promise<void> {
        try {
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            console.log('✅ Database connection established successfully');
        } catch (error) {
            console.error('❌ Failed to connect to database:', error);
            // Don't throw error in constructor to allow graceful startup
        }
    }

    // Execute a query with parameters
    public async query(text: string, params?: any[]): Promise<QueryResult> {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Executed query', { text, duration, rows: result.rowCount });
            return result;
        } catch (error) {
            console.error('Database query error:', { text, params, error });
            throw error;
        }
    }

    // Get a client from the pool for transactions
    public async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    // Execute multiple queries in a transaction
    public async transaction<T>(
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Health check
    public async healthCheck(): Promise<boolean> {
        try {
            const result = await this.query('SELECT 1 as health');
            return result.rows[0].health === 1;
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }

    // Close all connections in the pool
    public async close(): Promise<void> {
        await this.pool.end();
        console.log('Database connection pool closed');
    }

    // Get pool stats
    public getPoolStats() {
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount
        };
    }
}

// Create singleton instance
export const db = new DatabaseClient();

// Export types for use in other modules
export type { PoolClient, QueryResult };
export { DatabaseClient }; 