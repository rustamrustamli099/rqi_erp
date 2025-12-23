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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../../../../../system/audit/audit.service");
let RolesService = class RolesService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(dto, userId) {
        const existing = await this.prisma.role.findFirst({
            where: {
                name: { equals: dto.name, mode: 'insensitive' },
                scope: dto.scope
            }
        });
        if (existing) {
            throw new common_1.BadRequestException(`Role with name '${dto.name}' already exists in ${dto.scope} scope.`);
        }
        return this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                scope: dto.scope,
                level: 10,
                isLocked: false,
                isEnabled: true,
                isSystem: dto.scope === 'SYSTEM',
                status: client_1.RoleStatus.DRAFT,
                submittedById: userId
            }
        });
    }
    async findAll(scope) {
        const where = {};
        if (scope) {
            where.scope = scope;
        }
        return this.prisma.role.findMany({
            where,
            include: {
                _count: { select: { userRoles: true, permissions: true } }
            },
            orderBy: {
                level: 'desc'
            }
        });
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: { permission: true }
                }
            }
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async submitForApproval(id, userId) {
        const role = await this.findOne(id);
        if (role.status !== client_1.RoleStatus.DRAFT && role.status !== client_1.RoleStatus.REJECTED) {
            throw new common_1.BadRequestException('Only Draft or Rejected roles can be submitted');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: client_1.RoleStatus.PENDING_APPROVAL,
                submittedById: userId
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_SUBMITTED',
            resource: 'Role',
            details: { roleId: id },
            module: 'ACCESS_CONTROL',
            userId: 'SYSTEM',
        });
        return result;
    }
    async approve(id, approverId) {
        const role = await this.findOne(id);
        if (role.status !== client_1.RoleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Role is not pending approval');
        }
        if (role.submittedById === approverId) {
            throw new common_1.ForbiddenException('You cannot approve your own role request (4-Eyes Principle violation)');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: client_1.RoleStatus.ACTIVE,
                approverId,
                approvalNote: null
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_APPROVED',
            resource: 'Role',
            details: { roleId: id, approverId },
            module: 'ACCESS_CONTROL',
            userId: approverId,
        });
        return result;
    }
    async reject(id, reason) {
        const role = await this.findOne(id);
        if (role.status !== client_1.RoleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Role is not pending approval');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: client_1.RoleStatus.REJECTED,
                approvalNote: reason
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_REJECTED',
            resource: 'Role',
            details: { roleId: id, reason },
            module: 'ACCESS_CONTROL',
            userId: 'SYSTEM',
        });
        return result;
    }
    async update(id, dto, userId = 'SYSTEM') {
        const role = await this.findOne(id);
        if (role.isLocked) {
            throw new common_1.ForbiddenException('Cannot edit a locked System Role (e.g. SuperAdmin).');
        }
        const data = { ...dto };
        delete data.permissionIds;
        if (dto.scope && dto.scope !== role.scope) {
            throw new common_1.BadRequestException('Role Scope cannot be changed once created (SAP Immutable Rule).');
        }
        if (dto.permissionIds) {
            const permissions = await this.prisma.permission.findMany({
                where: {
                    slug: { in: dto.permissionIds }
                }
            });
            const invalidPermissions = permissions.filter(p => {
                if (role.scope === 'SYSTEM' && p.scope === 'TENANT')
                    return true;
                if (role.scope === 'TENANT' && p.scope === 'SYSTEM')
                    return true;
                return false;
            });
            if (invalidPermissions.length > 0) {
                throw new common_1.BadRequestException(`Security Violation: Attempted to assign invalid scope permissions to ${role.scope} role: ${invalidPermissions.map(p => p.slug).join(', ')}`);
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.rolePermission.deleteMany({ where: { roleId: id } });
                if (permissions.length > 0) {
                    await tx.rolePermission.createMany({
                        data: permissions.map(p => ({
                            roleId: id,
                            permissionId: p.id
                        }))
                    });
                }
            });
            await this.auditService.logAction({
                action: 'ROLE_PERMISSIONS_UPDATED',
                resource: 'Role',
                details: { roleId: id, count: permissions.length, slugs: dto.permissionIds },
                module: 'ACCESS_CONTROL',
                userId: userId,
            });
        }
        let newStatus = role.status;
        if (role.status === client_1.RoleStatus.ACTIVE && dto.permissionIds) {
            newStatus = client_1.RoleStatus.DRAFT;
        }
        return this.prisma.role.update({
            where: { id },
            data: {
                ...data,
                status: newStatus
            },
            include: { permissions: true }
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RolesService);
//# sourceMappingURL=roles.service.js.map