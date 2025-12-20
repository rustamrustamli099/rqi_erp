
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async logAction(data: {
        action: string;
        resource?: string;
        module?: string;
        userId?: string;
        tenantId?: string;
        branchId?: string;
        ip?: string; // Consumers might pass 'ip', we map to 'ipAddress'
        ipAddress?: string;
        userAgent?: string;
        details?: any;
    }) {
        try {
            // Check if tenantId exists if provided
            if (data.tenantId) {
                const tenantExists = await this.prisma.tenant.findUnique({
                    where: { id: data.tenantId },
                    select: { id: true } // Only select ID for efficiency
                });

                if (!tenantExists) {
                    console.warn(`[AUDIT] Skipped log for non-existent tenant: ${data.tenantId}`);
                    return;
                }
            }

            // Create log entry
            await this.prisma.auditLog.create({
                data: {
                    action: data.action,
                    resource: data.resource || 'SYSTEM',
                    module: data.module || null,
                    userId: data.userId || null,
                    tenantId: data.tenantId || null,
                    branchId: data.branchId || null,
                    ipAddress: data.ipAddress || data.ip || null, // Map ip/ipAddress to schema column
                    userAgent: data.userAgent || null,
                    details: data.details ? JSON.stringify(data.details) : undefined,
                },
            });
        } catch (error) {
            console.error('[AUDIT] Failed to persist log:', error);
            // Non-blocking: Don't throw
        }
    }
}
