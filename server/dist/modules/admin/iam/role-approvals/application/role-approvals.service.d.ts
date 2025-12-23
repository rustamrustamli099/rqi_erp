import { PrismaService } from '../../../../../prisma.service';
import { AuditService } from '../../../../../system/audit/audit.service';
export declare class RoleApprovalsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    submitRequest(roleId: string, userId: string, diffJson?: any): Promise<{
        id: string;
        scope: string;
        roleId: string;
        requestedBy: string;
        approvedBy: string | null;
        status: string;
        diffJson: import("@prisma/client").Prisma.JsonValue;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    approveRequest(requestId: string, approverId: string): Promise<{
        id: string;
        scope: string;
        roleId: string;
        requestedBy: string;
        approvedBy: string | null;
        status: string;
        diffJson: import("@prisma/client").Prisma.JsonValue;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    rejectRequest(requestId: string, reason: string, rejectorId: string): Promise<{
        id: string;
        scope: string;
        roleId: string;
        requestedBy: string;
        approvedBy: string | null;
        status: string;
        diffJson: import("@prisma/client").Prisma.JsonValue;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(status?: string): Promise<({
        role: {
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
            tenantId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        scope: string;
        roleId: string;
        requestedBy: string;
        approvedBy: string | null;
        status: string;
        diffJson: import("@prisma/client").Prisma.JsonValue;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
