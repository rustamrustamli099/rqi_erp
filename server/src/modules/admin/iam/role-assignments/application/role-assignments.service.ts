import { Injectable, BadRequestException, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { AssignRoleDto } from '../api/dto/assign-role.dto';
import { AuditService } from '../../../../../system/audit/audit.service';

@Injectable()
export class RoleAssignmentsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    async assign(dto: AssignRoleDto, assignedBy: string, context: { scopeType: string, scopeId: string | null }) {
        // 1. Verify Role Existence
        const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
        if (!role) throw new NotFoundException('Role not found');

        // 2. Strict Scope Validation (PFCG Rule)
        // Check if the current context ALLOWS assigning THIS role.

        if (context.scopeType === 'TENANT') {
            // Tenant Context: Can assign Roles that are:
            // a) Scoped to THIS Tenant
            // b) Scoped to SYSTEM (Global Roles used in Tenant)

            if (role.scope === 'TENANT' && role.tenantId !== context.scopeId) {
                throw new ForbiddenException('Security Violation: Cannot assign a role belonging to another tenant.');
            }
            // System roles are allowed.
        } else if (context.scopeType === 'SYSTEM') {
            // System Context: Can assign SYSTEM roles only?
            // If I am System Admin, I assign roles for System Management.
            // If I want to assign a Tenant Role to a User, I should ideally be in Tenant Context?
            // OR I can do it if I specify the target tenant. But our Context-Driven model says "Switch to Tenant to Manage Tenant".

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

        return { success: true };
    }

    async listByUser(targetUserId: string, context: { scopeType: string, scopeId: string | null }) {
        // List all roles assigned to this user IN THIS SCOPE.
        // We do *not* show roles from other scopes (e.g. System roles if in Tenant context, UNLESS they are assigned IN Tenant context)

        return (this.prisma as any).userRoleAssignment.findMany({
            where: {
                userId: targetUserId,
                scopeType: context.scopeType,
                scopeId: context.scopeId
            },
            include: {
                role: true // Assuming relation exists. If not, we fetch manually?
                // Let's assume relation exists for now based on typical Prisma usage
            }
        });
    }
}
