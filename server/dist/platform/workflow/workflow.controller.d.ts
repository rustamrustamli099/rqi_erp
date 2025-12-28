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
