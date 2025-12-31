import { PrismaService } from '../../../../../prisma.service';
import { AssignRoleDto } from '../api/dto/assign-role.dto';
import { AuditService } from '../../../../../system/audit/audit.service';
export declare class RoleAssignmentsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    assign(dto: AssignRoleDto, assignedBy: string, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<any>;
    revoke(userId: string, roleId: string, revokedBy: string, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<{
        success: boolean;
    }>;
    listByUser(targetUserId: string, context: {
        scopeType: string;
        scopeId: string | null;
    }): Promise<any>;
}
