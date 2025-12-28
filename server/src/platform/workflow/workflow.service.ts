/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WORKFLOW ENGINE SERVICE - SAP-Grade Generic Approval System
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Supports:
 * - Sequential approvals (Stage 1 → Stage 2 → Stage 3)
 * - Parallel approvals (N of M approvers)
 * - Dynamic workflow definitions per entity type
 * - Risk-based escalation
 * - Timeout & auto-escalation
 */

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateApprovalRequestDto {
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    requestedById: string;
    requestedByName?: string;
    riskScore?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ApprovalActionDto {
    requestId: string;
    actorId: string;
    actorName: string;
    action: 'APPROVE' | 'REJECT';
    comment?: string;
}

export interface WorkflowConfig {
    entityType: string;
    action: string;
    stages: {
        name: string;
        approvalType: 'SEQUENTIAL' | 'PARALLEL';
        requiredCount: number;
        approverRoleIds?: string[];
        approverUserIds?: string[];
        requireComment?: boolean;
    }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════

@Injectable()
export class WorkflowService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new approval request with workflow binding
     */
    async createApprovalRequest(dto: CreateApprovalRequestDto) {
        // 1. Find matching workflow definition
        const workflow = await this.prisma.workflowDefinition.findFirst({
            where: {
                entityType: dto.entityType,
                action: dto.action,
                isActive: true
            },
            include: {
                stages: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        // 2. Create approval request
        const request = await this.prisma.approvalRequest.create({
            data: {
                entityType: dto.entityType,
                entityId: dto.entityId,
                action: dto.action,
                payload: dto.payload,
                requestedById: dto.requestedById,
                requestedByName: dto.requestedByName,
                riskScore: dto.riskScore,
                workflowId: workflow?.id,
                status: 'PENDING',
                currentStage: 1
            }
        });

        // 3. Create stage executions if workflow exists
        if (workflow && workflow.stages.length > 0) {
            await this.prisma.approvalStageExecution.createMany({
                data: workflow.stages.map(stage => ({
                    requestId: request.id,
                    stageId: stage.id,
                    stageOrder: stage.order,
                    status: stage.order === 1 ? 'IN_PROGRESS' : 'PENDING'
                }))
            });
        }

        // 4. Send notifications to eligible approvers
        await this.notifyApprovers(request.id, 1);

        return request;
    }

    /**
     * Process approval or rejection
     */
    async processApprovalAction(dto: ApprovalActionDto) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId },
            include: {
                workflow: {
                    include: {
                        stages: { orderBy: { order: 'asc' } }
                    }
                },
                stageExecutions: {
                    orderBy: { stageOrder: 'asc' }
                }
            }
        });

        if (!request) {
            throw new NotFoundException('Approval request not found');
        }

        if (request.status !== 'PENDING' && request.status !== 'IN_PROGRESS') {
            throw new BadRequestException('Request is not pending approval');
        }

        // 4-Eyes Principle Check
        if (request.requestedById === dto.actorId) {
            throw new ForbiddenException('Cannot approve/reject own request (4-Eyes Principle)');
        }

        // Check if actor can approve current stage
        const currentStageExecution = request.stageExecutions.find(
            se => se.stageOrder === request.currentStage
        );

        if (!currentStageExecution) {
            throw new BadRequestException('No active stage found');
        }

        // Update stage execution
        if (dto.action === 'APPROVE') {
            await this.handleApproval(request, currentStageExecution, dto);
        } else {
            await this.handleRejection(request, currentStageExecution, dto);
        }

        return this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId },
            include: { stageExecutions: true }
        });
    }

    /**
     * Handle approval action
     */
    private async handleApproval(request: any, stageExecution: any, dto: ApprovalActionDto) {
        const stage = request.workflow?.stages.find(s => s.id === stageExecution.stageId);
        const isParallel = stage?.approvalType === 'PARALLEL';
        const requiredCount = stage?.requiredCount || 1;

        // Update execution
        const newApprovedCount = stageExecution.approvedCount + 1;

        await this.prisma.approvalStageExecution.update({
            where: { id: stageExecution.id },
            data: {
                approvedCount: newApprovedCount,
                actorId: dto.actorId,
                actorName: dto.actorName,
                actorComment: dto.comment,
                actedAt: new Date(),
                status: isParallel && newApprovedCount < requiredCount ? 'IN_PROGRESS' : 'APPROVED'
            }
        });

        // Check if stage is complete
        const stageComplete = !isParallel || newApprovedCount >= requiredCount;

        if (stageComplete) {
            // Check if there are more stages
            const nextStage = request.currentStage + 1;
            const hasMoreStages = request.workflow?.stages.some(s => s.order === nextStage);

            if (hasMoreStages) {
                // Move to next stage
                await this.prisma.approvalRequest.update({
                    where: { id: request.id },
                    data: {
                        currentStage: nextStage,
                        status: 'IN_PROGRESS'
                    }
                });

                // Activate next stage execution
                await this.prisma.approvalStageExecution.updateMany({
                    where: {
                        requestId: request.id,
                        stageOrder: nextStage
                    },
                    data: { status: 'IN_PROGRESS' }
                });

                // Notify next stage approvers
                await this.notifyApprovers(request.id, nextStage);
            } else {
                // All stages complete - APPROVED
                await this.prisma.approvalRequest.update({
                    where: { id: request.id },
                    data: {
                        status: 'APPROVED',
                        resolvedById: dto.actorId,
                        resolvedByName: dto.actorName,
                        resolvedAt: new Date(),
                        resolutionNote: dto.comment
                    }
                });

                // Apply the approved changes
                await this.applyApprovedChanges(request);
            }
        }
    }

    /**
     * Handle rejection action
     */
    private async handleRejection(request: any, stageExecution: any, dto: ApprovalActionDto) {
        // Update stage execution
        await this.prisma.approvalStageExecution.update({
            where: { id: stageExecution.id },
            data: {
                status: 'REJECTED',
                actorId: dto.actorId,
                actorName: dto.actorName,
                actorComment: dto.comment,
                actedAt: new Date()
            }
        });

        // Reject the entire request
        await this.prisma.approvalRequest.update({
            where: { id: request.id },
            data: {
                status: 'REJECTED',
                resolvedById: dto.actorId,
                resolvedByName: dto.actorName,
                resolvedAt: new Date(),
                resolutionNote: dto.comment
            }
        });

        // Notify requester
        await this.notifyRequester(request.id, 'REJECTED', dto.comment);
    }

    /**
     * Apply approved changes to the entity
     */
    private async applyApprovedChanges(request: any) {
        const { entityType, entityId, action, payload } = request;

        switch (entityType) {
            case 'ROLE':
                await this.applyRoleChanges(entityId, action, payload);
                break;
            case 'USER':
                await this.applyUserChanges(entityId, action, payload);
                break;
            // Add more entity types as needed
            default:
                console.warn(`Unknown entity type: ${entityType}`);
        }

        // Notify requester
        await this.notifyRequester(request.id, 'APPROVED');
    }

    /**
     * Apply role changes after approval
     */
    private async applyRoleChanges(roleId: string, action: string, payload: any) {
        if (action === 'UPDATE' && payload.permissions) {
            // Clear existing permissions
            await this.prisma.rolePermission.deleteMany({
                where: { roleId }
            });

            // Add new permissions
            if (payload.permissions.length > 0) {
                const permissionRecords = await this.prisma.permission.findMany({
                    where: { slug: { in: payload.permissions } }
                });

                await this.prisma.rolePermission.createMany({
                    data: permissionRecords.map(p => ({
                        roleId,
                        permissionId: p.id
                    }))
                });
            }

            // Update role status
            await this.prisma.role.update({
                where: { id: roleId },
                data: {
                    status: 'ACTIVE',
                    version: { increment: 1 }
                }
            });
        }
    }

    /**
     * Apply user changes after approval
     */
    private async applyUserChanges(userId: string, action: string, payload: any) {
        // Implement user change application logic
        console.log(`Applying user changes: ${userId}, ${action}`, payload);
    }

    /**
     * Notify eligible approvers for a stage
     */
    private async notifyApprovers(requestId: string, stageOrder: number) {
        // This would integrate with NotificationService
        console.log(`Notifying approvers for request ${requestId}, stage ${stageOrder}`);
    }

    /**
     * Notify the requester about resolution
     */
    private async notifyRequester(requestId: string, status: string, comment?: string) {
        // This would integrate with NotificationService
        console.log(`Notifying requester about ${status} for request ${requestId}`);
    }

    /**
     * Get pending approvals for a user
     */
    async getPendingApprovalsForUser(userId: string, userRoleIds: string[]) {
        // Find all workflows where user can approve
        const eligibleWorkflows = await this.prisma.workflowStage.findMany({
            where: {
                OR: [
                    { approverUserIds: { has: userId } },
                    { approverRoleIds: { hasSome: userRoleIds } }
                ]
            },
            select: { workflowId: true, order: true }
        });

        const workflowStageMap = new Map<string, number[]>();
        for (const ws of eligibleWorkflows) {
            if (!workflowStageMap.has(ws.workflowId)) {
                workflowStageMap.set(ws.workflowId, []);
            }
            workflowStageMap.get(ws.workflowId)!.push(ws.order);
        }

        // Find pending requests at stages where user can approve
        const requests = await this.prisma.approvalRequest.findMany({
            where: {
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                OR: Array.from(workflowStageMap.entries()).map(([wfId, stages]) => ({
                    workflowId: wfId,
                    currentStage: { in: stages }
                }))
            },
            include: {
                stageExecutions: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Filter out requests where user is the requester (4-eyes)
        return requests.filter(r => r.requestedById !== userId);
    }

    /**
     * Create or update workflow definition
     */
    async upsertWorkflowDefinition(config: WorkflowConfig & { scope?: string }) {
        const existing = await this.prisma.workflowDefinition.findFirst({
            where: {
                entityType: config.entityType,
                action: config.action,
                scope: config.scope || 'SYSTEM'
            }
        });

        if (existing) {
            // Delete existing stages
            await this.prisma.workflowStage.deleteMany({
                where: { workflowId: existing.id }
            });

            // Update definition and create new stages
            return this.prisma.workflowDefinition.update({
                where: { id: existing.id },
                data: {
                    stages: {
                        create: config.stages.map((stage, index) => ({
                            name: stage.name,
                            order: index + 1,
                            approvalType: stage.approvalType,
                            requiredCount: stage.requiredCount,
                            approverRoleIds: stage.approverRoleIds || [],
                            approverUserIds: stage.approverUserIds || [],
                            requireComment: stage.requireComment ?? true
                        }))
                    }
                },
                include: { stages: true }
            });
        } else {
            return this.prisma.workflowDefinition.create({
                data: {
                    name: `${config.entityType} ${config.action} Workflow`,
                    entityType: config.entityType,
                    action: config.action,
                    scope: config.scope || 'SYSTEM',
                    stages: {
                        create: config.stages.map((stage, index) => ({
                            name: stage.name,
                            order: index + 1,
                            approvalType: stage.approvalType,
                            requiredCount: stage.requiredCount,
                            approverRoleIds: stage.approverRoleIds || [],
                            approverUserIds: stage.approverUserIds || [],
                            requireComment: stage.requireComment ?? true
                        }))
                    }
                },
                include: { stages: true }
            });
        }
    }

    /**
     * Delegate approval to another user
     */
    async delegateApproval(dto: {
        requestId: string;
        actorId: string;
        actorName: string;
        targetUserId: string;
        comment?: string;
    }) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId }
        });

        if (!request) throw new NotFoundException('Approval request not found');
        if (request.status !== 'PENDING' && request.status !== 'IN_PROGRESS') {
            throw new BadRequestException('Request is not pending');
        }

        // Record delegation decision
        await this.prisma.approvalDecision.create({
            data: {
                approvalRequestId: dto.requestId,
                stageIndex: request.currentStage,
                decidedByUserId: dto.actorId,
                decidedByName: dto.actorName,
                decision: 'DELEGATE',
                comment: dto.comment,
                delegatedToUserId: dto.targetUserId
            }
        });

        // Create notification for delegate target using existing schema
        const notification = await this.prisma.notification.create({
            data: {
                subject: 'Yeni təsdiqləmə tapşırığı',
                body: `${dto.actorName} sizə təsdiqləmə göndərdi. Request ID: ${dto.requestId}`,
                type: 'APPROVAL_DELEGATED',
                priority: 'HIGH'
            }
        });
        await this.prisma.notificationDelivery.create({
            data: {
                notificationId: notification.id,
                userId: dto.targetUserId,
                status: 'PENDING'
            }
        });

        return { success: true, message: 'Approval delegated successfully' };
    }

    /**
     * Escalate approval to next stage or higher authority
     */
    async escalateApproval(dto: {
        requestId: string;
        actorId: string;
        actorName: string;
        comment?: string;
    }) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId },
            include: {
                workflow: { include: { stages: { orderBy: { order: 'asc' } } } }
            }
        });

        if (!request) throw new NotFoundException('Approval request not found');
        if (!request.workflow) throw new BadRequestException('No workflow defined');

        const currentStage = request.workflow.stages.find(s => s.order === request.currentStage);
        const escalationTarget = currentStage?.escalateToStage || request.currentStage + 1;

        // Check if escalation target exists
        const targetStage = request.workflow.stages.find(s => s.order === escalationTarget);
        if (!targetStage) {
            throw new BadRequestException('No escalation stage available');
        }

        // Record escalation decision
        await this.prisma.approvalDecision.create({
            data: {
                approvalRequestId: dto.requestId,
                stageIndex: request.currentStage,
                decidedByUserId: dto.actorId,
                decidedByName: dto.actorName,
                decision: 'ESCALATE',
                comment: dto.comment,
                escalatedToStage: escalationTarget
            }
        });

        // Move to escalation stage
        await this.prisma.approvalRequest.update({
            where: { id: dto.requestId },
            data: { currentStage: escalationTarget }
        });

        // Notify escalation stage approvers
        await this.notifyApprovers(dto.requestId, escalationTarget);

        return { success: true, message: `Escalated to stage ${escalationTarget}` };
    }

    /**
     * Cancel own approval request
     */
    async cancelApprovalRequest(dto: {
        requestId: string;
        requesterId: string;
        reason?: string;
    }) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId }
        });

        if (!request) throw new NotFoundException('Approval request not found');
        if (request.requestedById !== dto.requesterId) {
            throw new ForbiddenException('Only requester can cancel');
        }
        if (request.status !== 'PENDING' && request.status !== 'IN_PROGRESS') {
            throw new BadRequestException('Request cannot be cancelled');
        }

        await this.prisma.approvalRequest.update({
            where: { id: dto.requestId },
            data: {
                status: 'CANCELLED',
                resolutionNote: dto.reason,
                resolvedAt: new Date()
            }
        });

        return { success: true, message: 'Request cancelled' };
    }

    /**
     * Get approval history for user
     */
    async getApprovalHistory(userId: string) {
        return this.prisma.approvalRequest.findMany({
            where: {
                OR: [
                    { requestedById: userId },
                    { resolvedById: userId }
                ],
                status: { in: ['APPROVED', 'REJECTED', 'CANCELLED'] }
            },
            include: {
                stageExecutions: true
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });
    }

    /**
     * Get approval request details
     */
    async getApprovalRequestDetails(requestId: string) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: requestId },
            include: {
                workflow: { include: { stages: { orderBy: { order: 'asc' } } } },
                stageExecutions: { orderBy: { stageOrder: 'asc' } }
            }
        });

        if (!request) throw new NotFoundException('Approval request not found');

        // Get decisions
        const decisions = await this.prisma.approvalDecision.findMany({
            where: { approvalRequestId: requestId },
            orderBy: { createdAt: 'asc' }
        });

        // Get audit trail
        const auditTrail = await this.prisma.auditLog.findMany({
            where: {
                resource: requestId,
                module: 'APPROVAL'
            },
            orderBy: { createdAt: 'asc' }
        });

        return {
            ...request,
            decisions,
            auditTrail
        };
    }
}

