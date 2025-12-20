import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private client;
    private readonly logger;
    private memoryStore;
    private isRedisConnected;
    private lastErrorLogTime;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    getClient(): Redis;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    acquireLock(key: string, ttlSeconds: number): Promise<boolean>;
    releaseLock(key: string): Promise<void>;
}
