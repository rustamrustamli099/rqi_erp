import { PrismaService } from '../../../../../prisma.service';
import { CreateRoleDto } from '../api/dto/create-role.dto';
import { UpdateRoleDto } from '../api/dto/update-role.dto';
import { AuditService } from '../../../../../system/audit/audit.service';
export declare class RolesService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(dto: CreateRoleDto, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        _count: {
            users: number;
        };
        permissions: {
            roleId: string;
            permissionId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        permissions: {
            roleId: string;
            permissionId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    submitForApproval(id: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    approve(id: string, approverId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reject(id: string, reason: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateRoleDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        status: import("@prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
