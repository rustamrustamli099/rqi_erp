import { RolesService } from '../application/roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto, req: any): Promise<{
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
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(scope?: 'SYSTEM' | 'TENANT'): Promise<({
        _count: {
            userRoles: number;
            permissions: number;
        };
    } & {
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
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
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
        scope: import(".prisma/client").$Enums.RoleScope;
        level: number;
        isLocked: boolean;
        isEnabled: boolean;
        isSystem: boolean;
        status: import(".prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto, req: any): Promise<{
        permissions: {
            roleId: string;
            permissionId: string;
        }[];
    } & {
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
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    submitForApproval(id: string, req: any): Promise<{
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
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    approve(id: string, req: any): Promise<{
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
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reject(id: string, reason: string): Promise<{
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
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
