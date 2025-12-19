
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        // Fallback to localhost if not provided, assuming dev environment
        const host = this.configService.get<string>('REDIS_HOST', 'localhost');
        const port = this.configService.get<number>('REDIS_PORT', 6379);
        const password = this.configService.get<string>('REDIS_PASSWORD');

        this.client = new Redis({
            host,
            port,
            password,
            lazyConnect: true // Don't crash on boot if Redis is down, retry
        });

        this.client.on('error', (err) => {
            this.logger.error('Redis connection error', err);
        });

        this.client.on('connect', () => {
            this.logger.log('Connected to Redis');
        });

        // Asynchronously connect
        this.client.connect().catch(err => {
            this.logger.error('Failed to connect to Redis on boot', err);
        });
    }

    onModuleDestroy() {
        this.client.disconnect();
    }

    getClient(): Redis {
        return this.client;
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
        // Simple SET NX EX lock
        const result = await this.client.set(key, 'LOCKED', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    async releaseLock(key: string): Promise<void> {
        await this.client.del(key);
    }
}
