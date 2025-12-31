import { RoleApprovalsService } from '../application/role-approvals.service';
import { CreateRoleChangeRequestDto } from './dto/create-role-change-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
export declare class RoleApprovalsController {
    private readonly approvalsService;
    constructor(approvalsService: RoleApprovalsService);
    create(dto: CreateRoleChangeRequestDto, req: any): Promise<{
        id: string;
        scope: string;
        roleId: string;
        requestedBy: string;
        approvedBy: string | null;
        status: string;
        diffJson: import(".prisma/client").Prisma.JsonValue;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(status?: string): Promise<({
        role: {
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
        };
    } & {
        id: string;
        scope: string;
        roleId: string;
        requestedBy: string;
        approvedBy: string | null;
        status: string;
        diffJson: import(".prisma/client").Prisma.JsonValue;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    approve(id: string, req: any): Promise<{
        id: string;
        scope: string;
        roleId: string;
        requestedBy: string;
        approvedBy: string | null;
        status: string;
        diffJson: import(".prisma/client").Prisma.JsonValue;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reject(id: string, dto: RejectRequestDto, req: any): Promise<{
        id: string;
        scope: string;
        roleId: string;
        requestedBy: string;
        approvedBy: string | null;
        status: string;
        diffJson: import(".prisma/client").Prisma.JsonValue;
        reason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
