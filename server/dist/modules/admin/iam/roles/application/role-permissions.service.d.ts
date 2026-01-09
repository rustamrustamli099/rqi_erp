import { PrismaService } from '../../../../../prisma.service';
import { AuditService } from '../../../../../system/audit/audit.service';
import { UpdateRolePermissionsDto } from '../api/dto/update-role-permissions.dto';
import { CachedEffectivePermissionsService } from '../../../../../platform/auth/cached-effective-permissions.service';
import { DecisionOrchestrator } from '../../../../../platform/decision/decision.orchestrator';
export declare class RolePermissionsService {
    private prisma;
    private auditService;
    private cachedPermissionsService;
    private decisionOrchestrator;
    constructor(prisma: PrismaService, auditService: AuditService, cachedPermissionsService: CachedEffectivePermissionsService, decisionOrchestrator: DecisionOrchestrator);
    updateRolePermissions(actorId: string, roleId: string, payload: UpdateRolePermissionsDto): Promise<{
        roleId: any;
        version: any;
        addedCount: number;
        removedCount: number;
    }>;
    private invalidateCacheForUsersWithRole;
}
