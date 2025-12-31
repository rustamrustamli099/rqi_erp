
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class PermissionCacheService {
    private readonly logger = new Logger(PermissionCacheService.name);
    private readonly TTL = 300; // 5 minutes

    constructor(private readonly redisService: RedisService) { }

    private getKey(userId: string, tenantId: string = 'system', scope: string = 'TENANT'): string {
        return `perms:${scope}:${tenantId}:${userId}`;
    }

    async getPermissions(userId: string, tenantId?: string, scope?: string): Promise<string[] | null> {
        const key = this.getKey(userId, tenantId, scope);
        const cached = await this.redisService.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
        return null;
    }

    async setPermissions(userId: string, permissions: string[], tenantId?: string, scope?: string): Promise<void> {
        const key = this.getKey(userId, tenantId, scope);
        // User requirements say "perms:{scope}:{tenantId}:{userId}"
        // I will default scope to 'TENANT' if tenantId is present, else 'SYSTEM'.
        // Actually, let's make it mandatory or smart default.
        await this.redisService.set(key, JSON.stringify(permissions), this.TTL);
    }

    async clearPermissions(userId: string, tenantId?: string, scope?: string): Promise<void> {
        const key = this.getKey(userId, tenantId, scope);
        await this.redisService.del(key);
    }
}
