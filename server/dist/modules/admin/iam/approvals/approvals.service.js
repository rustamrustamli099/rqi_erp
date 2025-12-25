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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const roles_service_1 = require("../roles/application/roles.service");
const client_1 = require("@prisma/client");
let ApprovalsService = class ApprovalsService {
    rolesService;
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    async getPendingApprovals(userId, permissions) {
        const items = [];
        const canApproveSystemRoles = permissions.includes('system.roles.approve');
        const canApproveTenantRoles = permissions.includes('tenant.roles.approve') || permissions.includes('system.tenants.roles.approve');
        if (canApproveSystemRoles || canApproveTenantRoles) {
            const result = await this.rolesService.findAll({
                filters: { status: client_1.RoleStatus.PENDING_APPROVAL },
                take: 100,
                skip: 0
            });
            const roles = result.items;
            for (const role of roles) {
                if (role.submittedById === userId || role.createdById === userId) {
                    continue;
                }
                if (role.scope === 'SYSTEM' && !canApproveSystemRoles)
                    continue;
                if (role.scope === 'TENANT' && !canApproveTenantRoles)
                    continue;
                items.push({
                    id: role.id,
                    type: 'ROLE',
                    title: `Role Approval: ${role.name}`,
                    description: role.description || `Scope: ${role.scope}`,
                    status: role.status,
                    createdAt: role.createdAt,
                    createdBy: {
                        id: role.createdById,
                        email: 'unknown',
                    },
                    metadata: {
                        scope: role.scope,
                        permissionsCount: role._count?.permissions
                    }
                });
            }
        }
        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async approve(id, type, approverId) {
        if (type === 'ROLE') {
            return this.rolesService.approve(id, approverId);
        }
        throw new common_1.ForbiddenException('Unknown approval type');
    }
    async reject(id, type, reason, userId) {
        if (type === 'ROLE') {
            return this.rolesService.reject(id, reason, userId);
        }
        throw new common_1.ForbiddenException('Unknown approval type');
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map