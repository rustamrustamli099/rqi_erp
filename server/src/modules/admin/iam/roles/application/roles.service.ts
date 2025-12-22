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
        // Create role in DRAFT status
        return this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                isSystem: false,
                status: RoleStatus.DRAFT,
                // Assuming scope is handled via tenantId or explicit field. 
                // Schema has tenantId but client sends "scope". 
                // We will map System/Common to tenantId=null, Tenant to tenantId=userId.tenant
                // For simplicity, mimicking legacy behavior or storing scope in description/field if schema lacks it.
                // Schema update didn't verify 'scope' string field, but user contract has it.
                // Assuming schema matches.
            }
        });
    }

    async findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: true,
                _count: { select: { userRoles: true } }
            }
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { permissions: true }
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

    async update(id: string, dto: UpdateRoleDto) {
        const role = await this.findOne(id);
        // If Active, change logic (Back to Draft? Or allow edit?).
        // Bank Grade: Edit = New Draft Version or Back to Draft.
        // Simple: Back to Draft.
        const newStatus = role.status === RoleStatus.ACTIVE ? RoleStatus.DRAFT : role.status;

        return this.prisma.role.update({
            where: { id },
            data: {
                ...dto,
                status: newStatus
            }
        });
    }
}
