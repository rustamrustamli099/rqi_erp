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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionController = void 0;
const common_1 = require("@nestjs/common");
const decision_orchestrator_1 = require("./decision.orchestrator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const action_registry_1 = require("./action.registry");
let DecisionController = class DecisionController {
    decisionOrchestrator;
    constructor(decisionOrchestrator) {
        this.decisionOrchestrator = decisionOrchestrator;
    }
    async getPageState(pageKey, req) {
        const sessionState = await this.decisionOrchestrator.getSessionState(req.user);
        const userActions = sessionState.actions;
        const actionSet = new Set(userActions);
        const entityKey = this.mapPageKeyToEntity(pageKey);
        const entityConfig = action_registry_1.ACTION_PERMISSIONS_REGISTRY.find(e => e.entityKey === entityKey);
        const actions = {};
        if (entityConfig) {
            for (const action of entityConfig.actions) {
                const semanticKey = `GS_${entityKey.toUpperCase()}_${action.actionKey.toUpperCase()}`;
                actions[semanticKey] = actionSet.has(action.permissionSlug);
            }
        }
        const result = {
            authorized: true,
            pageKey,
            sections: {},
            actions
        };
        console.log('[PAGE-STATE] Response for', pageKey, ':', JSON.stringify(result, null, 2));
        return result;
    }
    mapPageKeyToEntity(pageKey) {
        const mapping = {
            'Z_USERS': 'users',
            'Z_ROLES': 'roles',
            'Z_CURATORS': 'curators',
        };
        return mapping[pageKey] || pageKey.toLowerCase().replace('z_', '');
    }
};
exports.DecisionController = DecisionController;
__decorate([
    (0, common_1.Get)('page-state/:pageKey'),
    __param(0, (0, common_1.Param)('pageKey')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DecisionController.prototype, "getPageState", null);
exports.DecisionController = DecisionController = __decorate([
    (0, common_1.Controller)('decision'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [decision_orchestrator_1.DecisionOrchestrator])
], DecisionController);
//# sourceMappingURL=decision.controller.js.map