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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let WorkflowService = class WorkflowService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createApprovalRequest(dto) {
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
        await this.notifyApprovers(request.id, 1);
        return request;
    }
    async processApprovalAction(dto) {
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
            throw new common_1.NotFoundException('Approval request not found');
        }
        if (request.status !== 'PENDING' && request.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Request is not pending approval');
        }
        if (request.requestedById === dto.actorId) {
            throw new common_1.ForbiddenException('Cannot approve/reject own request (4-Eyes Principle)');
        }
        const currentStageExecution = request.stageExecutions.find(se => se.stageOrder === request.currentStage);
        if (!currentStageExecution) {
            throw new common_1.BadRequestException('No active stage found');
        }
        if (dto.action === 'APPROVE') {
            await this.handleApproval(request, currentStageExecution, dto);
        }
        else {
            await this.handleRejection(request, currentStageExecution, dto);
        }
        return this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId },
            include: { stageExecutions: true }
        });
    }
    async handleApproval(request, stageExecution, dto) {
        const stage = request.workflow?.stages.find(s => s.id === stageExecution.stageId);
        const isParallel = stage?.approvalType === 'PARALLEL';
        const requiredCount = stage?.requiredCount || 1;
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
        const stageComplete = !isParallel || newApprovedCount >= requiredCount;
        if (stageComplete) {
            const nextStage = request.currentStage + 1;
            const hasMoreStages = request.workflow?.stages.some(s => s.order === nextStage);
            if (hasMoreStages) {
                await this.prisma.approvalRequest.update({
                    where: { id: request.id },
                    data: {
                        currentStage: nextStage,
                        status: 'IN_PROGRESS'
                    }
                });
                await this.prisma.approvalStageExecution.updateMany({
                    where: {
                        requestId: request.id,
                        stageOrder: nextStage
                    },
                    data: { status: 'IN_PROGRESS' }
                });
                await this.notifyApprovers(request.id, nextStage);
            }
            else {
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
                await this.applyApprovedChanges(request);
            }
        }
    }
    async handleRejection(request, stageExecution, dto) {
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
        await this.notifyRequester(request.id, 'REJECTED', dto.comment);
    }
    async applyApprovedChanges(request) {
        const { entityType, entityId, action, payload } = request;
        switch (entityType) {
            case 'ROLE':
                await this.applyRoleChanges(entityId, action, payload);
                break;
            case 'USER':
                await this.applyUserChanges(entityId, action, payload);
                break;
            default:
                console.warn(`Unknown entity type: ${entityType}`);
        }
        await this.notifyRequester(request.id, 'APPROVED');
    }
    async applyRoleChanges(roleId, action, payload) {
        if (action === 'UPDATE' && payload.permissions) {
            await this.prisma.rolePermission.deleteMany({
                where: { roleId }
            });
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
            await this.prisma.role.update({
                where: { id: roleId },
                data: {
                    status: 'ACTIVE',
                    version: { increment: 1 }
                }
            });
        }
    }
    async applyUserChanges(userId, action, payload) {
        console.log(`Applying user changes: ${userId}, ${action}`, payload);
    }
    async notifyApprovers(requestId, stageOrder) {
        console.log(`Notifying approvers for request ${requestId}, stage ${stageOrder}`);
    }
    async notifyRequester(requestId, status, comment) {
        console.log(`Notifying requester about ${status} for request ${requestId}`);
    }
    async getPendingApprovalsForUser(userId, userRoleIds) {
        const eligibleWorkflows = await this.prisma.workflowStage.findMany({
            where: {
                OR: [
                    { approverUserIds: { has: userId } },
                    { approverRoleIds: { hasSome: userRoleIds } }
                ]
            },
            select: { workflowId: true, order: true }
        });
        const workflowStageMap = new Map();
        for (const ws of eligibleWorkflows) {
            if (!workflowStageMap.has(ws.workflowId)) {
                workflowStageMap.set(ws.workflowId, []);
            }
            workflowStageMap.get(ws.workflowId).push(ws.order);
        }
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
        return requests.filter(r => r.requestedById !== userId);
    }
    async upsertWorkflowDefinition(config) {
        const existing = await this.prisma.workflowDefinition.findFirst({
            where: {
                entityType: config.entityType,
                action: config.action,
                scope: config.scope || 'SYSTEM'
            }
        });
        if (existing) {
            await this.prisma.workflowStage.deleteMany({
                where: { workflowId: existing.id }
            });
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
        }
        else {
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
    async delegateApproval(dto) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId }
        });
        if (!request)
            throw new common_1.NotFoundException('Approval request not found');
        if (request.status !== 'PENDING' && request.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Request is not pending');
        }
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
    async escalateApproval(dto) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId },
            include: {
                workflow: { include: { stages: { orderBy: { order: 'asc' } } } }
            }
        });
        if (!request)
            throw new common_1.NotFoundException('Approval request not found');
        if (!request.workflow)
            throw new common_1.BadRequestException('No workflow defined');
        const currentStage = request.workflow.stages.find(s => s.order === request.currentStage);
        const escalationTarget = currentStage?.escalateToStage || request.currentStage + 1;
        const targetStage = request.workflow.stages.find(s => s.order === escalationTarget);
        if (!targetStage) {
            throw new common_1.BadRequestException('No escalation stage available');
        }
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
        await this.prisma.approvalRequest.update({
            where: { id: dto.requestId },
            data: { currentStage: escalationTarget }
        });
        await this.notifyApprovers(dto.requestId, escalationTarget);
        return { success: true, message: `Escalated to stage ${escalationTarget}` };
    }
    async cancelApprovalRequest(dto) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: dto.requestId }
        });
        if (!request)
            throw new common_1.NotFoundException('Approval request not found');
        if (request.requestedById !== dto.requesterId) {
            throw new common_1.ForbiddenException('Only requester can cancel');
        }
        if (request.status !== 'PENDING' && request.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Request cannot be cancelled');
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
    async getApprovalHistory(userId) {
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
    async getApprovalRequestDetails(requestId) {
        const request = await this.prisma.approvalRequest.findUnique({
            where: { id: requestId },
            include: {
                workflow: { include: { stages: { orderBy: { order: 'asc' } } } },
                stageExecutions: { orderBy: { stageOrder: 'asc' } }
            }
        });
        if (!request)
            throw new common_1.NotFoundException('Approval request not found');
        const decisions = await this.prisma.approvalDecision.findMany({
            where: { approvalRequestId: requestId },
            orderBy: { createdAt: 'asc' }
        });
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
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map