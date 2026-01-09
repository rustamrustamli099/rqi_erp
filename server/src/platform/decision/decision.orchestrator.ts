import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { CachedEffectivePermissionsService } from '../auth/cached-effective-permissions.service';
import { DecisionCenterService } from './decision-center.service';
import { CacheService } from '../cache/cache.service';
import { ADMIN_MENU_TREE, MenuItem } from '../menu/menu.definition';

/**
 * DECISION ORCHESTRATOR
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RESPONSIBILITY:
 * - Application Service Layer
 * - Binds Context + specialized Domain Services
 * - "The Glue"
 * 
 * PHASE 10.2: Uses CachedEffectivePermissionsService
 * PHASE 10.3: Caches final decision output (navigation + actions + canonicalPath)
 * 
 * HARD RULES:
 * - DecisionCenterService remains cache-UNAWARE
 * - Only FINAL decision output is cached
 * - Session/user metadata is NOT cached
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface DecisionResult {
    navigation: MenuItem[];
    actions: string[];
    canonicalPath: string | null;
}

const DECISION_CACHE_TTL = 300; // 5 minutes
const DECISION_CACHE_PREFIX = 'decision_v2'; // Bust cache

@Injectable()
export class DecisionOrchestrator {
    private readonly logger = new Logger(DecisionOrchestrator.name);

    constructor(
        private readonly effectivePermissionsService: CachedEffectivePermissionsService,
        private readonly decisionCenter: DecisionCenterService,
        private readonly cache: CacheService
    ) { }

    // ... (getNavigationForUser and getSessionState remain the same)

    private async resolveDecisionCached(
        userId: string,
        scopeType: string,
        scopeId: string | null,
        routeHash: string
    ): Promise<DecisionResult> {
        // Build deterministic cache key
        const cacheKey = this.buildCacheKey(userId, scopeType, scopeId, routeHash);

        // 1. Check cache
        const cached = await this.cache.get<DecisionResult>(cacheKey);
        if (cached !== null) {
            this.logger.debug(`Decision Cache HIT: ${cacheKey}`);
            return cached;
        }

        // 2. Cache MISS - compute decision
        this.logger.debug(`Decision Cache MISS: ${cacheKey} - computing...`);

        // 2a. Get permissions (already cached in Phase 10.2)
        const permissions = await this.effectivePermissionsService.computeEffectivePermissions({
            userId,
            scopeType: scopeType as 'SYSTEM' | 'TENANT' | 'UNIT',
            scopeId
        });

        this.logger.log(`[DecisionOrchestrator] User ${userId} has ${permissions.length} permissions.`);
        if (permissions.length === 0) {
            this.logger.warn(`[DecisionOrchestrator] User ${userId} has ZERO permissions. Menu should be empty.`);
        }

        // 2b. Resolve via DecisionCenter (cache-unaware)
        const navigation = this.decisionCenter.resolveNavigationTree(ADMIN_MENU_TREE, permissions);
        const actions = this.decisionCenter.resolveActions(permissions);
        const canonicalPath = this.decisionCenter.getCanonicalPath(navigation);

        this.logger.log(`[DecisionOrchestrator] Resolved menu items: ${navigation.length}`);

        // 3. Build result (ONLY decision output)
        const result: DecisionResult = {
            navigation,
            actions,
            canonicalPath
        };

        // 4. Store in cache
        await this.cache.set(cacheKey, result, DECISION_CACHE_TTL);

        this.logger.debug(`Decision resolved for ${userId}: ${navigation.length} items, ${actions.length} actions`);

        return result;
    }

    /**
     * Build deterministic cache key with route hash
     */
    private buildCacheKey(
        userId: string,
        scopeType: string,
        scopeId: string | null,
        routeHash: string
    ): string {
        const scopeValue = scopeId || 'SYSTEM';
        return `${DECISION_CACHE_PREFIX}:user:${userId}:scope:${scopeType}:${scopeValue}:route:${routeHash}`;
    }

    /**
     * Hash route for cache key determinism
     */
    private hashRoute(route: string): string {
        return createHash('md5').update(route).digest('hex').substring(0, 8);
    }

    /**
     * Invalidate decision cache for a user
     * Called when user's role assignments change
     */
    async invalidateUser(userId: string): Promise<void> {
        const prefix = `${DECISION_CACHE_PREFIX}:user:${userId}:`;
        await this.cache.delByPrefix(prefix);
        this.logger.log(`Invalidated decision cache for user: ${userId}`);
    }
}
