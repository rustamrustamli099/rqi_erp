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
var DecisionOrchestrator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionOrchestrator = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const cached_effective_permissions_service_1 = require("../auth/cached-effective-permissions.service");
const decision_center_service_1 = require("./decision-center.service");
const cache_service_1 = require("../cache/cache.service");
const menu_definition_1 = require("../menu/menu.definition");
const DECISION_CACHE_TTL = 300;
const DECISION_CACHE_PREFIX = 'decision';
let DecisionOrchestrator = DecisionOrchestrator_1 = class DecisionOrchestrator {
    effectivePermissionsService;
    decisionCenter;
    cache;
    logger = new common_1.Logger(DecisionOrchestrator_1.name);
    constructor(effectivePermissionsService, decisionCenter, cache) {
        this.effectivePermissionsService = effectivePermissionsService;
        this.decisionCenter = decisionCenter;
        this.cache = cache;
    }
    async getNavigationForUser(user) {
        const { userId, scopeType, scopeId } = user;
        const normalizedScopeType = scopeType || 'SYSTEM';
        const normalizedScopeId = scopeId || null;
        const routeHash = this.hashRoute('navigation');
        const result = await this.resolveDecisionCached(userId, normalizedScopeType, normalizedScopeId, routeHash);
        return result.navigation;
    }
    async getSessionState(user) {
        const { userId, scopeType, scopeId } = user;
        const normalizedScopeType = scopeType || 'SYSTEM';
        const normalizedScopeId = scopeId || null;
        const routeHash = this.hashRoute('session');
        return this.resolveDecisionCached(userId, normalizedScopeType, normalizedScopeId, routeHash);
    }
    async resolveDecisionCached(userId, scopeType, scopeId, routeHash) {
        const cacheKey = this.buildCacheKey(userId, scopeType, scopeId, routeHash);
        const cached = await this.cache.get(cacheKey);
        if (cached !== null) {
            this.logger.debug(`Decision Cache HIT: ${cacheKey}`);
            return cached;
        }
        this.logger.debug(`Decision Cache MISS: ${cacheKey} - computing...`);
        const permissions = await this.effectivePermissionsService.computeEffectivePermissions({
            userId,
            scopeType: scopeType,
            scopeId
        });
        const navigation = this.decisionCenter.resolveNavigationTree(menu_definition_1.ADMIN_MENU_TREE, permissions);
        const actions = this.decisionCenter.resolveActions(permissions);
        const canonicalPath = this.decisionCenter.getCanonicalPath(navigation);
        const result = {
            navigation,
            actions,
            canonicalPath
        };
        await this.cache.set(cacheKey, result, DECISION_CACHE_TTL);
        this.logger.debug(`Decision resolved for ${userId}: ${navigation.length} items, ${actions.length} actions`);
        return result;
    }
    buildCacheKey(userId, scopeType, scopeId, routeHash) {
        const scopeValue = scopeId || 'SYSTEM';
        return `${DECISION_CACHE_PREFIX}:user:${userId}:scope:${scopeType}:${scopeValue}:route:${routeHash}`;
    }
    hashRoute(route) {
        return (0, crypto_1.createHash)('md5').update(route).digest('hex').substring(0, 8);
    }
    async invalidateUser(userId) {
        const prefix = `${DECISION_CACHE_PREFIX}:user:${userId}:`;
        await this.cache.delByPrefix(prefix);
        this.logger.log(`Invalidated decision cache for user: ${userId}`);
    }
};
exports.DecisionOrchestrator = DecisionOrchestrator;
exports.DecisionOrchestrator = DecisionOrchestrator = DecisionOrchestrator_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cached_effective_permissions_service_1.CachedEffectivePermissionsService,
        decision_center_service_1.DecisionCenterService,
        cache_service_1.CacheService])
], DecisionOrchestrator);
//# sourceMappingURL=decision.orchestrator.js.map