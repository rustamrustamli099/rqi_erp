import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto, req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
        status: import(".prisma/client").$Enums.RoleStatus;
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
        status: import(".prisma/client").$Enums.RoleStatus;
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
        status: import(".prisma/client").$Enums.RoleStatus;
        approverId: string | null;
        approvalNote: string | null;
        submittedById: string | null;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<{
        id: string;
        name: string;
        description: string | null;
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
