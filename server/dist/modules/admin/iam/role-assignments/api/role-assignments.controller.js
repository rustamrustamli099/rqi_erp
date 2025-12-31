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
exports.RoleAssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const role_assignments_service_1 = require("../application/role-assignments.service");
const assign_role_dto_1 = require("./dto/assign-role.dto");
const jwt_auth_guard_1 = require("../../../../../platform/auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../../platform/auth/permissions.guard");
let RoleAssignmentsController = class RoleAssignmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async assign(dto, req) {
        const userId = req.user.sub || req.user.userId;
        const context = {
            scopeType: req.user.scopeType || 'SYSTEM',
            scopeId: req.user.scopeId || null
        };
        return this.service.assign(dto, userId, context);
    }
    async revoke(userId, roleId, scopeType, scopeId, req) {
        if (!scopeType) {
            throw new common_1.BadRequestException('scopeType is required (SYSTEM or TENANT)');
        }
        if (scopeType === 'TENANT' && !scopeId) {
            throw new common_1.BadRequestException('scopeId is required for TENANT scope');
        }
        const currentUserId = req.user.sub || req.user.userId;
        const userContext = {
            scopeType: req.user.scopeType || 'SYSTEM',
            scopeId: req.user.scopeId || null
        };
        if (userContext.scopeType === 'TENANT') {
            if (scopeType === 'SYSTEM') {
                throw new common_1.BadRequestException('Security Violation: Tenant Admin cannot revoke SYSTEM assignments.');
            }
            if (scopeType === 'TENANT' && scopeId !== userContext.scopeId) {
                throw new common_1.BadRequestException('Security Violation: Cross-Tenant revocation denied.');
            }
        }
        const targetContext = {
            scopeType,
            scopeId: scopeId || null
        };
        return this.service.revoke(userId, roleId, currentUserId, targetContext);
    }
    async listByUser(userId, scopeType, scopeId, req) {
        if (!scopeType) {
            throw new common_1.BadRequestException('scopeType is required (SYSTEM or TENANT)');
        }
        if (scopeType === 'TENANT' && !scopeId) {
            throw new common_1.BadRequestException('scopeId is required for TENANT scope');
        }
        const userContext = {
            scopeType: req.user.scopeType || 'SYSTEM',
            scopeId: req.user.scopeId || null
        };
        if (userContext.scopeType === 'TENANT') {
            if (scopeType === 'SYSTEM') {
                throw new common_1.BadRequestException('Security Violation: Tenant Admin cannot view SYSTEM assignments.');
            }
            if (scopeType === 'TENANT' && scopeId !== userContext.scopeId) {
                throw new common_1.BadRequestException('Security Violation: Cross-Tenant access denied.');
            }
        }
        const targetContext = {
            scopeType,
            scopeId: scopeId || null
        };
        return this.service.listByUser(userId, targetContext);
    }
};
exports.RoleAssignmentsController = RoleAssignmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_guard_1.RequirePermissions)('iam.assignments.create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_role_dto_1.AssignRoleDto, Object]),
    __metadata("design:returntype", Promise)
], RoleAssignmentsController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)(':userId/:roleId'),
    (0, permissions_guard_1.RequirePermissions)('iam.assignments.delete'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Query)('scopeType')),
    __param(3, (0, common_1.Query)('scopeId')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], RoleAssignmentsController.prototype, "revoke", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, permissions_guard_1.RequirePermissions)('iam.assignments.read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('scopeType')),
    __param(2, (0, common_1.Query)('scopeId')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], RoleAssignmentsController.prototype, "listByUser", null);
exports.RoleAssignmentsController = RoleAssignmentsController = __decorate([
    (0, common_1.Controller)('admin/iam/assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [role_assignments_service_1.RoleAssignmentsService])
], RoleAssignmentsController);
//# sourceMappingURL=role-assignments.controller.js.map