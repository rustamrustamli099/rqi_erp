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
var DecisionCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("./cache.service");
const DECISION_CACHE_PREFIX = 'decision';
let DecisionCacheService = DecisionCacheService_1 = class DecisionCacheService {
    cache;
    logger = new common_1.Logger(DecisionCacheService_1.name);
    constructor(cache) {
        this.cache = cache;
    }
    async invalidateUser(userId) {
        const prefix = `${DECISION_CACHE_PREFIX}:user:${userId}:`;
        await this.cache.delByPrefix(prefix);
        this.logger.log(`Invalidated decision cache for user: ${userId}`);
    }
    async invalidateScope(scopeType, scopeId) {
        const scopeValue = scopeId || 'SYSTEM';
        this.logger.log(`Decision cache scope invalidation requested: ${scopeType}:${scopeValue}`);
    }
};
exports.DecisionCacheService = DecisionCacheService;
exports.DecisionCacheService = DecisionCacheService = DecisionCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], DecisionCacheService);
//# sourceMappingURL=decision-cache.service.js.map