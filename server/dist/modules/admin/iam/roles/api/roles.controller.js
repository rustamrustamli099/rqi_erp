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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const roles_service_1 = require("../application/roles.service");
const role_permissions_service_1 = require("../application/role-permissions.service");
const create_role_dto_1 = require("./dto/create-role.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const update_role_permissions_dto_1 = require("./dto/update-role-permissions.dto");
const jwt_auth_guard_1 = require("../../../../../platform/auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../../platform/auth/permissions.guard");
const pagination_dto_1 = require("../../../../../common/dto/pagination.dto");
let RolesController = class RolesController {
    rolesService;
    rolePermissionsService;
    constructor(rolesService, rolePermissionsService) {
        this.rolesService = rolesService;
        this.rolePermissionsService = rolePermissionsService;
    }
    updatePermissions(id, dto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.rolePermissionsService.updateRolePermissions(userId, id, dto);
    }
    create(createRoleDto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.rolesService.create(createRoleDto, userId);
    }
    findAll(query) {
        return this.rolesService.findAll(query);
    }
    async debugCheck() {
        return this.rolesService.debugCount();
    }
    findOne(id) {
        return this.rolesService.findOne(id);
    }
    update(id, updateRoleDto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.rolesService.update(id, updateRoleDto, userId);
    }
    submitForApproval(id, req) {
        const userId = req.user.sub || req.user.userId;
        return this.rolesService.submitForApproval(id, userId);
    }
    approve(id, req) {
        const approverId = req.user.sub || req.user.userId;
        return this.rolesService.approve(id, approverId);
    }
    reject(id, reason, req) {
        if (!reason)
            throw new common_1.BadRequestException('Reason is required');
        const userId = req.user.sub || req.user.userId;
        return this.rolesService.reject(id, reason, userId);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Put)(':id/permissions'),
    (0, permissions_guard_1.RequirePermissions)('system.roles.manage_permissions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_permissions_dto_1.UpdateRolePermissionsDto, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "updatePermissions", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.ListQueryDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('debug-check'),
    (0, common_1.UseGuards)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "debugCheck", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_dto_1.UpdateRoleDto, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "submitForApproval", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "reject", null);
exports.RolesController = RolesController = __decorate([
    (0, common_1.Controller)('admin/roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [roles_service_1.RolesService,
        role_permissions_service_1.RolePermissionsService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map