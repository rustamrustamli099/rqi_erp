import { PrismaService } from '../../../prisma.service';
import { SoDValidationResult } from '../domain/sod-rules';
import { RiskScore } from '../domain/risk-scoring';
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
export declare class GovernanceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    validatePermissions(permissionSlugs: string[]): Promise<GovernanceValidationResult>;
    createApprovalRequest(dto: ApprovalRequestDto): Promise<any>;
    approveRequest(requestId: string, approverId: string, comment?: string): Promise<any>;
    rejectRequest(requestId: string, rejecterId: string, reason: string): Promise<any>;
    getPendingApprovals(userId: string): Promise<any[]>;
    private logAudit;
}
