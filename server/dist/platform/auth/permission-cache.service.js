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
var PermissionCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionCacheService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
let PermissionCacheService = PermissionCacheService_1 = class PermissionCacheService {
    redisService;
    logger = new common_1.Logger(PermissionCacheService_1.name);
    TTL = 300;
    constructor(redisService) {
        this.redisService = redisService;
    }
    getKey(userId, tenantId = 'system', scope = 'TENANT') {
        return `perms:${scope}:${tenantId}:${userId}`;
    }
    async getPermissions(userId, tenantId, scope) {
        const key = this.getKey(userId, tenantId, scope);
        const cached = await this.redisService.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
        return null;
    }
    async setPermissions(userId, permissions, tenantId, scope) {
        const key = this.getKey(userId, tenantId, scope);
        await this.redisService.set(key, JSON.stringify(permissions), this.TTL);
    }
    async clearPermissions(userId, tenantId, scope) {
        const key = this.getKey(userId, tenantId, scope);
        await this.redisService.del(key);
    }
};
exports.PermissionCacheService = PermissionCacheService;
exports.PermissionCacheService = PermissionCacheService = PermissionCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], PermissionCacheService);
//# sourceMappingURL=permission-cache.service.js.map