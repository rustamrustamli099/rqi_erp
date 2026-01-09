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
exports.RolePermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../prisma.service");
const audit_service_1 = require("../../../../../system/audit/audit.service");
const cached_effective_permissions_service_1 = require("../../../../../platform/auth/cached-effective-permissions.service");
const decision_orchestrator_1 = require("../../../../../platform/decision/decision.orchestrator");
let RolePermissionsService = class RolePermissionsService {
    prisma;
    auditService;
    cachedPermissionsService;
    decisionOrchestrator;
    constructor(prisma, auditService, cachedPermissionsService, decisionOrchestrator) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.cachedPermissionsService = cachedPermissionsService;
        this.decisionOrchestrator = decisionOrchestrator;
    }
    async updateRolePermissions(actorId, roleId, payload) {
        try {
            console.log('[DEBUG-SERVICE] updateRolePermissions CALLED', { actorId, roleId, payload });
            const role = await this.prisma.role.findUnique({
                where: { id: roleId },
                include: { permissions: { include: { permission: true } } }
            });
            if (!role)
                throw new common_1.NotFoundException('Role not found');
            if (role.isLocked) {
                throw new common_1.ForbiddenException('ROLE_LOCKED: Cannot modify permissions of a locked system role.');
            }
            if (role.version !== payload.expectedVersion) {
                throw new common_1.ConflictException(`VERSION_CONFLICT: Expected version ${payload.expectedVersion} but found ${role.version}. Please refresh.`);
            }
            const requestedSlugs = [...new Set(payload.permissionSlugs)];
            if (requestedSlugs.length === 0 && role.status === 'ACTIVE') {
            }
            let requestedPerms = [];
            if (requestedSlugs.length > 0) {
                requestedPerms = await this.prisma.permission.findMany({
                    where: { slug: { in: requestedSlugs } }
                });
                const foundSlugs = requestedPerms.map(p => p.slug);
                const unknownSlugs = requestedSlugs.filter(s => !foundSlugs.includes(s));
                if (unknownSlugs.length > 0) {
                    throw new common_1.BadRequestException(`UNKNOWN_PERMISSION: The following permissions do not exist: ${unknownSlugs.join(', ')}`);
                }
                const invalidScopePerms = requestedPerms.filter(p => {
                    if (role.scope === 'SYSTEM' && p.scope === 'TENANT')
                        return true;
                    if (role.scope === 'TENANT' && p.scope === 'SYSTEM')
                        return true;
                    return false;
                });
                if (invalidScopePerms.length > 0) {
                    throw new common_1.BadRequestException(`SCOPE_MISMATCH: Invalid scope permissions for ${role.scope}: ${invalidScopePerms.map(p => p.slug).join(', ')}`);
                }
            }
            const currentPermIds = new Set(role.permissions.map(rp => rp.permissionId));
            const newPermIds = new Set(requestedPerms.map(p => p.id));
            const toRemove = [...currentPermIds].filter(id => !newPermIds.has(id));
            const toAdd = [...newPermIds].filter(id => !currentPermIds.has(id));
            const currentSlugs = role.permissions.map(rp => rp.permission.slug).sort();
            const newSlugs = requestedPerms.map(p => p.slug).sort();
            const result = await this.prisma.$transaction(async (tx) => {
                if (toRemove.length > 0) {
                    await tx.rolePermission.deleteMany({
                        where: {
                            roleId: roleId,
                            permissionId: { in: toRemove }
                        }
                    });
                }
                if (toAdd.length > 0) {
                    await tx.rolePermission.createMany({
                        data: toAdd.map(permId => ({
                            roleId: roleId,
                            permissionId: permId
                        }))
                    });
                }
                const hasChanges = toRemove.length > 0 || toAdd.length > 0;
                let updatedRole = role;
                if (hasChanges) {
                    updatedRole = await tx.role.update({
                        where: { id: roleId },
                        data: {
                            version: { increment: 1 },
                            status: role.status === 'ACTIVE' ? 'DRAFT' : role.status
                        }
                    });
                    await this.auditService.logAction({
                        action: 'ROLE_PERMISSIONS_UPDATED',
                        resource: 'Role',
                        details: {
                            roleId,
                            version: updatedRole.version,
                            before: currentSlugs,
                            after: newSlugs,
                            added: toAdd.map(id => requestedPerms.find(p => p.id === id)?.slug),
                            removed: toRemove.map(id => role.permissions.find(p => p.permissionId === id)?.permission.slug),
                            comment: payload.comment
                        },
                        module: 'ACCESS_CONTROL',
                        userId: actorId,
                    });
                }
                else {
                }
                return {
                    roleId: updatedRole.id,
                    version: updatedRole.version,
                    addedCount: toAdd.length,
                    removedCount: toRemove.length
                };
            });
            if (result.addedCount > 0 || result.removedCount > 0) {
                await this.invalidateCacheForUsersWithRole(roleId);
            }
            return result;
        }
        catch (error) {
            console.error('[FATAL-SERVICE] updateRolePermissions FAILED:', error);
            console.error(error.stack);
            throw error;
        }
    }
    async invalidateCacheForUsersWithRole(roleId) {
        const userRoles = await this.prisma.userRole.findMany({
            where: { roleId },
            select: { userId: true }
        });
        const userIds = [...new Set(userRoles.map(ur => ur.userId))];
        console.log(`[CACHE-INVALIDATION] Invalidating cache for ${userIds.length} users with role ${roleId}`);
        for (const userId of userIds) {
            await this.cachedPermissionsService.invalidateUser(userId);
            await this.decisionOrchestrator.invalidateUser(userId);
        }
    }
};
exports.RolePermissionsService = RolePermissionsService;
exports.RolePermissionsService = RolePermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => decision_orchestrator_1.DecisionOrchestrator))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        cached_effective_permissions_service_1.CachedEffectivePermissionsService,
        decision_orchestrator_1.DecisionOrchestrator])
], RolePermissionsService);
//# sourceMappingURL=role-permissions.service.js.map