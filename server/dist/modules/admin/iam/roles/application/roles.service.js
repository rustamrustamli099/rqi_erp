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
const query_parser_1 = require("../../../../../common/utils/query-parser");
let RolesService = class RolesService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async debugCount() {
        const total = await this.prisma.role.count();
        const first = await this.prisma.role.findFirst();
        console.log("DEBUG COUNT:", { total, first });
        return { total, first };
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
        let permissionConnect = [];
        let permissionSlugs = [];
        if (dto.permissionIds && dto.permissionIds.length > 0) {
            const uniqueSlugs = [...new Set(dto.permissionIds)];
            permissionSlugs = uniqueSlugs;
            const permissions = await this.prisma.permission.findMany({
                where: {
                    slug: { in: uniqueSlugs }
                }
            });
            const invalidPermissions = permissions.filter(p => {
                if (dto.scope === 'SYSTEM' && p.scope === 'TENANT')
                    return true;
                if (dto.scope === 'TENANT' && p.scope === 'SYSTEM')
                    return true;
                return false;
            });
            if (invalidPermissions.length > 0) {
                throw new common_1.BadRequestException(`Security Violation: Attempted to assign invalid scope permissions to ${dto.scope} role: ${invalidPermissions.map(p => p.slug).join(', ')}`);
            }
            permissionConnect = permissions.map(p => ({
                permissionId: p.id
            }));
        }
        const role = await this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                scope: dto.scope,
                level: 10,
                isLocked: false,
                isEnabled: true,
                isSystem: dto.scope === 'SYSTEM',
                status: client_1.RoleStatus.DRAFT,
                createdById: userId,
                submittedById: userId,
                permissions: {
                    createMany: {
                        data: permissionConnect
                    }
                }
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_CREATED',
            resource: 'Role',
            details: {
                roleId: role.id,
                name: role.name,
                scope: role.scope,
                assigned_permissions: permissionSlugs
            },
            module: 'ACCESS_CONTROL',
            userId: userId,
        });
        return role;
    }
    async findAll(query) {
        const { skip, take, orderBy, page, pageSize, search, filters } = query_parser_1.QueryParser.parse(query, ['name', 'createdAt', 'level', 'scope', 'status']);
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (filters) {
            if (filters.scope)
                where.scope = filters.scope;
            if (filters.status)
                where.status = filters.status;
        }
        console.log("RolesService.findAll [SAP-Grade]:", { where, skip, take, orderBy });
        const [items, total] = await Promise.all([
            this.prisma.role.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    _count: { select: { userRoles: true, permissions: true } },
                    permissions: { include: { permission: true } }
                }
            }),
            this.prisma.role.count({ where })
        ]);
        return {
            items,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            },
            query: {
                sortBy: Object.keys(orderBy)[0],
                sortDir: Object.values(orderBy)[0],
                search,
                filters
            }
        };
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
            userId: userId,
        });
        return result;
    }
    async approve(id, approverId) {
        const role = await this.findOne(id);
        if (role.status !== client_1.RoleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Role is not pending approval');
        }
        if (role.submittedById === approverId || role.createdById === approverId) {
            throw new common_1.ForbiddenException('Security Violation: 4-Eyes Principle. You cannot approve a role you created or submitted.');
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
    async reject(id, reason, userId = 'SYSTEM') {
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
            userId: userId,
        });
        return result;
    }
    async update(id, dto, userId = 'SYSTEM') {
        const role = await this.findOne(id);
        if (role.isLocked) {
            throw new common_1.ForbiddenException('Cannot edit a locked System Role.');
        }
        if (dto.scope && dto.scope !== role.scope) {
            throw new common_1.BadRequestException('Role Scope cannot be changed once created.');
        }
        let newStatus = role.status;
        const auditDetails = { roleId: id };
        if (dto.permissionIds) {
            const oldPermissionsMap = new Map();
            role.permissions.forEach(rp => {
                oldPermissionsMap.set(rp.permission.slug, rp.permissionId);
            });
            const oldSlugs = Array.from(oldPermissionsMap.keys());
            let newSlugsUnique = [...new Set(dto.permissionIds)];
            const potentialReadSlugs = new Set();
            newSlugsUnique.forEach(slug => {
                const parts = slug.split('.');
                if (parts.length > 1) {
                    const action = parts[parts.length - 1];
                    if (action !== 'read' && action !== 'view') {
                        const base = parts.slice(0, parts.length - 1).join('.');
                        potentialReadSlugs.add(`${base}.read`);
                        potentialReadSlugs.add(`${base}.view`);
                    }
                }
            });
            if (potentialReadSlugs.size > 0) {
                const existingReadPerms = await this.prisma.permission.findMany({
                    where: { slug: { in: Array.from(potentialReadSlugs) } },
                    select: { slug: true }
                });
                existingReadPerms.forEach(p => {
                    if (!newSlugsUnique.includes(p.slug)) {
                        newSlugsUnique.push(p.slug);
                    }
                });
            }
            const validNewPermissions = await this.prisma.permission.findMany({
                where: { slug: { in: newSlugsUnique } }
            });
            const newPermissionsMap = new Map();
            validNewPermissions.forEach(p => {
                newPermissionsMap.set(p.slug, p.id);
            });
            const newSlugs = Array.from(newPermissionsMap.keys());
            const invalidScopePerms = validNewPermissions.filter(p => {
                if (role.scope === 'SYSTEM' && p.scope === 'TENANT')
                    return true;
                if (role.scope === 'TENANT' && p.scope === 'SYSTEM')
                    return true;
                return false;
            });
            if (invalidScopePerms.length > 0) {
                throw new common_1.BadRequestException(`Security Violation: Invalid scope permissions for ${role.scope}: ${invalidScopePerms.map(p => p.slug).join(', ')}`);
            }
            const slugsToRemove = oldSlugs.filter(s => !newSlugs.includes(s));
            const slugsToAdd = newSlugs.filter(s => !oldSlugs.includes(s));
            const idsToRemove = slugsToRemove.map(s => oldPermissionsMap.get(s)).filter(Boolean);
            const idsToAdd = slugsToAdd.map(s => newPermissionsMap.get(s)).filter(Boolean);
            await this.prisma.$transaction(async (tx) => {
                if (idsToRemove.length > 0) {
                    await tx.rolePermission.deleteMany({
                        where: {
                            roleId: id,
                            permissionId: { in: idsToRemove }
                        }
                    });
                }
                if (idsToAdd.length > 0) {
                    await tx.rolePermission.createMany({
                        data: idsToAdd.map(permId => ({
                            roleId: id,
                            permissionId: permId
                        }))
                    });
                }
            });
            auditDetails.permission_changes = {
                before: oldSlugs.sort(),
                after: newSlugs.sort(),
                removed: slugsToRemove,
                added: slugsToAdd
            };
            if (slugsToRemove.length > 0 || slugsToAdd.length > 0) {
                if (role.status === client_1.RoleStatus.ACTIVE) {
                    newStatus = client_1.RoleStatus.DRAFT;
                }
            }
        }
        const updateData = {};
        if (dto.name)
            updateData.name = dto.name;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        updateData.status = newStatus;
        if (dto.name && dto.name !== role.name) {
            const existing = await this.prisma.role.findFirst({
                where: {
                    name: { equals: dto.name, mode: 'insensitive' },
                    scope: role.scope,
                    id: { not: id }
                }
            });
            if (existing)
                throw new common_1.BadRequestException(`Role name '${dto.name}' is already taken.`);
        }
        const updatedRole = await this.prisma.role.update({
            where: { id },
            data: updateData,
            include: { permissions: { include: { permission: true } } }
        });
        await this.auditService.logAction({
            action: 'ROLE_UPDATED',
            resource: 'Role',
            details: auditDetails,
            module: 'ACCESS_CONTROL',
            userId: userId,
        });
        return updatedRole;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RolesService);
//# sourceMappingURL=roles.service.js.map