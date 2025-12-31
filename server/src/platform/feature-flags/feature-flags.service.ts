
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../platform/redis/redis.service';

@Injectable()
export class FeatureFlagsService {
    constructor(private readonly redisService: RedisService) { }

    async isEnabled(flag: string, tenantId?: string): Promise<boolean> {
        // 1. Check Tenant override
        if (tenantId) {
            const tenantValue = await this.redisService.get(`feature:${tenantId}:${flag}`);
            if (tenantValue !== null) {
                return tenantValue === 'true';
            }
        }

        // 2. Check Global override
        const globalValue = await this.redisService.get(`feature:global:${flag}`);
        if (globalValue !== null) {
            return globalValue === 'true';
        }

        // 3. Default to false (Strict)
        return false;
    }

    async enable(flag: string, tenantId?: string) {
        const key = tenantId ? `feature:${tenantId}:${flag}` : `feature:global:${flag}`;
        await this.redisService.set(key, 'true');
    }

    async disable(flag: string, tenantId?: string) {
        const key = tenantId ? `feature:${tenantId}:${flag}` : `feature:global:${flag}`;
        await this.redisService.set(key, 'false');
    }
}
