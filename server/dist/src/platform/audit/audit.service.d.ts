import { PrismaService } from '../../prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(data: {
        userId: string | null | undefined;
        action: string;
        module: string;
        method: string;
        endpoint: string;
        tenantId: string | null;
        branchId: string | null;
        details?: any;
        ipAddress?: string;
    }): Promise<{
        id: string;
        action: string;
        resource: string | null;
        module: string | null;
        userId: string | null;
        branchId: string | null;
        tenantId: string | null;
        details: import(".prisma/client").Prisma.JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
    }>;
}
