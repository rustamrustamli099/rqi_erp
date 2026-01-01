import { Injectable, BadRequestException, ForbiddenException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { AssignRoleDto } from '../api/dto/assign-role.dto';
import { AuditService } from '../../../../../system/audit/audit.service';
import { CacheInvalidationService } from '../../../../../platform/cache/cache-invalidation.service';

/**
 * ROLE ASSIGNMENTS SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PHASE 10.4: Cache invalidation hooks added.
 * 
 * On assign/revoke: invalidateUser(userId) is called to clear ALL caches.
 * ═══════════════════════════════════════════════════════════════════════════
 */

@Injectable()
export class RoleAssignmentsService {
    private readonly logger = new Logger(RoleAssignmentsService.name);

    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private cacheInvalidation: CacheInvalidationService
    ) { }

    async assign(dto: AssignRoleDto, assignedBy: string, context: { scopeType: string, scopeId: string | null }) {
        // 1. Verify Role Existence
        const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
        if (!role) throw new NotFoundException('Role not found');

        // 2. Strict Scope Validation (PFCG Rule)
        if (context.scopeType === 'TENANT') {
            if (role.scope === 'TENANT' && role.tenantId !== context.scopeId) {
                throw new ForbiddenException('Security Violation: Cannot assign a role belonging to another tenant.');
            }
        } else if (context.scopeType === 'SYSTEM') {
            if (role.scope === 'TENANT') {
                throw new BadRequestException('Context Mismatch: Switch to the specific Tenant context to assign Tenant Roles.');
            }
        }

        // 3. Check for Existing Assignment
        const existing = await (this.prisma as any).userRoleAssignment.findFirst({
            where: {
                userId: dto.userId,
                roleId: dto.roleId,
                scopeType: context.scopeType,
                scopeId: context.scopeId
            }
        });

        if (existing) {
            throw new ConflictException('User already has this role in the current scope.');
        }

        // 4. Create Assignment
        const result = await (this.prisma as any).userRoleAssignment.create({
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

        // 5. Audit
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

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 10.4: CACHE INVALIDATION (SYNCHRONOUS, BEFORE RESPONSE)
        // ═══════════════════════════════════════════════════════════════════
        await this.cacheInvalidation.invalidateUser(dto.userId);
        this.logger.log(`Cache invalidated for user ${dto.userId} after role assignment`);

        return result;
    }

    async revoke(userId: string, roleId: string, revokedBy: string, context: { scopeType: string, scopeId: string | null }) {
        // 1. Find Assignment
        const assignment = await (this.prisma as any).userRoleAssignment.findFirst({
            where: {
                userId: userId,
                roleId: roleId,
                scopeType: context.scopeType,
                scopeId: context.scopeId
            }
        });

        if (!assignment) {
            throw new NotFoundException('Assignment not found in current scope.');
        }

        // 2. Remove
        await (this.prisma as any).userRoleAssignment.delete({
            where: { id: assignment.id }
        });

        // 3. Audit
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

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 10.4: CACHE INVALIDATION (SYNCHRONOUS, BEFORE RESPONSE)
        // ═══════════════════════════════════════════════════════════════════
        await this.cacheInvalidation.invalidateUser(userId);
        this.logger.log(`Cache invalidated for user ${userId} after role revocation`);

        return { success: true };
    }

    async listByUser(targetUserId: string, context: { scopeType: string, scopeId: string | null }) {
        return (this.prisma as any).userRoleAssignment.findMany({
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
}
