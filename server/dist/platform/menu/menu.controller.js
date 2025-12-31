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
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const menu_service_1 = require("./menu.service");
const menu_definition_1 = require("./menu.definition");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_context_guard_1 = require("../tenant-context/tenant-context.guard");
const effective_permissions_service_1 = require("../auth/effective-permissions.service");
let MenuController = class MenuController {
    menuService;
    effectivePermissionsService;
    constructor(menuService, effectivePermissionsService) {
        this.menuService = menuService;
        this.effectivePermissionsService = effectivePermissionsService;
    }
    async getMyMenu(req) {
        const { userId, scopeType, scopeId } = req.user;
        let userPermissions = [];
        if (userId) {
            userPermissions = await this.effectivePermissionsService.computeEffectivePermissions({
                userId,
                scopeType: scopeType || 'SYSTEM',
                scopeId: scopeId || null
            });
        }
        return this.menuService.filterMenu(menu_definition_1.ADMIN_MENU_TREE, userPermissions);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getMyMenu", null);
exports.MenuController = MenuController = __decorate([
    (0, common_1.Controller)('me/menu'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_context_guard_1.TenantContextGuard),
    __metadata("design:paramtypes", [menu_service_1.MenuService,
        effective_permissions_service_1.EffectivePermissionsService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map