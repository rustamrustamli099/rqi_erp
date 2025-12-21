"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("@nestjs/config");
let RedisService = RedisService_1 = class RedisService {
    configService;
    client;
    logger = new common_1.Logger(RedisService_1.name);
    memoryStore = new Map();
    isRedisConnected = false;
    lastErrorLogTime = 0;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const host = this.configService.get('REDIS_HOST', 'localhost');
        const port = this.configService.get('REDIS_PORT', 6379);
        const password = this.configService.get('REDIS_PASSWORD');
        this.client = new ioredis_1.default({
            host,
            port,
            password,
            lazyConnect: true,
            retryStrategy: (times) => {
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
            const now = Date.now();
            if (now - this.lastErrorLogTime > 10000) {
                this.logger.warn(`Redis connection failed (using In-Memory Fallback): ${err.message}`);
                this.lastErrorLogTime = now;
            }
        });
        this.client.connect().catch(() => {
        });
    }
    onModuleDestroy() {
        this.client.disconnect();
    }
    getClient() {
        return this.client;
    }
    async get(key) {
        if (this.isRedisConnected) {
            try {
                return await this.client.get(key);
            }
            catch (e) {
                this.logger.warn(`Redis get failed, falling back to memory: ${e.message}`);
            }
        }
        const entry = this.memoryStore.get(key);
        if (!entry)
            return null;
        if (entry.expiry && Date.now() > entry.expiry) {
            this.memoryStore.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        if (this.isRedisConnected) {
            try {
                if (ttlSeconds) {
                    await this.client.set(key, value, 'EX', ttlSeconds);
                }
                else {
                    await this.client.set(key, value);
                }
                return;
            }
            catch (e) {
                this.logger.warn(`Redis set failed, falling back to memory: ${e.message}`);
            }
        }
        const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
        this.memoryStore.set(key, { value, expiry });
    }
    async del(key) {
        if (this.isRedisConnected) {
            try {
                await this.client.del(key);
                return;
            }
            catch (e) { }
        }
        this.memoryStore.delete(key);
    }
    async acquireLock(key, ttlSeconds) {
        if (this.isRedisConnected) {
            try {
                const result = await this.client.set(key, 'LOCKED', 'EX', ttlSeconds, 'NX');
                return result === 'OK';
            }
            catch (e) { }
        }
        const entry = this.memoryStore.get(key);
        if (entry && (!entry.expiry || Date.now() < entry.expiry)) {
            return false;
        }
        this.memoryStore.set(key, {
            value: 'LOCKED',
            expiry: Date.now() + (ttlSeconds * 1000)
        });
        return true;
    }
    async releaseLock(key) {
        await this.del(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map