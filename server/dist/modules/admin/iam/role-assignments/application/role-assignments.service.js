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
exports.RoleAssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../prisma.service");
const audit_service_1 = require("../../../../../system/audit/audit.service");
let RoleAssignmentsService = class RoleAssignmentsService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async assign(dto, assignedBy, context) {
        const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (context.scopeType === 'TENANT') {
            if (role.scope === 'TENANT' && role.tenantId !== context.scopeId) {
                throw new common_1.ForbiddenException('Security Violation: Cannot assign a role belonging to another tenant.');
            }
        }
        else if (context.scopeType === 'SYSTEM') {
            if (role.scope === 'TENANT') {
                throw new common_1.BadRequestException('Context Mismatch: Switch to the specific Tenant context to assign Tenant Roles.');
            }
        }
        const existing = await this.prisma.userRoleAssignment.findFirst({
            where: {
                userId: dto.userId,
                roleId: dto.roleId,
                scopeType: context.scopeType,
                scopeId: context.scopeId
            }
        });
        if (existing) {
            throw new common_1.ConflictException('User already has this role in the current scope.');
        }
        const result = await this.prisma.userRoleAssignment.create({
            data: {
                userId: dto.userId,
                roleId: dto.roleId,
                scopeType: context.scopeType,
                scopeId: context.scopeId,
                assignedBy: assignedBy,
                assignedAt: new Date(),
                validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
                validTo: dto.validTo ? new Date(dto.validTo) : null
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_ASSIGNED',
            resource: 'UserRoleAssignment',
            details: {
                userId: dto.userId,
                roleId: dto.roleId,
                roleName: role.name,
                scope: context.scopeType,
                tenantId: context.scopeId
            },
            module: 'ACCESS_CONTROL',
            userId: assignedBy,
            tenantId: context.scopeId || undefined
        });
        return result;
    }
    async revoke(userId, roleId, revokedBy, context) {
        const assignment = await this.prisma.userRoleAssignment.findFirst({
            where: {
                userId: userId,
                roleId: roleId,
                scopeType: context.scopeType,
                scopeId: context.scopeId
            }
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found in current scope.');
        }
        await this.prisma.userRoleAssignment.delete({
            where: { id: assignment.id }
        });
        await this.auditService.logAction({
            action: 'ROLE_REVOKED',
            resource: 'UserRoleAssignment',
            details: {
                userId: userId,
                roleId: roleId,
                scope: context.scopeType,
                tenantId: context.scopeId
            },
            module: 'ACCESS_CONTROL',
            userId: revokedBy,
            tenantId: context.scopeId || undefined
        });
        return { success: true };
    }
    async listByUser(targetUserId, context) {
        return this.prisma.userRoleAssignment.findMany({
            where: {
                userId: targetUserId,
                scopeType: context.scopeType,
                scopeId: context.scopeId
            },
            include: {
                role: true
            }
        });
    }
};
exports.RoleAssignmentsService = RoleAssignmentsService;
exports.RoleAssignmentsService = RoleAssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RoleAssignmentsService);
//# sourceMappingURL=role-assignments.service.js.map