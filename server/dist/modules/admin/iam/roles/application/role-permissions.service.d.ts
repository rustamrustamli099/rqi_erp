import { PrismaService } from '../../../../../prisma.service';
import { AuditService } from '../../../../../system/audit/audit.service';
import { UpdateRolePermissionsDto } from '../api/dto/update-role-permissions.dto';
export declare class RolePermissionsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    updateRolePermissions(actorId: string, roleId: string, payload: UpdateRolePermissionsDto): Promise<{
        roleId: any;
        version: any;
        addedCount: number;
        removedCount: number;
    }>;
}
