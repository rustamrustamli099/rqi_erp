"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CacheInvalidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInvalidationService = void 0;
const common_1 = require("@nestjs/common");
const cached_effective_permissions_service_1 = require("../auth/cached-effective-permissions.service");
const decision_cache_service_1 = require("./decision-cache.service");
let CacheInvalidationService = CacheInvalidationService_1 = class CacheInvalidationService {
    effectivePermsCache;
    decisionCache;
    logger = new common_1.Logger(CacheInvalidationService_1.name);
    constructor(effectivePermsCache, decisionCache) {
        this.effectivePermsCache = effectivePermsCache;
        this.decisionCache = decisionCache;
    }
    async invalidateUser(userId) {
        this.logger.log(`Invalidating all caches for user: ${userId}`);
        await this.effectivePermsCache.invalidateUser(userId);
        await this.decisionCache.invalidateUser(userId);
        this.logger.debug(`Cache invalidation complete for user: ${userId}`);
    }
    async invalidateUsers(userIds) {
        this.logger.log(`Batch invalidating caches for ${userIds.length} users`);
        for (const userId of userIds) {
            await this.invalidateUser(userId);
        }
    }
    async invalidateScope(scopeType, scopeId) {
        this.logger.log(`Invalidating all caches for scope: ${scopeType}:${scopeId || 'SYSTEM'}`);
        await this.effectivePermsCache.invalidateScope(scopeType, scopeId);
        await this.decisionCache.invalidateScope(scopeType, scopeId);
    }
};
exports.CacheInvalidationService = CacheInvalidationService;
exports.CacheInvalidationService = CacheInvalidationService = CacheInvalidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cached_effective_permissions_service_1.CachedEffectivePermissionsService,
        decision_cache_service_1.DecisionCacheService])
], CacheInvalidationService);
//# sourceMappingURL=cache-invalidation.service.js.map