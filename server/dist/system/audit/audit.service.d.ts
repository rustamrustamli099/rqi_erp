import { PrismaService } from '../../prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(data: {
        action: string;
        resource?: string;
        module?: string;
        userId?: string;
        tenantId?: string;
        branchId?: string;
        ip?: string;
        ipAddress?: string;
        userAgent?: string;
        details?: any;
    }): Promise<void>;
    private tryStringify;
}
