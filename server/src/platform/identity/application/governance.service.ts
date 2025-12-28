/**
 * Governance Service
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Central service for SoD validation, risk scoring, and approval workflow.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { validateSoD, SoDValidationResult } from '../domain/sod-rules';
import { calculateRiskScore, RiskScore, requiresApproval } from '../domain/risk-scoring';

export interface GovernanceValidationResult {
    sodResult: SoDValidationResult;
    riskScore: RiskScore;
    requiresApproval: boolean;
    canProceed: boolean;
    blockedReason?: string;
}

export interface ApprovalRequestDto {
    entityType: 'ROLE' | 'USER' | 'EXPORT' | 'BILLING';
    entityId: string;
    entityName: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
    requestedById: string;
    requestedByName: string;
    changes?: {
        before: Record<string, any>;
        after: Record<string, any>;
    };
    riskScore?: number;
    riskLevel?: string;
    sodConflicts?: number;
}

@Injectable()
export class GovernanceService {
    private readonly logger = new Logger(GovernanceService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Validate permissions for SoD conflicts and risk scoring
     */
    async validatePermissions(permissionSlugs: string[]): Promise<GovernanceValidationResult> {
        // SoD Validation
        const sodResult = validateSoD(permissionSlugs);

        // Risk Scoring
        const hasSodConflicts = sodResult.conflicts.length > 0;
        const riskScore = calculateRiskScore(permissionSlugs, hasSodConflicts);

        // Determine if approval is required
        const needsApproval = requiresApproval(riskScore);

        // Can proceed only if no CRITICAL SoD conflicts
        const canProceed = sodResult.criticalCount === 0;

        let blockedReason: string | undefined;
        if (!canProceed) {
            blockedReason = `${sodResult.criticalCount} critical SoD conflict(s) detected. These must be resolved before saving.`;
        }

        return {
            sodResult,
            riskScore,
            requiresApproval: needsApproval,
            canProceed,
            blockedReason
        };
    }

    /**
     * Create an approval request for high-risk changes
     */
    async createApprovalRequest(dto: ApprovalRequestDto): Promise<any> {
        this.logger.log(`Creating approval request for ${dto.entityType}:${dto.entityId}`);

        // For roles, use RoleChangeRequest model
        if (dto.entityType === 'ROLE' && (dto.action === 'CREATE' || dto.action === 'UPDATE')) {
            const request = await this.prisma.roleChangeRequest.create({
                data: {
                    roleId: dto.entityId,
                    requestedBy: dto.requestedById,
                    status: 'PENDING',
                    diffJson: dto.changes || {},
                    reason: `Risk score: ${dto.riskScore || 'N/A'}`
                }
            });

            // Update role status to PENDING_APPROVAL
            await this.prisma.role.update({
                where: { id: dto.entityId },
                data: { status: 'PENDING_APPROVAL' }
            });

            // Log audit
            await this.logAudit({
                action: 'APPROVAL_REQUESTED',
                resource: 'ROLE',
                resourceId: dto.entityId,
                userId: dto.requestedById,
                details: {
                    requestId: request.id,
                    action: dto.action,
                    riskScore: dto.riskScore,
                    riskLevel: dto.riskLevel
                }
            });

            return request;
        }

        // For other entity types, could extend here
        throw new BadRequestException(`Approval for ${dto.entityType} not yet implemented`);
    }

    /**
     * Approve a pending request
     */
    async approveRequest(requestId: string, approverId: string, comment?: string): Promise<any> {
        const request = await this.prisma.roleChangeRequest.findUnique({
            where: { id: requestId },
            include: { role: true }
        });

        if (!request) {
            throw new BadRequestException('Approval request not found');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException('Request is not pending');
        }

        // 4-Eyes principle: Approver cannot be the requester
        if (request.requestedBy === approverId) {
            throw new BadRequestException('You cannot approve your own request (4-eyes principle)');
        }

        // Update request
        await this.prisma.roleChangeRequest.update({
            where: { id: requestId },
            data: {
                status: 'APPROVED',
                approvedBy: approverId,
                reason: comment
            }
        });

        // Activate role
        await this.prisma.role.update({
            where: { id: request.roleId },
            data: {
                status: 'ACTIVE',
                approverId: approverId,
                approvalNote: comment
            }
        });

        // Log audit
        await this.logAudit({
            action: 'APPROVED',
            resource: 'ROLE',
            resourceId: request.roleId,
            userId: approverId,
            details: {
                requestId,
                comment
            }
        });

        return { success: true };
    }

    /**
     * Reject a pending request
     */
    async rejectRequest(requestId: string, rejecterId: string, reason: string): Promise<any> {
        if (!reason || reason.trim().length === 0) {
            throw new BadRequestException('Rejection reason is required');
        }

        const request = await this.prisma.roleChangeRequest.findUnique({
            where: { id: requestId },
            include: { role: true }
        });

        if (!request) {
            throw new BadRequestException('Approval request not found');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException('Request is not pending');
        }

        // Update request
        await this.prisma.roleChangeRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                approvedBy: rejecterId,
                reason
            }
        });

        // Update role status
        await this.prisma.role.update({
            where: { id: request.roleId },
            data: {
                status: 'REJECTED',
                approvalNote: reason
            }
        });

        // Log audit
        await this.logAudit({
            action: 'REJECTED',
            resource: 'ROLE',
            resourceId: request.roleId,
            userId: rejecterId,
            details: {
                requestId,
                reason
            }
        });

        return { success: true };
    }

    /**
     * Get pending approvals for a user (based on permissions)
     */
    async getPendingApprovals(userId: string): Promise<any[]> {
        // Get all pending role change requests
        const requests = await this.prisma.roleChangeRequest.findMany({
            where: {
                status: 'PENDING',
                requestedBy: { not: userId } // Cannot approve own requests
            },
            include: {
                role: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return requests.map(r => ({
            id: r.id,
            entityType: 'ROLE',
            entityId: r.roleId,
            entityName: r.role.name,
            action: 'UPDATE',
            status: r.status,
            requestedBy: r.requestedBy,
            requestedAt: r.createdAt,
            changes: r.diffJson
        }));
    }

    /**
     * Log audit entry
     */
    private async logAudit(data: {
        action: string;
        resource: string;
        resourceId?: string;
        userId: string;
        details?: Record<string, any>;
    }): Promise<void> {
        await this.prisma.auditLog.create({
            data: {
                action: data.action,
                resource: data.resource,
                module: 'GOVERNANCE',
                userId: data.userId,
                details: {
                    resourceId: data.resourceId,
                    ...data.details
                }
            }
        });
    }
}
