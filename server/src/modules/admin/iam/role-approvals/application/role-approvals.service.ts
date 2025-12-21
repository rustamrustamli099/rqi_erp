import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { AuditService } from '../../../../../system/audit/audit.service';
import { RoleStatus } from '@prisma/client';

@Injectable()
export class RoleApprovalsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    // 1. Submit a Change Request
    async submitRequest(roleId: string, userId: string, diffJson: any = {}) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) throw new NotFoundException('Role not found');

        if (role.status === RoleStatus.ACTIVE) {
            // If we are editing an Active role, we might be creating a draft version or locking it.
            // For now, assuming bank-grade: You can't just put an Active role into Pending? 
            // Usually you create a Draft, then submit the Draft.
            // But existing logic seemed to just update status. 
            // We will follow existing pattern: Update status to PENDING_APPROVAL.
        }

        const request = await this.prisma.roleChangeRequest.create({
            data: {
                roleId: role.id,
                requestedBy: userId,
                status: 'PENDING',
                scope: role.tenantId ? 'TENANT' : 'SYSTEM',
                diffJson: diffJson,
            }
        });

        // Update Role Status
        await this.prisma.role.update({
            where: { id: role.id },
            data: {
                status: RoleStatus.PENDING_APPROVAL,
                submittedById: userId
            }
        });

        await this.auditService.logAction({
            action: 'ROLE_CHANGE_REQUESTED',
            resource: 'Role',
            details: { requestId: request.id, roleId: role.id },
            module: 'IAM',
            userId: userId,
        });

        return request;
    }

    // 2. Approve
    async approveRequest(requestId: string, approverId: string) {
        const request = await this.prisma.roleChangeRequest.findUnique({
            where: { id: requestId },
            include: { role: true }
        });
        if (!request) throw new NotFoundException('Request not found');

        if (request.status !== 'PENDING') {
            throw new BadRequestException('Request is not pending');
        }

        // 4-Eyes Check
        if (request.requestedBy === approverId) {
            throw new ForbiddenException('Approver cannot be the same as Requestor (4-Eyes Violation)');
        }

        // Apply
        const updatedRequest = await this.prisma.roleChangeRequest.update({
            where: { id: requestId },
            data: {
                status: 'APPROVED',
                approvedBy: approverId
            }
        });

        await this.prisma.role.update({
            where: { id: request.roleId },
            data: {
                status: RoleStatus.ACTIVE,
                approverId: approverId
            }
        });

        await this.auditService.logAction({
            action: 'ROLE_CHANGE_APPROVED',
            resource: 'Role',
            details: { requestId: request.id, roleId: request.roleId },
            module: 'IAM',
            userId: approverId,
        });

        return updatedRequest;
    }

    // 3. Reject
    async rejectRequest(requestId: string, reason: string, rejectorId: string) {
        const request = await this.prisma.roleChangeRequest.findUnique({ where: { id: requestId } });
        if (!request) throw new NotFoundException('Request not found');

        const updatedRequest = await this.prisma.roleChangeRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                reason: reason
            }
        });

        await this.prisma.role.update({
            where: { id: request.roleId },
            data: {
                status: RoleStatus.REJECTED,
                approvalNote: reason
            }
        });

        await this.auditService.logAction({
            action: 'ROLE_CHANGE_REJECTED',
            resource: 'Role',
            details: { requestId: request.id, reason },
            module: 'IAM',
            userId: rejectorId,
        });

        return updatedRequest;
    }

    async findAll(status?: string) {
        return this.prisma.roleChangeRequest.findMany({
            where: status ? { status } : {},
            include: { role: true },
            orderBy: { createdAt: 'desc' }
        });
    }
}
