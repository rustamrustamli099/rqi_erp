import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { RoleStatus } from '@prisma/client';
import { CreateRoleDto } from '../api/dto/create-role.dto';
import { UpdateRoleDto } from '../api/dto/update-role.dto';
import { AuditService } from '../../../../../system/audit/audit.service';

@Injectable()
export class RolesService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    async create(dto: CreateRoleDto, userId: string) {
        // SAP Rule: Unique name per scope
        const existing = await this.prisma.role.findFirst({
            where: {
                name: { equals: dto.name, mode: 'insensitive' },
                scope: dto.scope as any // Cast to RoleScope enum
            }
        });

        if (existing) {
            throw new BadRequestException(`Role with name '${dto.name}' already exists in ${dto.scope} scope.`);
        }

        // Create role in DRAFT status
        return this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                scope: dto.scope as any,
                level: 10, // Default level, can be updated by admin later
                isLocked: false,
                isEnabled: true,
                isSystem: dto.scope === 'SYSTEM', // Legacy sync
                status: RoleStatus.DRAFT,
                // Audit info
                submittedById: userId
            }
        });
    }

    async findAll(scope?: 'SYSTEM' | 'TENANT') {
        const where: any = {};
        if (scope) {
            where.scope = scope;
        }

        return this.prisma.role.findMany({
            where,
            include: {
                // Permissions array is HUGE (hundreds of items). We remove it from list view for performance.
                // It will be fetched via findOne lazily.
                // permissions: true, 
                _count: { select: { userRoles: true, permissions: true } }
            },
            orderBy: {
                level: 'desc' // Hierarchy order
            }
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: { permission: true }
                }
            }
        });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }

    async submitForApproval(id: string, userId: string) {
        const role = await this.findOne(id);
        if (role.status !== RoleStatus.DRAFT && role.status !== RoleStatus.REJECTED) {
            throw new BadRequestException('Only Draft or Rejected roles can be submitted');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: RoleStatus.PENDING_APPROVAL,
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

    async approve(id: string, approverId: string) {
        const role = await this.findOne(id);
        if (role.status !== RoleStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Role is not pending approval');
        }

        // 4-EYES PRINCIPLE: Requestor cannot approve their own request
        if (role.submittedById === approverId) {
            throw new ForbiddenException('You cannot approve your own role request (4-Eyes Principle violation)');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: RoleStatus.ACTIVE,
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

    async reject(id: string, reason: string) {
        const role = await this.findOne(id);
        // Can reject pending or even active? Usually pending.
        if (role.status !== RoleStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Role is not pending approval');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: RoleStatus.REJECTED,
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

    async update(id: string, dto: UpdateRoleDto, userId: string = 'SYSTEM') {
        const role = await this.findOne(id);

        // Locked Role Check (SAP Standard)
        if (role.isLocked) {
            throw new ForbiddenException('Cannot edit a locked System Role (e.g. SuperAdmin).');
        }

        const data: any = { ...dto };
        delete data.permissionIds; // Handle permissions separately

        // 1. Validate Scope Change Attempt (Immutable Scope)
        if (dto.scope && dto.scope !== role.scope) {
            throw new BadRequestException('Role Scope cannot be changed once created (SAP Immutable Rule).');
        }

        // 2. Handle Permissions
        if (dto.permissionIds) {
            // Fetch permissions by SLUGS
            const permissions = await this.prisma.permission.findMany({
                where: {
                    slug: { in: dto.permissionIds }
                }
            });

            // 3. STRICT SCOPE ENFORCEMENT
            const invalidPermissions = permissions.filter(p => {
                // Common permissions are safe for everyone (if we had them, defaulting to logic below)
                // Logic: 
                // SYSTEM Role -> Allows SYSTEM
                // TENANT Role -> Allows TENANT
                // Mismatch -> Error via Scope Leakage

                // If permission scope is explicitly opposite of role scope
                if (role.scope === 'SYSTEM' && p.scope === 'TENANT') return true;
                if (role.scope === 'TENANT' && p.scope === 'SYSTEM') return true;
                return false;
            });

            if (invalidPermissions.length > 0) {
                throw new BadRequestException(`Security Violation: Attempted to assign invalid scope permissions to ${role.scope} role: ${invalidPermissions.map(p => p.slug).join(', ')}`);
            }

            // Transactional Permission Update
            await this.prisma.$transaction(async (tx) => {
                // Wipe existing
                await tx.rolePermission.deleteMany({ where: { roleId: id } });

                // Insert new
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
                userId: userId, // Use actual user ID
            });
        }

        // If Active, change logic to Draft if critical fields changed?
        // Permission change -> Should trigger re-approval? 
        // For now, let's keep status logic simple or just set to DRAFT if permissions changed.
        let newStatus = role.status;
        if (role.status === RoleStatus.ACTIVE && dto.permissionIds) {
            newStatus = RoleStatus.DRAFT; // Force re-approval on permission change
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
}
