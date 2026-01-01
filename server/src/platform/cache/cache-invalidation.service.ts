import { Injectable, Logger } from '@nestjs/common';
import { CachedEffectivePermissionsService } from '../auth/cached-effective-permissions.service';
import { DecisionCacheService } from './decision-cache.service';

/**
 * CACHE INVALIDATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PHASE 10.4: Central invalidation service for ALL authorization caches.
 * 
 * RESPONSIBILITY:
 * - Single entry point for cache invalidation
 * - Depends ONLY on cache services (NOT orchestrators)
 * - Called by RoleAssignmentsService, RolesService when authorization changes
 * 
 * HARD RULES:
 * - Does NOT determine affected users (caller's responsibility)
 * - Does NOT modify authorization behavior
 * - Correctness-first: invalidate MORE, not less
 * ═══════════════════════════════════════════════════════════════════════════
 */

@Injectable()
export class CacheInvalidationService {
    private readonly logger = new Logger(CacheInvalidationService.name);

    constructor(
        private readonly effectivePermsCache: CachedEffectivePermissionsService,
        private readonly decisionCache: DecisionCacheService
    ) { }

    /**
     * Invalidate ALL caches for a specific user.
     * Called when:
     * - Role assigned to user
     * - Role revoked from user
     * - Any role the user has is modified
     * 
     * This invalidates:
     * - Effective Permissions cache (Phase 10.2)
     * - Decision Result cache (Phase 10.3)
     */
    async invalidateUser(userId: string): Promise<void> {
        this.logger.log(`Invalidating all caches for user: ${userId}`);

        // 1. Invalidate effective permissions cache
        await this.effectivePermsCache.invalidateUser(userId);

        // 2. Invalidate decision result cache
        await this.decisionCache.invalidateUser(userId);

        this.logger.debug(`Cache invalidation complete for user: ${userId}`);
    }

    /**
     * Invalidate caches for multiple users (batch operation).
     * Called when a role is modified affecting multiple users.
     */
    async invalidateUsers(userIds: string[]): Promise<void> {
        this.logger.log(`Batch invalidating caches for ${userIds.length} users`);

        for (const userId of userIds) {
            await this.invalidateUser(userId);
        }
    }

    /**
     * Invalidate all caches for a specific scope.
     * Coarse-grained invalidation when role changes affect entire scope.
     */
    async invalidateScope(scopeType: string, scopeId: string | null): Promise<void> {
        this.logger.log(`Invalidating all caches for scope: ${scopeType}:${scopeId || 'SYSTEM'}`);

        await this.effectivePermsCache.invalidateScope(scopeType, scopeId);
        await this.decisionCache.invalidateScope(scopeType, scopeId);
    }
}
