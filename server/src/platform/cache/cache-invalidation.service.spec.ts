import { Test, TestingModule } from '@nestjs/testing';
import { CacheInvalidationService } from './cache-invalidation.service';
import { CachedEffectivePermissionsService } from '../auth/cached-effective-permissions.service';
import { DecisionCacheService } from './decision-cache.service';

/**
 * SAP-GRADE CACHE INVALIDATION TESTS (PHASE 10.4)
 * 
 * VERIFIES:
 * 1. invalidateUser clears BOTH caches
 * 2. invalidateUsers (batch) works correctly
 * 3. Both cache services are called synchronously
 */

describe('CacheInvalidationService (SAP Cache Compliance)', () => {
    let service: CacheInvalidationService;
    let effectivePermsCache: jest.Mocked<CachedEffectivePermissionsService>;
    let decisionCache: jest.Mocked<DecisionCacheService>;

    beforeEach(async () => {
        const mockEffectivePermsCache = {
            invalidateUser: jest.fn().mockResolvedValue(undefined),
            invalidateScope: jest.fn().mockResolvedValue(undefined)
        };

        const mockDecisionCache = {
            invalidateUser: jest.fn().mockResolvedValue(undefined),
            invalidateScope: jest.fn().mockResolvedValue(undefined)
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CacheInvalidationService,
                { provide: CachedEffectivePermissionsService, useValue: mockEffectivePermsCache },
                { provide: DecisionCacheService, useValue: mockDecisionCache }
            ],
        }).compile();

        service = module.get<CacheInvalidationService>(CacheInvalidationService);
        effectivePermsCache = module.get(CachedEffectivePermissionsService);
        decisionCache = module.get(DecisionCacheService);

        jest.clearAllMocks();
    });

    // =========================================================================
    // TEST 1 — invalidateUser clears BOTH caches
    // =========================================================================
    it('TEST 1: invalidateUser - Should invalidate BOTH effective permissions AND decision cache', async () => {
        await service.invalidateUser('user-1');

        expect(effectivePermsCache.invalidateUser).toHaveBeenCalledTimes(1);
        expect(effectivePermsCache.invalidateUser).toHaveBeenCalledWith('user-1');

        expect(decisionCache.invalidateUser).toHaveBeenCalledTimes(1);
        expect(decisionCache.invalidateUser).toHaveBeenCalledWith('user-1');
    });

    // =========================================================================
    // TEST 2 — invalidateUsers (batch) calls for each user
    // =========================================================================
    it('TEST 2: invalidateUsers - Should invalidate ALL users in batch', async () => {
        const userIds = ['user-A', 'user-B', 'user-C'];

        await service.invalidateUsers(userIds);

        expect(effectivePermsCache.invalidateUser).toHaveBeenCalledTimes(3);
        expect(decisionCache.invalidateUser).toHaveBeenCalledTimes(3);

        expect(effectivePermsCache.invalidateUser).toHaveBeenCalledWith('user-A');
        expect(effectivePermsCache.invalidateUser).toHaveBeenCalledWith('user-B');
        expect(effectivePermsCache.invalidateUser).toHaveBeenCalledWith('user-C');
    });

    // =========================================================================
    // TEST 3 — invalidateScope clears BOTH caches for scope
    // =========================================================================
    it('TEST 3: invalidateScope - Should invalidate BOTH caches for scope', async () => {
        await service.invalidateScope('TENANT', 'tenant-X');

        expect(effectivePermsCache.invalidateScope).toHaveBeenCalledTimes(1);
        expect(effectivePermsCache.invalidateScope).toHaveBeenCalledWith('TENANT', 'tenant-X');

        expect(decisionCache.invalidateScope).toHaveBeenCalledTimes(1);
        expect(decisionCache.invalidateScope).toHaveBeenCalledWith('TENANT', 'tenant-X');
    });

    // =========================================================================
    // TEST 4 — SYSTEM scope handled correctly
    // =========================================================================
    it('TEST 4: invalidateScope - Should handle SYSTEM scope with null scopeId', async () => {
        await service.invalidateScope('SYSTEM', null);

        expect(effectivePermsCache.invalidateScope).toHaveBeenCalledWith('SYSTEM', null);
        expect(decisionCache.invalidateScope).toHaveBeenCalledWith('SYSTEM', null);
    });
});
