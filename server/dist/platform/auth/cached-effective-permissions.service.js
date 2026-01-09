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
var CachedEffectivePermissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedEffectivePermissionsService = void 0;
const common_1 = require("@nestjs/common");
const effective_permissions_service_1 = require("./effective-permissions.service");
const cache_service_1 = require("../cache/cache.service");
const CACHE_TTL_SECONDS = 300;
const CACHE_PREFIX = 'effPerm';
let CachedEffectivePermissionsService = CachedEffectivePermissionsService_1 = class CachedEffectivePermissionsService {
    baseService;
    cache;
    logger = new common_1.Logger(CachedEffectivePermissionsService_1.name);
    constructor(baseService, cache) {
        this.baseService = baseService;
        this.cache = cache;
    }
    async computeEffectivePermissions(params) {
        const { userId, scopeType, scopeId } = params;
        const cacheKey = this.buildCacheKey(userId, scopeType, scopeId);
        const cached = await this.cache.get(cacheKey);
        if (cached !== null) {
            this.logger.debug(`Cache HIT for ${cacheKey} (${cached.length} permissions)`);
            return cached;
        }
        this.logger.debug(`Cache MISS for ${cacheKey} - computing fresh...`);
        const result = await this.baseService.computeEffectivePermissions(params);
        await this.cache.set(cacheKey, result, CACHE_TTL_SECONDS);
        this.logger.debug(`Cached ${result.length} permissions for ${cacheKey}`);
        return result;
    }
    buildCacheKey(userId, scopeType, scopeId) {
        const scopeValue = scopeId || 'SYSTEM';
        return `${CACHE_PREFIX}:user:${userId}:scope:${scopeType}:${scopeValue}`;
    }
    async invalidateUser(userId) {
        const prefix = `${CACHE_PREFIX}:user:${userId}:`;
        await this.cache.delByPrefix(prefix);
        this.logger.log(`Invalidated cache for user: ${userId}`);
    }
    async invalidateScope(scopeType, scopeId) {
        const scopeValue = scopeId || 'SYSTEM';
        const pattern = `:scope:${scopeType}:${scopeValue}`;
        let count = 0;
        this.logger.log(`Scope invalidation requested: ${scopeType}:${scopeValue}`);
    }
};
exports.CachedEffectivePermissionsService = CachedEffectivePermissionsService;
exports.CachedEffectivePermissionsService = CachedEffectivePermissionsService = CachedEffectivePermissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [effective_permissions_service_1.EffectivePermissionsService,
        cache_service_1.CacheService])
], CachedEffectivePermissionsService);
//# sourceMappingURL=cached-effective-permissions.service.js.map