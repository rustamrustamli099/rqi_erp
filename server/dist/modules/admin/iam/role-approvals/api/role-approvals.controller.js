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
exports.RoleApprovalsController = void 0;
const common_1 = require("@nestjs/common");
const role_approvals_service_1 = require("../application/role-approvals.service");
const jwt_auth_guard_1 = require("../../../../../platform/auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../../platform/auth/permissions.guard");
const swagger_1 = require("@nestjs/swagger");
const create_role_change_request_dto_1 = require("./dto/create-role-change-request.dto");
const reject_request_dto_1 = require("./dto/reject-request.dto");
let RoleApprovalsController = class RoleApprovalsController {
    approvalsService;
    constructor(approvalsService) {
        this.approvalsService = approvalsService;
    }
    async create(dto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.approvalsService.submitRequest(dto.roleId, userId, dto.diff, dto.reason);
    }
    async findAll(status) {
        return this.approvalsService.findAll(status);
    }
    async approve(id, req) {
        const userId = req.user.sub || req.user.userId;
        return this.approvalsService.approveRequest(id, userId);
    }
    async reject(id, dto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.approvalsService.rejectRequest(id, dto.reason, userId);
    }
};
exports.RoleApprovalsController = RoleApprovalsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a role change request' }),
    (0, permissions_guard_1.RequirePermissions)('system.roles.manage'),
    (0, swagger_1.ApiBody)({ type: create_role_change_request_dto_1.CreateRoleChangeRequestDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_change_request_dto_1.CreateRoleChangeRequestDto, Object]),
    __metadata("design:returntype", Promise)
], RoleApprovalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_guard_1.RequirePermissions)('system.roles.view'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleApprovalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, permissions_guard_1.RequirePermissions)('system.roles.approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoleApprovalsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, permissions_guard_1.RequirePermissions)('system.roles.approve'),
    (0, swagger_1.ApiBody)({ type: reject_request_dto_1.RejectRequestDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_request_dto_1.RejectRequestDto, Object]),
    __metadata("design:returntype", Promise)
], RoleApprovalsController.prototype, "reject", null);
exports.RoleApprovalsController = RoleApprovalsController = __decorate([
    (0, swagger_1.ApiTags)('Admin / IAM / Approvals'),
    (0, common_1.Controller)('admin/iam/role-approvals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [role_approvals_service_1.RoleApprovalsService])
], RoleApprovalsController);
//# sourceMappingURL=role-approvals.controller.js.map