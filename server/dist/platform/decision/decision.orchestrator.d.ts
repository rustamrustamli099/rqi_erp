import { CachedEffectivePermissionsService } from '../auth/cached-effective-permissions.service';
import { DecisionCenterService } from './decision-center.service';
import { CacheService } from '../cache/cache.service';
import { MenuItem } from '../menu/menu.definition';
export interface DecisionResult {
    navigation: MenuItem[];
    actions: string[];
    canonicalPath: string | null;
}
export declare class DecisionOrchestrator {
    private readonly effectivePermissionsService;
    private readonly decisionCenter;
    private readonly cache;
    private readonly logger;
    constructor(effectivePermissionsService: CachedEffectivePermissionsService, decisionCenter: DecisionCenterService, cache: CacheService);
    private resolveDecisionCached;
    private buildCacheKey;
    private hashRoute;
    invalidateUser(userId: string): Promise<void>;
}
