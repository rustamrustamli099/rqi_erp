import { RedisService } from '../redis/redis.service';
export declare class PermissionCacheService {
    private readonly redisService;
    private readonly logger;
    private readonly TTL;
    constructor(redisService: RedisService);
    private getKey;
    getPermissions(userId: string, tenantId?: string, scope?: string): Promise<string[] | null>;
    setPermissions(userId: string, permissions: string[], tenantId?: string, scope?: string): Promise<void>;
    clearPermissions(userId: string, tenantId?: string, scope?: string): Promise<void>;
}
