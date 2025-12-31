
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RetentionService {
    private readonly logger = new Logger(RetentionService.name);

    constructor(private readonly prisma: PrismaService) { }

    async createPolicy(data: { entity: string; days: number; action: string }) {
        // @ts-ignore - Prisma client not yet regenerated
        return this.prisma.retentionPolicy.create({ data });
    }

    async getPolicies() {
        // @ts-ignore
        return this.prisma.retentionPolicy.findMany();
    }

    async deletePolicy(id: string) {
        // @ts-ignore
        return this.prisma.retentionPolicy.delete({ where: { id } });
    }

    async executePolicy(dryRun: boolean = true) {
        // @ts-ignore
        const policies = await this.prisma.retentionPolicy.findMany({ where: { isActive: true } });
        const results: any[] = [];

        for (const policy of policies) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - policy.days);

            this.logger.log(`Executing retention for ${policy.entity} (Before ${cutoffDate.toISOString()}) - DryRun: ${dryRun}`);

            let count = 0;
            // Dynamic execution based on entity
            // This is risky in strict type systems, usually requires a mapping
            // For MVP/Monolith: Switch case
            try {
                if (policy.entity === 'AuditLog') {
                    if (dryRun) {
                        count = await this.prisma.auditLog.count({ where: { createdAt: { lt: cutoffDate } } });
                    } else {
                        const batch = await this.prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoffDate } } });
                        count = batch.count;
                    }
                } else if (policy.entity === 'Notification') {
                    if (dryRun) {
                        count = await this.prisma.notification.count({ where: { createdAt: { lt: cutoffDate } } });
                    } else {
                        const batch = await this.prisma.notification.deleteMany({ where: { createdAt: { lt: cutoffDate } } });
                        count = batch.count;
                    }
                }

                // Add more entities here

                results.push({
                    policyId: policy.id,
                    entity: policy.entity,
                    affectedRows: count,
                    status: 'SUCCESS'
                });

                if (!dryRun) {
                    // Update lastRunAt
                    // @ts-ignore
                    await this.prisma.retentionPolicy.update({
                        where: { id: policy.id },
                        data: { lastRunAt: new Date() }
                    });
                }

            } catch (error) {
                this.logger.error(`Failed to execute policy ${policy.id}`, error);
                results.push({
                    policyId: policy.id,
                    entity: policy.entity,
                    error: error.message,
                    status: 'FAILED'
                });
            }
        }
        return results;
    }
}
