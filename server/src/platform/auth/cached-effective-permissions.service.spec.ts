import { Test, TestingModule } from '@nestjs/testing';
import { CachedEffectivePermissionsService } from './cached-effective-permissions.service';
import { EffectivePermissionsService } from './effective-permissions.service';
import { CacheService } from '../cache/cache.service';

/**
 * SAP-GRADE CACHE COMPLIANCE TESTS (PHASE 10.2)
 * 
 * VERIFIES:
 * 1. Cache HIT - No recomputation
 * 2. Cache MISS - Single computation, then cache
 * 3. Scope Isolation - Different cache keys per scope
 * 4. Result Identity - Cached = Non-cached
 * 5. No Implicit Fallback - No scope leakage
 */

describe('CachedEffectivePermissionsService (SAP Cache Compliance)', () => {
    let service: CachedEffectivePermissionsService;
    let baseService: jest.Mocked<EffectivePermissionsService>;
    let cacheService: CacheService;

    beforeEach(async () => {
        const mockBaseService = {
            computeEffectivePermissions: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CachedEffectivePermissionsService,
                { provide: EffectivePermissionsService, useValue: mockBaseService },
                CacheService
            ],
        }).compile();

        service = module.get<CachedEffectivePermissionsService>(CachedEffectivePermissionsService);
        baseService = module.get(EffectivePermissionsService);
        cacheService = module.get<CacheService>(CacheService);

        // Reset mocks and cache
        jest.clearAllMocks();
        await cacheService.reset();
    });

    // =========================================================================
    // TEST 1 — CACHE HIT: No Recomputation
    // =========================================================================
    it('TEST 1: Cache HIT - Should return cached value without calling base service', async () => {
        const params = { userId: 'user-1', scopeType: 'TENANT' as const, scopeId: 'tenant-A' };
        const expectedPerms = ['invoice.read', 'invoice.create'];

        // Setup: First call populates cache
        baseService.computeEffectivePermissions.mockResolvedValue(expectedPerms);
        await service.computeEffectivePermissions(params);
        expect(baseService.computeEffectivePermissions).toHaveBeenCalledTimes(1);

        // Act: Second call should HIT cache
        jest.clearAllMocks();
        const result = await service.computeEffectivePermissions(params);

        // Assert: Base service NOT called, result is same
        expect(baseService.computeEffectivePermissions).not.toHaveBeenCalled();
        expect(result).toEqual(expectedPerms);
    });

    // =========================================================================
    // TEST 2 — CACHE MISS: Single Computation
    // =========================================================================
    it('TEST 2: Cache MISS - Should compute exactly once and cache result', async () => {
        const params = { userId: 'user-2', scopeType: 'SYSTEM' as const, scopeId: null };
        const expectedPerms = ['system.admin.read'];

        baseService.computeEffectivePermissions.mockResolvedValue(expectedPerms);

        // Act: First call
        const result = await service.computeEffectivePermissions(params);

        // Assert: Called exactly once
        expect(baseService.computeEffectivePermissions).toHaveBeenCalledTimes(1);
        expect(baseService.computeEffectivePermissions).toHaveBeenCalledWith(params);
        expect(result).toEqual(expectedPerms);
    });

    // =========================================================================
    // TEST 3 — SCOPE ISOLATION: Different Keys
    // =========================================================================
    it('TEST 3: Scope Isolation - Different scopes use different cache keys', async () => {
        const tenantAParams = { userId: 'user-3', scopeType: 'TENANT' as const, scopeId: 'tenant-A' };
        const tenantBParams = { userId: 'user-3', scopeType: 'TENANT' as const, scopeId: 'tenant-B' };

        const tenantAPerms = ['tenant-a.perm'];
        const tenantBPerms = ['tenant-b.perm'];

        baseService.computeEffectivePermissions
            .mockResolvedValueOnce(tenantAPerms)
            .mockResolvedValueOnce(tenantBPerms);

        // Act: Call for both tenants
        const resultA = await service.computeEffectivePermissions(tenantAParams);
        const resultB = await service.computeEffectivePermissions(tenantBParams);

        // Assert: Both computed (different cache keys)
        expect(baseService.computeEffectivePermissions).toHaveBeenCalledTimes(2);
        expect(resultA).toEqual(tenantAPerms);
        expect(resultB).toEqual(tenantBPerms);

        // Verify cache hit for tenant-A
        jest.clearAllMocks();
        const resultA2 = await service.computeEffectivePermissions(tenantAParams);
        expect(baseService.computeEffectivePermissions).not.toHaveBeenCalled();
        expect(resultA2).toEqual(tenantAPerms);
    });

    // =========================================================================
    // TEST 4 — RESULT IDENTITY: Cached = Non-cached
    // =========================================================================
    it('TEST 4: Result Identity - Cached result equals base service result exactly', async () => {
        const params = { userId: 'user-4', scopeType: 'TENANT' as const, scopeId: 'tenant-X' };
        const expectedPerms = ['exact.perm.1', 'exact.perm.2', 'exact.perm.3'];

        baseService.computeEffectivePermissions.mockResolvedValue([...expectedPerms]);

        // First call (MISS)
        const result1 = await service.computeEffectivePermissions(params);

        // Second call (HIT)
        const result2 = await service.computeEffectivePermissions(params);

        // Assert: Exact match
        expect(result1).toEqual(expectedPerms);
        expect(result2).toEqual(expectedPerms);
        expect(result1).toEqual(result2);
    });

    // =========================================================================
    // TEST 5 — NO IMPLICIT FALLBACK: No Scope Leakage
    // =========================================================================
    it('TEST 5: No Implicit Fallback - SYSTEM and TENANT are separate', async () => {
        const systemParams = { userId: 'user-5', scopeType: 'SYSTEM' as const, scopeId: null };
        const tenantParams = { userId: 'user-5', scopeType: 'TENANT' as const, scopeId: 'tenant-Z' };

        const systemPerms = ['system.only'];
        const tenantPerms = ['tenant.only'];

        baseService.computeEffectivePermissions
            .mockImplementation(async (params) => {
                if (params.scopeType === 'SYSTEM') return systemPerms;
                return tenantPerms;
            });

        // Cache system scope
        await service.computeEffectivePermissions(systemParams);

        // Query tenant scope - should NOT get system perms
        const tenantResult = await service.computeEffectivePermissions(tenantParams);

        expect(tenantResult).toEqual(tenantPerms);
        expect(tenantResult).not.toContain('system.only');
    });

    // =========================================================================
    // TEST 6 — USER INVALIDATION: Clear user cache
    // =========================================================================
    it('TEST 6: User Invalidation - Should clear all caches for user', async () => {
        const params = { userId: 'user-6', scopeType: 'TENANT' as const, scopeId: 'tenant-I' };
        const initialPerms = ['initial.perm'];
        const updatedPerms = ['updated.perm'];

        // Initial call
        baseService.computeEffectivePermissions.mockResolvedValue(initialPerms);
        await service.computeEffectivePermissions(params);

        // Invalidate user
        await service.invalidateUser('user-6');

        // Next call should recompute
        baseService.computeEffectivePermissions.mockResolvedValue(updatedPerms);
        jest.clearAllMocks();
        const result = await service.computeEffectivePermissions(params);

        expect(baseService.computeEffectivePermissions).toHaveBeenCalledTimes(1);
        expect(result).toEqual(updatedPerms);
    });
});
