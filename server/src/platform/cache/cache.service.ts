import { Injectable, Logger } from '@nestjs/common';

/**
 * SAP-GRADE CACHE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Generic cache abstraction with ASYNC API for Redis/distributed cache compatibility.
 * 
 * PHASE 10.2: Initial implementation uses in-memory Map.
 * Future: Replace with Redis implementation.
 * 
 * HARD RULES (GEMINI § 10):
 * - Cache must NOT change authorization behavior
 * - No implicit inference
 * - TTL-based expiry only
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);
    private readonly store = new Map<string, CacheEntry<any>>();

    /**
     * Get value from cache
     * @returns cached value or null if not found/expired
     */
    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key);

        if (!entry) {
            return null;
        }

        // Check TTL expiry
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.logger.debug(`Cache EXPIRED: ${key}`);
            return null;
        }

        this.logger.debug(`Cache HIT: ${key}`);
        return entry.value as T;
    }

    /**
     * Set value in cache with TTL
     * @param key Cache key
     * @param value Value to cache
     * @param ttlSeconds Time-to-live in seconds
     */
    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        const expiresAt = Date.now() + (ttlSeconds * 1000);

        this.store.set(key, {
            value,
            expiresAt
        });

        this.logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    }

    /**
     * Delete specific key from cache
     */
    async del(key: string): Promise<void> {
        const deleted = this.store.delete(key);
        if (deleted) {
            this.logger.debug(`Cache DEL: ${key}`);
        }
    }

    /**
     * Delete all keys matching a pattern prefix
     * Used for invalidation (e.g., all user's permissions across scopes)
     */
    async delByPrefix(prefix: string): Promise<number> {
        let count = 0;
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
                count++;
            }
        }
        if (count > 0) {
            this.logger.debug(`Cache DEL by prefix "${prefix}": ${count} keys`);
        }
        return count;
    }

    /**
     * Clear entire cache
     * Use with caution - only for testing or emergency invalidation
     */
    async reset(): Promise<void> {
        const size = this.store.size;
        this.store.clear();
        this.logger.warn(`Cache RESET: Cleared ${size} entries`);
    }

    /**
     * Get current cache size (for monitoring)
     */
    async size(): Promise<number> {
        return this.store.size;
    }
}
