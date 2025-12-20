
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;
    private readonly logger = new Logger(RedisService.name);

    // Fallback In-Memory Store
    private memoryStore = new Map<string, { value: string, expiry: number | null }>();
    private isRedisConnected = false;
    private lastErrorLogTime = 0;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const host = this.configService.get<string>('REDIS_HOST', 'localhost');
        const port = this.configService.get<number>('REDIS_PORT', 6379);
        const password = this.configService.get<string>('REDIS_PASSWORD');

        this.client = new Redis({
            host,
            port,
            password,
            lazyConnect: true,
            retryStrategy: (times) => {
                // Slow down retries to reduce log spam (max 5s delay)
                const delay = Math.min(times * 50, 5000);
                return delay;
            }
        });

        this.client.on('connect', () => {
            this.isRedisConnected = true;
            this.logger.log('Connected to Redis - Switching to Redis Store');
        });

        this.client.on('error', (err) => {
            this.isRedisConnected = false;
            // Debounce error logs (1 log every 10 seconds)
            const now = Date.now();
            if (now - this.lastErrorLogTime > 10000) {
                this.logger.warn(`Redis connection failed (using In-Memory Fallback): ${err.message}`);
                this.lastErrorLogTime = now;
            }
        });

        // Attempt initial connect
        this.client.connect().catch(() => {
            // Already handled by 'error' listener
        });
    }

    onModuleDestroy() {
        this.client.disconnect();
    }

    getClient(): Redis {
        return this.client;
    }

    /**
     * Unified GET: Returns value from Redis (if active) or Memory (fallback)
     */
    async get(key: string): Promise<string | null> {
        if (this.isRedisConnected) {
            try {
                return await this.client.get(key);
            } catch (e) {
                this.logger.warn(`Redis get failed, falling back to memory: ${e.message}`);
            }
        }

        // Memory Fallback
        const entry = this.memoryStore.get(key);
        if (!entry) return null;

        if (entry.expiry && Date.now() > entry.expiry) {
            this.memoryStore.delete(key);
            return null;
        }
        return entry.value;
    }

    /**
     * Unified SET: Writes to Redis (if active) or Memory (fallback)
     */
    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (this.isRedisConnected) {
            try {
                if (ttlSeconds) {
                    await this.client.set(key, value, 'EX', ttlSeconds);
                } else {
                    await this.client.set(key, value);
                }
                return;
            } catch (e) {
                this.logger.warn(`Redis set failed, falling back to memory: ${e.message}`);
            }
        }

        // Memory Fallback
        const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
        this.memoryStore.set(key, { value, expiry });
    }

    async del(key: string): Promise<void> {
        if (this.isRedisConnected) {
            try {
                await this.client.del(key);
                return;
            } catch (e) { }
        }
        this.memoryStore.delete(key);
    }

    async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
        if (this.isRedisConnected) {
            try {
                const result = await this.client.set(key, 'LOCKED', 'EX', ttlSeconds, 'NX');
                return result === 'OK';
            } catch (e) { }
        }

        // Memory Lock (Simple Check)
        const entry = this.memoryStore.get(key);
        if (entry && (!entry.expiry || Date.now() < entry.expiry)) {
            return false; // Already locked
        }

        // Acquire
        this.memoryStore.set(key, {
            value: 'LOCKED',
            expiry: Date.now() + (ttlSeconds * 1000)
        });
        return true;
    }

    async releaseLock(key: string): Promise<void> {
        await this.del(key);
    }
}
