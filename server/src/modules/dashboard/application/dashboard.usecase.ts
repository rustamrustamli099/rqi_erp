import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class DashboardUseCase {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async getStats() {
        const [userCount, tenantCount, branchCount] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.tenant.count(),
            this.prisma.branch.count(),
        ]);

        // Mock recent activity if AuditLog is empty or missing relation
        const recentActivity = await this.prisma.auditLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true } } }
        }).catch(() => []);

        return {
            userCount,
            tenantCount,
            branchCount,
            recentActivity
        };
    }
}
