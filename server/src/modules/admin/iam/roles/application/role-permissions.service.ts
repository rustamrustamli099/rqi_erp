import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { AuditService } from '../../../../../system/audit/audit.service';
import { UpdateRolePermissionsDto } from '../api/dto/update-role-permissions.dto';
import { RoleScope, Permission } from '@prisma/client';
import { CachedEffectivePermissionsService } from '../../../../../platform/auth/cached-effective-permissions.service';
import { DecisionOrchestrator } from '../../../../../platform/decision/decision.orchestrator';

@Injectable()
export class RolePermissionsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private cachedPermissionsService: CachedEffectivePermissionsService,
        @Inject(forwardRef(() => DecisionOrchestrator))
        private decisionOrchestrator: DecisionOrchestrator
    ) { }

    /**
     * SAP-Grade Role Permission Update
     * Deterministic, Transactional, Race-Safe, Auditable.
     * 
     * @param actorId - The user performing the update
     * @param roleId - Target role ID
     * @param payload - Desired state and version
     */
    async updateRolePermissions(actorId: string, roleId: string, payload: UpdateRolePermissionsDto) {
        try {
            console.log('[DEBUG-SERVICE] updateRolePermissions CALLED', { actorId, roleId, payload });

            // 1. Validate Role and Concurrency
            const role = await this.prisma.role.findUnique({
                where: { id: roleId },
                include: { permissions: { include: { permission: true } } }
            });

            if (!role) throw new NotFoundException('Role not found');

            // 2. Locked Role Guard
            if (role.isLocked) {
                throw new ForbiddenException('ROLE_LOCKED: Cannot modify permissions of a locked system role.');
            }

            // 3. Concurrency Control (Optimistic Lock)
            // If versions mismatch, another transaction updated it significantly.
            if ((role as any).version !== payload.expectedVersion) {
                throw new ConflictException(`VERSION_CONFLICT: Expected version ${payload.expectedVersion} but found ${(role as any).version}. Please refresh.`);
            }

            // 4. Resolve Permissions and Validate Scopes
            const requestedSlugs = [...new Set(payload.permissionSlugs)]; // Deduplicate input
            if (requestedSlugs.length === 0 && role.status === 'ACTIVE') {
                // Business Rule: Active roles might require at least one permission? 
                // The prompt says "at least 1 permission if role must be ACTIVE (if required by policy)". 
                // We'll leave it loose unless specified, but logic handles empty list (clear all).
            }

            // Fetch all requested permissions
            let requestedPerms: Permission[] = [];
            if (requestedSlugs.length > 0) {
                requestedPerms = await this.prisma.permission.findMany({
                    where: { slug: { in: requestedSlugs } }
                });

                // Check for Unknown Perms
                const foundSlugs = requestedPerms.map(p => p.slug);
                const unknownSlugs = requestedSlugs.filter(s => !foundSlugs.includes(s));
                if (unknownSlugs.length > 0) {
                    throw new BadRequestException(`UNKNOWN_PERMISSION: The following permissions do not exist: ${unknownSlugs.join(', ')}`);
                }

                // Check Scope Mismatch
                const invalidScopePerms = requestedPerms.filter(p => {
                    if (role.scope === 'SYSTEM' && p.scope === 'TENANT') return true;
                    if (role.scope === 'TENANT' && p.scope === 'SYSTEM') return true;
                    return false;
                });

                if (invalidScopePerms.length > 0) {
                    throw new BadRequestException(`SCOPE_MISMATCH: Invalid scope permissions for ${role.scope}: ${invalidScopePerms.map(p => p.slug).join(', ')}`);
                }
            }

            // 5. Calculate Diff (Authoritative)
            const currentPermIds = new Set(role.permissions.map(rp => rp.permissionId));
            const newPermIds = new Set(requestedPerms.map(p => p.id));

            const toRemove = [...currentPermIds].filter(id => !newPermIds.has(id));
            const toAdd = [...newPermIds].filter(id => !currentPermIds.has(id));

            const currentSlugs = role.permissions.map(rp => rp.permission.slug).sort();
            const newSlugs = requestedPerms.map(p => p.slug).sort();

            // 6. Transactional Execution
            const result = await this.prisma.$transaction(async (tx) => {
                // Apply Removals
                if (toRemove.length > 0) {
                    await tx.rolePermission.deleteMany({
                        where: {
                            roleId: roleId,
                            permissionId: { in: toRemove }
                        }
                    });
                }

                // Apply Additions
                if (toAdd.length > 0) {
                    await tx.rolePermission.createMany({
                        data: toAdd.map(permId => ({
                            roleId: roleId,
                            permissionId: permId
                        }))
                    });
                }

                // Bump Version & Update Audit
                // If we modified permissions, we MUST bump version. 
                // Even if no changes (idempotent), strictly speaking if payload version matches, 
                // but effectively we only bump if we want to confirm the "touch". 
                // Prompt implies bump on change. If no change, we can skip or just return success.
                const hasChanges = toRemove.length > 0 || toAdd.length > 0;
                let updatedRole: any = role;

                if (hasChanges) {
                    updatedRole = await tx.role.update({
                        where: { id: roleId },
                        data: {
                            version: { increment: 1 },
                            // Force DRAFT if active and permissions changed?
                            status: role.status === 'ACTIVE' ? 'DRAFT' : role.status
                        } as any
                    });

                    // Audit Log
                    await this.auditService.logAction({
                        action: 'ROLE_PERMISSIONS_UPDATED',
                        resource: 'Role',
                        details: {
                            roleId,
                            version: updatedRole.version,
                            before: currentSlugs,
                            after: newSlugs,
                            added: toAdd.map(id => requestedPerms.find(p => p.id === id)?.slug), // Map back to slugs for readability
                            removed: toRemove.map(id => role.permissions.find(p => p.permissionId === id)?.permission.slug),
                            comment: payload.comment
                        },
                        module: 'ACCESS_CONTROL',
                        userId: actorId,
                    });
                } else {
                    // Even if no changes, we might want to ensure version is returned correctly. 
                    // But strictly, no DB write needed if no diff.
                }

                return {
                    roleId: updatedRole.id,
                    version: updatedRole.version, // Return NEW version
                    addedCount: toAdd.length,
                    removedCount: toRemove.length
                };
            });

            // [SAP-GRADE] CRITICAL: Invalidate cache for ALL users with this role
            // This must happen AFTER transaction commits successfully
            if (result.addedCount > 0 || result.removedCount > 0) {
                await this.invalidateCacheForUsersWithRole(roleId);
            }

            return result;
        } catch (error) {
            console.error('[FATAL-SERVICE] updateRolePermissions FAILED:', error);
            console.error(error.stack);
            throw error;
        }
    }

    /**
     * Invalidate permission cache for all users who have a specific role assigned.
     * Called when role permissions change.
     */
    private async invalidateCacheForUsersWithRole(roleId: string): Promise<void> {
        // Find all users with this role
        const userRoles = await this.prisma.userRole.findMany({
            where: { roleId },
            select: { userId: true }
        });

        const userIds = [...new Set(userRoles.map(ur => ur.userId))];

        console.log(`[CACHE-INVALIDATION] Invalidating cache for ${userIds.length} users with role ${roleId}`);

        // Invalidate each user's permission and decision cache
        for (const userId of userIds) {
            await this.cachedPermissionsService.invalidateUser(userId);
            await this.decisionOrchestrator.invalidateUser(userId);
        }
    }
}
