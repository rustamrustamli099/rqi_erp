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
const effective_permissions_service_1 = require("../auth/effective-permissions.service");
const decision_center_service_1 = require("./decision-center.service");
const menu_definition_1 = require("../menu/menu.definition");
let DecisionOrchestrator = DecisionOrchestrator_1 = class DecisionOrchestrator {
    effectivePermissionsService;
    decisionCenter;
    logger = new common_1.Logger(DecisionOrchestrator_1.name);
    constructor(effectivePermissionsService, decisionCenter) {
        this.effectivePermissionsService = effectivePermissionsService;
        this.decisionCenter = decisionCenter;
    }
    async getNavigationForUser(user) {
        const { userId, scopeType, scopeId } = user;
        const permissions = await this.effectivePermissionsService.computeEffectivePermissions({
            userId,
            scopeType: scopeType || 'SYSTEM',
            scopeId: scopeId || null
        });
        const navigationTree = this.decisionCenter.resolveNavigationTree(menu_definition_1.ADMIN_MENU_TREE, permissions);
        this.logger.debug(`Resolved Navigation for ${userId} in ${scopeType}:${scopeId} -> ${navigationTree.length} root items`);
        return navigationTree;
    }
    async getSessionState(user) {
        const { userId, scopeType, scopeId } = user;
        const permissions = await this.effectivePermissionsService.computeEffectivePermissions({
            userId,
            scopeType: scopeType || 'SYSTEM',
            scopeId: scopeId || null
        });
        const navigation = this.decisionCenter.resolveNavigationTree(menu_definition_1.ADMIN_MENU_TREE, permissions);
        const actions = this.decisionCenter.resolveActions(permissions);
        const canonicalPath = this.decisionCenter.getCanonicalPath(navigation);
        this.logger.debug(`Resolved State for ${userId}: ${navigation.length} menu items, ${actions.length} actions`);
        return {
            navigation,
            actions,
            canonicalPath
        };
    }
};
exports.DecisionOrchestrator = DecisionOrchestrator;
exports.DecisionOrchestrator = DecisionOrchestrator = DecisionOrchestrator_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [effective_permissions_service_1.EffectivePermissionsService,
        decision_center_service_1.DecisionCenterService])
], DecisionOrchestrator);
//# sourceMappingURL=decision.orchestrator.js.map