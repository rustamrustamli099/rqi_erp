import { RolesService } from '../roles/application/roles.service';
export interface ApprovalItem {
    id: string;
    type: 'ROLE' | 'BILLING' | 'CONTRACT';
    title: string;
    description?: string;
    status: string;
    createdAt: Date;
    createdBy: {
        id: string;
        email: string;
        fullName?: string;
    };
    metadata?: any;
}
export declare class ApprovalsService {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    getPendingApprovals(userId: string, permissions: string[]): Promise<ApprovalItem[]>;
    approve(id: string, type: 'ROLE', approverId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        scope: import("@prisma/client").$Enums.RoleScope;
        level: number;
        isLocked: boolean;
        isEnabled: boolean;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        createdById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        version: number;
    }>;
    reject(id: string, type: 'ROLE', reason: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        scope: import("@prisma/client").$Enums.RoleScope;
        level: number;
        isLocked: boolean;
        isEnabled: boolean;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
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
