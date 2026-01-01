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
var RolesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../../../../../system/audit/audit.service");
const query_parser_1 = require("../../../../../common/utils/query-parser");
const cache_invalidation_service_1 = require("../../../../../platform/cache/cache-invalidation.service");
let RolesService = RolesService_1 = class RolesService {
    prisma;
    auditService;
    cacheInvalidation;
    logger = new common_1.Logger(RolesService_1.name);
    constructor(prisma, auditService, cacheInvalidation) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.cacheInvalidation = cacheInvalidation;
    }
    async debugCount() {
        const total = await this.prisma.role.count();
        const first = await this.prisma.role.findFirst();
        console.log("DEBUG COUNT:", { total, first });
        return { total, first };
    }
    async create(dto, userId, context) {
        if (context.scopeType === 'TENANT') {
            if (dto.scope !== 'TENANT') {
                throw new common_1.ForbiddenException('Security Violation: Tenant users can only create TENANT scoped roles.');
            }
        }
        const effectiveTenantId = context.scopeType === 'TENANT' ? context.scopeId : null;
        const existing = await this.prisma.role.findFirst({
            where: {
                name: { equals: dto.name, mode: 'insensitive' },
                scope: dto.scope,
                tenantId: effectiveTenantId
            }
        });
        if (existing) {
            throw new common_1.BadRequestException(`Role with name '${dto.name}' already exists in this scope.`);
        }
        let permissionConnect = [];
        let permissionSlugs = [];
        const inputPerms = dto.permissionIds || dto.permissionSlugs || [];
        if (inputPerms.length > 0) {
            const uniqueSlugs = [...new Set(inputPerms)];
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
                tenantId: effectiveTenantId,
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
                tenantId: effectiveTenantId,
                assigned_permissions: permissionSlugs
            },
            module: 'ACCESS_CONTROL',
            userId: userId,
            tenantId: effectiveTenantId || undefined
        });
        return role;
    }
    async findAll(query, context) {
        const { skip, take, orderBy, page, pageSize, search, filters } = query_parser_1.QueryParser.parse(query, ['name', 'createdAt', 'level', 'scope', 'status']);
        const where = {};
        if (context) {
            if (context.scopeType === 'TENANT') {
                where.OR = [
                    { tenantId: context.scopeId },
                    { scope: 'SYSTEM' }
                ];
            }
        }
        if (search) {
            where.AND = [
                ...(where.OR ? [{ OR: where.OR }] : []),
                {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                }
            ];
            delete where.OR;
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
    async submitForApproval(id, userId, context) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'submit');
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
            tenantId: role.tenantId || undefined
        });
        return result;
    }
    async approve(id, approverId, context) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'approve');
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
            tenantId: role.tenantId || undefined
        });
        return result;
    }
    async reject(id, reason, userId = 'SYSTEM', context) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'reject');
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
            tenantId: role.tenantId || undefined
        });
        return result;
    }
    async update(id, dto, userId = 'SYSTEM', context) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'update');
        if (role.isLocked) {
            throw new common_1.ForbiddenException('Cannot edit a locked System Role.');
        }
        if (dto.scope && dto.scope !== role.scope) {
            throw new common_1.BadRequestException('Role Scope cannot be changed once created.');
        }
        let newStatus = role.status;
        const auditDetails = { roleId: id };
        const inputPerms = dto.permissionIds || dto.permissionSlugs;
        if (inputPerms) {
            const oldPermissionsMap = new Map();
            role.permissions.forEach(rp => {
                oldPermissionsMap.set(rp.permission.slug, rp.permissionId);
            });
            const oldSlugs = Array.from(oldPermissionsMap.keys());
            let newSlugsUnique = [...new Set(inputPerms)];
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
            console.log("---------------- ROLE UPDATE DEBUG ----------------");
            console.log("Input Slugs:", inputPerms);
            console.log("DB Valid Slugs:", validNewPermissions.map(p => p.slug));
            console.log("Invalid Scope Slugs:", invalidScopePerms.map(p => p.slug));
            console.log("Slugs To ADD:", slugsToAdd);
            console.log("Slugs To REMOVE:", slugsToRemove);
            console.log("---------------------------------------------------");
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
        if (dto.childRoleIds) {
            const currentChildren = await this.prisma.compositeRole.findMany({
                where: { parentRoleId: id }
            });
            const oldChildIds = currentChildren.map(c => c.childRoleId);
            const newChildIds = [...new Set(dto.childRoleIds)];
            if (newChildIds.length > 0) {
                const invalidChildren = await this.prisma.role.findMany({
                    where: {
                        id: { in: newChildIds },
                        OR: context.scopeType === 'SYSTEM'
                            ? [{ scope: 'TENANT' }]
                            : []
                    }
                });
                if (context.scopeType === 'SYSTEM' && invalidChildren.length > 0) {
                    throw new common_1.BadRequestException(`System Roles cannot contain Tenant Roles.`);
                }
                if (context.scopeType === 'TENANT') {
                    const alienRoles = await this.prisma.role.findMany({
                        where: {
                            id: { in: newChildIds },
                            AND: [
                                { scope: 'TENANT' },
                                { tenantId: { not: context.scopeId } }
                            ]
                        }
                    });
                    if (alienRoles.length > 0) {
                        throw new common_1.BadRequestException(`Security Violation: Cannot include roles from another tenant.`);
                    }
                }
            }
            for (const childId of newChildIds) {
                const hasCycle = await this.detectCycle(childId, id);
                if (hasCycle) {
                    throw new common_1.BadRequestException(`Cycle Detected: Role ${childId} already contains ${id} recursively.`);
                }
            }
            const kidsToRemove = oldChildIds.filter(c => !newChildIds.includes(c));
            const kidsToAdd = newChildIds.filter(c => !oldChildIds.includes(c));
            await this.prisma.$transaction(async (tx) => {
                if (kidsToRemove.length > 0) {
                    await tx.compositeRole.deleteMany({
                        where: {
                            parentRoleId: id,
                            childRoleId: { in: kidsToRemove }
                        }
                    });
                }
                if (kidsToAdd.length > 0) {
                    await tx.compositeRole.createMany({
                        data: kidsToAdd.map(cid => ({
                            parentRoleId: id,
                            childRoleId: cid
                        }))
                    });
                }
            });
            auditDetails.child_roles = {
                removed: kidsToRemove,
                added: kidsToAdd
            };
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
                    id: { not: id },
                    tenantId: role.tenantId
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
            tenantId: role.tenantId || undefined
        });
        const affectedUsers = await this.getAffectedUsers(id);
        await this.cacheInvalidation.invalidateUsers(affectedUsers);
        this.logger.log(`Cache invalidated for ${affectedUsers.length} users after role update`);
        return updatedRole;
    }
    async remove(id, userId, context) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'delete');
        if (role.isLocked) {
            throw new common_1.ForbiddenException('Cannot delete a locked System Role.');
        }
        const assignmentCount = await this.prisma.userRole.count({ where: { roleId: id } });
        if (assignmentCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete role '${role.name}' because it has ${assignmentCount} active assignments.`);
        }
        const affectedUsers = await this.getAffectedUsers(id);
        await this.prisma.$transaction([
            this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
            this.prisma.role.delete({ where: { id } })
        ]);
        await this.auditService.logAction({
            action: 'ROLE_DELETED',
            resource: 'Role',
            details: { roleId: id, name: role.name },
            module: 'ACCESS_CONTROL',
            userId: userId,
            tenantId: role.tenantId || undefined
        });
        await this.cacheInvalidation.invalidateUsers(affectedUsers);
        this.logger.log(`Cache invalidated for ${affectedUsers.length} users after role deletion`);
        return { success: true };
    }
    verifyOwnership(role, context, action) {
        if (context.scopeType === 'TENANT') {
            if (role.scope === 'SYSTEM') {
                throw new common_1.ForbiddenException(`Security Violation: Tenant cannot ${action} a SYSTEM role.`);
            }
            if (role.tenantId !== context.scopeId) {
                throw new common_1.ForbiddenException(`Security Violation: You do not have access to this role.`);
            }
        }
    }
    async detectCycle(startNodeId, targetNodeId) {
        const toVisit = [startNodeId];
        const visited = new Set();
        while (toVisit.length > 0) {
            const current = toVisit.pop();
            if (!current || visited.has(current))
                continue;
            visited.add(current);
            if (current === targetNodeId)
                return true;
            const children = await this.prisma.compositeRole.findMany({
                where: { parentRoleId: current },
                select: { childRoleId: true }
            });
            for (const c of children) {
                if (!visited.has(c.childRoleId)) {
                    toVisit.push(c.childRoleId);
                }
            }
        }
        return false;
    }
    async getAffectedUsers(roleId) {
        const directAssignments = await this.prisma.userRole.findMany({
            where: { roleId: roleId },
            select: { userId: true }
        });
        const userIds = new Set(directAssignments.map((a) => a.userId));
        const parentRoles = await this.getParentRoles(roleId);
        for (const parentRoleId of parentRoles) {
            const parentAssignments = await this.prisma.userRole.findMany({
                where: { roleId: parentRoleId },
                select: { userId: true }
            });
            parentAssignments.forEach((a) => userIds.add(a.userId));
        }
        return Array.from(userIds);
    }
    async getParentRoles(roleId) {
        const parentIds = new Set();
        const toVisit = [roleId];
        while (toVisit.length > 0) {
            const current = toVisit.pop();
            if (!current)
                continue;
            const parents = await this.prisma.compositeRole.findMany({
                where: { childRoleId: current },
                select: { parentRoleId: true }
            });
            for (const p of parents) {
                if (!parentIds.has(p.parentRoleId)) {
                    parentIds.add(p.parentRoleId);
                    toVisit.push(p.parentRoleId);
                }
            }
        }
        return Array.from(parentIds);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = RolesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        cache_invalidation_service_1.CacheInvalidationService])
], RolesService);
//# sourceMappingURL=roles.service.js.map