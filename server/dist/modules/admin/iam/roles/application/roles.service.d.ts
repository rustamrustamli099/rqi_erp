import { PrismaService } from '../../../../../prisma.service';
import { CreateRoleDto } from '../api/dto/create-role.dto';
import { UpdateRoleDto } from '../api/dto/update-role.dto';
import { AuditService } from '../../../../../system/audit/audit.service';
import { ListQueryDto, PaginatedResult } from '../../../../../common/dto/pagination.dto';
export declare class RolesService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    debugCount(): Promise<{
        total: number;
        first: {
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
        } | null;
    }>;
    create(dto: CreateRoleDto, userId: string, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<{
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
    findAll(query: ListQueryDto, context?: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<PaginatedResult<any>>;
    findOne(id: string): Promise<{
        permissions: ({
            permission: {
                id: string;
                name: string | null;
                slug: string;
                description: string | null;
                module: string;
                scope: string;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
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
    submitForApproval(id: string, userId: string, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<{
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
    approve(id: string, approverId: string, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<{
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
    reject(id: string, reason: string, userId: string | undefined, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<{
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
    update(id: string, dto: UpdateRoleDto, userId: string | undefined, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<{
        permissions: ({
            permission: {
                id: string;
                name: string | null;
                slug: string;
                description: string | null;
                module: string;
                scope: string;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
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
    remove(id: string, userId: string, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<{
        success: boolean;
    }>;
    private verifyOwnership;
    private detectCycle;
}
