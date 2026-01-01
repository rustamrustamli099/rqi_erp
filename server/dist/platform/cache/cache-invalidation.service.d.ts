import { CachedEffectivePermissionsService } from '../auth/cached-effective-permissions.service';
import { DecisionCacheService } from './decision-cache.service';
export declare class CacheInvalidationService {
    private readonly effectivePermsCache;
    private readonly decisionCache;
    private readonly logger;
    constructor(effectivePermsCache: CachedEffectivePermissionsService, decisionCache: DecisionCacheService);
    invalidateUser(userId: string): Promise<void>;
    invalidateUsers(userIds: string[]): Promise<void>;
    invalidateScope(scopeType: string, scopeId: string | null): Promise<void>;
}
