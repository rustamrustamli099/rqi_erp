import { CacheService } from './cache.service';
export declare class DecisionCacheService {
    private readonly cache;
    private readonly logger;
    constructor(cache: CacheService);
    invalidateUser(userId: string): Promise<void>;
    invalidateScope(scopeType: string, scopeId: string | null): Promise<void>;
}
