import { PrismaService } from '../../prisma.service';
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
export declare class WorkflowService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createApprovalRequest(dto: CreateApprovalRequestDto): Promise<{
        id: string;
        workflowId: string | null;
        entityType: string;
        entityId: string;
        action: string;
        requestedById: string;
        requestedByName: string | null;
        status: string;
        currentStage: number;
        payload: import(".prisma/client").Prisma.JsonValue;
        riskScore: string | null;
        resolvedById: string | null;
        resolvedByName: string | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    processApprovalAction(dto: ApprovalActionDto): Promise<({
        stageExecutions: {
            id: string;
            requestId: string;
            stageId: string;
            stageOrder: number;
            status: string;
            approvedCount: number;
            rejectedCount: number;
            actorId: string | null;
            actorName: string | null;
            actorComment: string | null;
            actedAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        workflowId: string | null;
        entityType: string;
        entityId: string;
        action: string;
        requestedById: string;
        requestedByName: string | null;
        status: string;
        currentStage: number;
        payload: import(".prisma/client").Prisma.JsonValue;
        riskScore: string | null;
        resolvedById: string | null;
        resolvedByName: string | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    private handleApproval;
    private handleRejection;
    private applyApprovedChanges;
    private applyRoleChanges;
    private applyUserChanges;
    private notifyApprovers;
    private notifyRequester;
    getPendingApprovalsForUser(userId: string, userRoleIds: string[]): Promise<({
        stageExecutions: {
            id: string;
            requestId: string;
            stageId: string;
            stageOrder: number;
            status: string;
            approvedCount: number;
            rejectedCount: number;
            actorId: string | null;
            actorName: string | null;
            actorComment: string | null;
            actedAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        workflowId: string | null;
        entityType: string;
        entityId: string;
        action: string;
        requestedById: string;
        requestedByName: string | null;
        status: string;
        currentStage: number;
        payload: import(".prisma/client").Prisma.JsonValue;
        riskScore: string | null;
        resolvedById: string | null;
        resolvedByName: string | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    upsertWorkflowDefinition(config: WorkflowConfig & {
        scope?: string;
    }): Promise<{
        stages: {
            id: string;
            workflowId: string;
            name: string;
            order: number;
            approvalType: string;
            requiredCount: number;
            approverRoleIds: string[];
            approverUserIds: string[];
            timeoutHours: number | null;
            escalateToStage: number | null;
            requireMfa: boolean;
            requireComment: boolean;
            createdAt: Date;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        entityType: string;
        action: string;
        scope: string;
        isActive: boolean;
        priority: number;
        riskThreshold: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delegateApproval(dto: {
        requestId: string;
        actorId: string;
        actorName: string;
        targetUserId: string;
        comment?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    escalateApproval(dto: {
        requestId: string;
        actorId: string;
        actorName: string;
        comment?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    cancelApprovalRequest(dto: {
        requestId: string;
        requesterId: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getApprovalHistory(userId: string): Promise<({
        stageExecutions: {
            id: string;
            requestId: string;
            stageId: string;
            stageOrder: number;
            status: string;
            approvedCount: number;
            rejectedCount: number;
            actorId: string | null;
            actorName: string | null;
            actorComment: string | null;
            actedAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        workflowId: string | null;
        entityType: string;
        entityId: string;
        action: string;
        requestedById: string;
        requestedByName: string | null;
        status: string;
        currentStage: number;
        payload: import(".prisma/client").Prisma.JsonValue;
        riskScore: string | null;
        resolvedById: string | null;
        resolvedByName: string | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getApprovalRequestDetails(requestId: string): Promise<{
        decisions: {
            id: string;
            approvalRequestId: string;
            stageIndex: number;
            decidedByUserId: string;
            decidedByName: string | null;
            decision: string;
            comment: string | null;
            delegatedToUserId: string | null;
            escalatedToStage: number | null;
            createdAt: Date;
        }[];
        auditTrail: {
            id: string;
            action: string;
            resource: string | null;
            module: string | null;
            userId: string | null;
            branchId: string | null;
            tenantId: string | null;
            details: import(".prisma/client").Prisma.JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
        }[];
        workflow: ({
            stages: {
                id: string;
                workflowId: string;
                name: string;
                order: number;
                approvalType: string;
                requiredCount: number;
                approverRoleIds: string[];
                approverUserIds: string[];
                timeoutHours: number | null;
                escalateToStage: number | null;
                requireMfa: boolean;
                requireComment: boolean;
                createdAt: Date;
            }[];
        } & {
            id: string;
            name: string;
            description: string | null;
            entityType: string;
            action: string;
            scope: string;
            isActive: boolean;
            priority: number;
            riskThreshold: string | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
        stageExecutions: {
            id: string;
            requestId: string;
            stageId: string;
            stageOrder: number;
            status: string;
            approvedCount: number;
            rejectedCount: number;
            actorId: string | null;
            actorName: string | null;
            actorComment: string | null;
            actedAt: Date | null;
            createdAt: Date;
        }[];
        id: string;
        workflowId: string | null;
        entityType: string;
        entityId: string;
        action: string;
        requestedById: string;
        requestedByName: string | null;
        status: string;
        currentStage: number;
        payload: import(".prisma/client").Prisma.JsonValue;
        riskScore: string | null;
        resolvedById: string | null;
        resolvedByName: string | null;
        resolvedAt: Date | null;
        resolutionNote: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
