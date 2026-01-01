import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * DECISION CACHE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PHASE 10.4: Abstraction for decision result cache invalidation.
 * 
 * RESPONSIBILITY:
 * - Invalidate decision result cache (navigation + actions + canonicalPath)
 * - Called by CacheInvalidationService when authorization changes
 * 
 * NOTE: This service does NOT own the cache logic.
 *       It only provides invalidation APIs matching the cache key structure
 *       from DecisionOrchestrator (Phase 10.3).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DECISION_CACHE_PREFIX = 'decision';

@Injectable()
export class DecisionCacheService {
    private readonly logger = new Logger(DecisionCacheService.name);

    constructor(private readonly cache: CacheService) { }

    /**
     * Invalidate all decision cache entries for a specific user.
     * Called when user's role assignments or permissions change.
     */
    async invalidateUser(userId: string): Promise<void> {
        const prefix = `${DECISION_CACHE_PREFIX}:user:${userId}:`;
        await this.cache.delByPrefix(prefix);
        this.logger.log(`Invalidated decision cache for user: ${userId}`);
    }

    /**
     * Invalidate all decision cache entries for a specific scope.
     * Called when role permissions change affecting all users in scope.
     * 
     * Note: This is coarse-grained invalidation.
     * For production, consider Redis SCAN with pattern matching.
     */
    async invalidateScope(scopeType: string, scopeId: string | null): Promise<void> {
        const scopeValue = scopeId || 'SYSTEM';
        // Coarse invalidation: clear all decision entries containing this scope
        // In-memory implementation: iterate and match
        this.logger.log(`Decision cache scope invalidation requested: ${scopeType}:${scopeValue}`);
        // TODO: Implement pattern-based invalidation with Redis SCAN
    }
}
