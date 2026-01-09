import { ApprovalsService } from './approvals.service';
import { DecisionCenterService } from '../../../../platform/decision/decision-center.service';
export declare class ApprovalsController {
    private readonly approvalsService;
    private readonly decisionCenterService;
    constructor(approvalsService: ApprovalsService, decisionCenterService: DecisionCenterService);
    getPending(req: any): Promise<{
        items: import("./approvals.service").ApprovalItem[];
        count: number;
    }>;
    approve(id: string, type: 'ROLE', req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        scope: import(".prisma/client").$Enums.RoleScope;
        level: number;
        isLocked: boolean;
        isEnabled: boolean;
        isSystem: boolean;
        status: import(".prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        createdById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        version: number;
    }>;
    reject(id: string, type: 'ROLE', reason: string, req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        scope: import(".prisma/client").$Enums.RoleScope;
        level: number;
        isLocked: boolean;
        isEnabled: boolean;
        isSystem: boolean;
        status: import(".prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        createdById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        version: number;
    }>;
}
