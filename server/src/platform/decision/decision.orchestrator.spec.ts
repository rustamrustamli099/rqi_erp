import { Test, TestingModule } from '@nestjs/testing';
import { DecisionOrchestrator, DecisionResult } from './decision.orchestrator';
import { CachedEffectivePermissionsService } from '../auth/cached-effective-permissions.service';
import { DecisionCenterService } from './decision-center.service';
import { CacheService } from '../cache/cache.service';
import { MenuItem } from '../menu/menu.definition';

/**
 * SAP-GRADE DECISION CACHE COMPLIANCE TESTS (PHASE 10.3)
 * 
 * VERIFIES:
 * 1. Cache HIT - DecisionCenterService NOT called
 * 2. Cache MISS - DecisionCenterService called once
 * 3. Scope Isolation - Different scopes, different cache keys
 * 4. Route Isolation - Different routes, different cache keys
 * 5. Result Identity - Cached = Non-cached
 */

describe('DecisionOrchestrator Cache (SAP Compliance)', () => {
    let orchestrator: DecisionOrchestrator;
    let effectivePermissionsService: jest.Mocked<CachedEffectivePermissionsService>;
    let decisionCenter: jest.Mocked<DecisionCenterService>;
    let cacheService: CacheService;

    const mockNavigationTree: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' }
    ];

    beforeEach(async () => {
        const mockEffectivePermissions = {
            computeEffectivePermissions: jest.fn().mockResolvedValue(['dashboard.read'])
        };

        const mockDecisionCenter = {
            resolveNavigationTree: jest.fn().mockReturnValue(mockNavigationTree),
            resolveActions: jest.fn().mockReturnValue(['dashboard.read']),
            getCanonicalPath: jest.fn().mockReturnValue('/dashboard')
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DecisionOrchestrator,
                { provide: CachedEffectivePermissionsService, useValue: mockEffectivePermissions },
                { provide: DecisionCenterService, useValue: mockDecisionCenter },
                CacheService
            ],
        }).compile();

        orchestrator = module.get<DecisionOrchestrator>(DecisionOrchestrator);
        effectivePermissionsService = module.get(CachedEffectivePermissionsService);
        decisionCenter = module.get(DecisionCenterService);
        cacheService = module.get<CacheService>(CacheService);

        jest.clearAllMocks();
        await cacheService.reset();
    });

    // =========================================================================
    // TEST 1 — CACHE HIT: DecisionCenterService NOT called
    // =========================================================================
    it('TEST 1: Cache HIT - Should return cached result without calling DecisionCenterService', async () => {
        const user = { userId: 'user-1', scopeType: 'TENANT', scopeId: 'tenant-A' };

        // First call - populates cache
        await orchestrator.getSessionState(user);
        expect(decisionCenter.resolveNavigationTree).toHaveBeenCalledTimes(1);

        // Clear call history
        jest.clearAllMocks();

        // Second call - should HIT cache
        const result = await orchestrator.getSessionState(user);

        // Assert: DecisionCenterService NOT called
        expect(decisionCenter.resolveNavigationTree).not.toHaveBeenCalled();
        expect(decisionCenter.resolveActions).not.toHaveBeenCalled();
        expect(result.navigation).toEqual(mockNavigationTree);
    });

    // =========================================================================
    // TEST 2 — CACHE MISS: DecisionCenterService called exactly once
    // =========================================================================
    it('TEST 2: Cache MISS - Should call DecisionCenterService exactly once', async () => {
        const user = { userId: 'user-2', scopeType: 'SYSTEM', scopeId: null };

        const result = await orchestrator.getSessionState(user);

        expect(effectivePermissionsService.computeEffectivePermissions).toHaveBeenCalledTimes(1);
        expect(decisionCenter.resolveNavigationTree).toHaveBeenCalledTimes(1);
        expect(decisionCenter.resolveActions).toHaveBeenCalledTimes(1);
        expect(result).toBeDefined();
    });

    // =========================================================================
    // TEST 3 — SCOPE ISOLATION: Different scopes, different keys
    // =========================================================================
    it('TEST 3: Scope Isolation - Different scopes produce different cache entries', async () => {
        const userTenantA = { userId: 'user-3', scopeType: 'TENANT', scopeId: 'tenant-A' };
        const userTenantB = { userId: 'user-3', scopeType: 'TENANT', scopeId: 'tenant-B' };

        // Call for both tenants
        await orchestrator.getSessionState(userTenantA);
        await orchestrator.getSessionState(userTenantB);

        // Both should call DecisionCenterService (different cache keys)
        expect(decisionCenter.resolveNavigationTree).toHaveBeenCalledTimes(2);

        // Clear and call tenant-A again - should HIT
        jest.clearAllMocks();
        await orchestrator.getSessionState(userTenantA);
        expect(decisionCenter.resolveNavigationTree).not.toHaveBeenCalled();
    });

    // =========================================================================
    // TEST 4 — ROUTE ISOLATION: Different routes, different keys
    // =========================================================================
    it('TEST 4: Route Isolation - Navigation and Session have different cache keys', async () => {
        const user = { userId: 'user-4', scopeType: 'TENANT', scopeId: 'tenant-X' };

        // Call navigation
        await orchestrator.getNavigationForUser(user);

        // Call session (different route hash)
        await orchestrator.getSessionState(user);

        // Both should be computed (different route hashes)
        expect(decisionCenter.resolveNavigationTree).toHaveBeenCalledTimes(2);
    });

    // =========================================================================
    // TEST 5 — RESULT IDENTITY: Cached equals non-cached
    // =========================================================================
    it('TEST 5: Result Identity - Cached result equals computed result', async () => {
        const user = { userId: 'user-5', scopeType: 'TENANT', scopeId: 'tenant-Y' };

        // First call (MISS)
        const result1 = await orchestrator.getSessionState(user);

        // Second call (HIT)
        const result2 = await orchestrator.getSessionState(user);

        // Results must be identical
        expect(result1).toEqual(result2);
        expect(result1.navigation).toEqual(result2.navigation);
        expect(result1.actions).toEqual(result2.actions);
        expect(result1.canonicalPath).toEqual(result2.canonicalPath);
    });

    // =========================================================================
    // TEST 6 — USER INVALIDATION: Cache cleared on role change
    // =========================================================================
    it('TEST 6: User Invalidation - Should recompute after invalidation', async () => {
        const user = { userId: 'user-6', scopeType: 'TENANT', scopeId: 'tenant-Z' };

        // First call
        await orchestrator.getSessionState(user);

        // Invalidate user cache
        await orchestrator.invalidateUser('user-6');

        // Clear mocks
        jest.clearAllMocks();

        // Next call should recompute
        await orchestrator.getSessionState(user);
        expect(decisionCenter.resolveNavigationTree).toHaveBeenCalledTimes(1);
    });
});
