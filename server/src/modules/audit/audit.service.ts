import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async logAction(data: {
        userId: string | null | undefined;
        action: string;
        module: string;
        method: string;
        endpoint: string;
        tenantId: string | null;
        branchId: string | null;
        details?: any;
        ipAddress?: string;
    }) {
        return this.prisma.auditLog.create({
            data: {
                action: data.action,
                resource: data.endpoint || data.module, // Map endpoint to resource
                module: data.module,
                details: data.details ? JSON.stringify(data.details) : undefined,
                ipAddress: data.ipAddress || 'unknown',
                userId: data.userId || undefined,
                tenantId: data.tenantId || null,
                branchId: data.branchId,
            },
        });
    }
}
