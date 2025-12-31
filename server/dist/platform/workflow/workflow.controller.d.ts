import { WorkflowService, CreateApprovalRequestDto } from './workflow.service';
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    createApprovalRequest(dto: Partial<CreateApprovalRequestDto>, req: any): Promise<{
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
    getPendingApprovals(req: any): Promise<({
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
    approveRequest(id: string, comment: string, req: any): Promise<({
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
    rejectRequest(id: string, comment: string, req: any): Promise<({
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
    delegateRequest(id: string, body: {
        targetUserId: string;
        comment?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    escalateRequest(id: string, comment: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    cancelRequest(id: string, reason: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getApprovalHistory(req: any): Promise<({
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
    getApprovalRequest(id: string): Promise<{
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
    upsertWorkflowDefinition(config: any): Promise<{
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
}
