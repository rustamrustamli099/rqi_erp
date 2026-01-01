import { EffectivePermissionsService, PermissionComputationRequest } from './effective-permissions.service';
import { CacheService } from '../cache/cache.service';
export declare class CachedEffectivePermissionsService {
    private readonly baseService;
    private readonly cache;
    private readonly logger;
    constructor(baseService: EffectivePermissionsService, cache: CacheService);
    computeEffectivePermissions(params: PermissionComputationRequest): Promise<string[]>;
    private buildCacheKey;
    invalidateUser(userId: string): Promise<void>;
    invalidateScope(scopeType: string, scopeId: string | null): Promise<void>;
}
