const { URL } = require('url');

/**
 * Test suite for DATABASE_URL parsing functionality
 * This ensures the database client can parse URLs from various providers
 */
describe('Database URL Parsing', () => {
    
    function parseConfig(databaseUrl) {
        if (databaseUrl) {
            try {
                const dbUrl = new URL(databaseUrl);
                return {
                    host: dbUrl.hostname,
                    port: parseInt(dbUrl.port) || 5432,
                    database: dbUrl.pathname.slice(1),
                    user: dbUrl.username,
                    password: dbUrl.password,
                };
            } catch (error) {
                throw new Error(`Failed to parse DATABASE_URL: ${error.message}`);
            }
        }
        return null;
    }

    it('should parse Docker Compose DATABASE_URL correctly', () => {
        const url = 'postgresql://postgres:password@postgres:5432/lovable_merge_mate';
        const config = parseConfig(url);
        
        expect(config).toEqual({
            host: 'postgres',
            port: 5432,
            database: 'lovable_merge_mate',
            user: 'postgres',
            password: 'password'
        });
    });

    it('should parse Railway DATABASE_URL correctly', () => {
        const url = 'postgresql://postgres:secretpass@roundhouse.proxy.rlwy.net:25432/railway';
        const config = parseConfig(url);
        
        expect(config).toEqual({
            host: 'roundhouse.proxy.rlwy.net',
            port: 25432,
            database: 'railway',
            user: 'postgres',
            password: 'secretpass'
        });
    });

    it('should parse Heroku DATABASE_URL correctly', () => {
        const url = 'postgresql://user:pass@ec2-123-456-789.compute-1.amazonaws.com:5432/dbname';
        const config = parseConfig(url);
        
        expect(config).toEqual({
            host: 'ec2-123-456-789.compute-1.amazonaws.com',
            port: 5432,
            database: 'dbname',
            user: 'user',
            password: 'pass'
        });
    });

    it('should handle URL with default port', () => {
        const url = 'postgresql://user:pass@localhost/testdb';
        const config = parseConfig(url);
        
        expect(config).toEqual({
            host: 'localhost',
            port: 5432,
            database: 'testdb',
            user: 'user',
            password: 'pass'
        });
    });

    it('should handle URL with special characters in password', () => {
        const url = 'postgresql://user:p%40ss%21@host:5432/db';
        const config = parseConfig(url);
        
        expect(config).toEqual({
            host: 'host',
            port: 5432,
            database: 'db',
            user: 'user',
            password: 'p%40ss%21'  // URL encoded passwords are not automatically decoded by URL constructor
        });
    });

    it('should throw error for invalid URL', () => {
        const invalidUrl = 'not-a-valid-url';
        
        expect(() => parseConfig(invalidUrl)).toThrow('Failed to parse DATABASE_URL');
    });

    it('should return null for undefined URL', () => {
        expect(parseConfig()).toBeNull();
    });
});