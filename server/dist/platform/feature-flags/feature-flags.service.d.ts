import { RedisService } from '../../platform/redis/redis.service';
export declare class FeatureFlagsService {
    private readonly redisService;
    constructor(redisService: RedisService);
    isEnabled(flag: string, tenantId?: string): Promise<boolean>;
    enable(flag: string, tenantId?: string): Promise<void>;
    disable(flag: string, tenantId?: string): Promise<void>;
}
