import { PrismaService } from '../../prisma.service';
export interface PermissionComputationRequest {
    userId: string;
    scopeType: 'SYSTEM' | 'TENANT' | 'UNIT';
    scopeId: string | null;
}
export declare class EffectivePermissionsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    computeEffectivePermissions(params: PermissionComputationRequest): Promise<string[]>;
    private resolveRoleHierarchy;
}
