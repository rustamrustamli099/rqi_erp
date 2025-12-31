import { GovernanceService } from '../application/governance.service';
declare class ValidatePermissionsDto {
    permissions: string[];
}
declare class CreateApprovalRequestDto {
    entityType: 'ROLE' | 'USER' | 'EXPORT' | 'BILLING';
    entityId: string;
    entityName: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
    changes?: {
        before: Record<string, any>;
        after: Record<string, any>;
    };
    riskScore?: number;
    riskLevel?: string;
    sodConflicts?: number;
}
declare class ApproveRequestDto {
    comment?: string;
}
declare class RejectRequestDto {
    reason: string;
}
export declare class GovernanceController {
    private readonly governanceService;
    constructor(governanceService: GovernanceService);
    validatePermissions(dto: ValidatePermissionsDto): Promise<import("../application/governance.service").GovernanceValidationResult>;
    createApprovalRequest(dto: CreateApprovalRequestDto, req: any): Promise<any>;
    getPendingApprovals(req: any): Promise<any[]>;
    approveRequest(id: string, dto: ApproveRequestDto, req: any): Promise<any>;
    rejectRequest(id: string, dto: RejectRequestDto, req: any): Promise<any>;
    getSodRules(): import("../domain/sod-rules").SoDRule[];
}
export {};
