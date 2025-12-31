
import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';
import { TenantContextGuard } from '../../../platform/tenant-context/tenant-context.guard';
import { TenantContext } from '../../../platform/auth/decorators/tenant-context.decorator';
import { TenantType, LedgerAccountType } from '@prisma/client';

@Controller('finance')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class FinanceController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('dashboard')
    async getDashboardStats(@TenantContext() context: any) {
        // 1. Defend: Only System Tenant Provider can access this
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: context.tenantId }
        });

        if (!tenant || !tenant.isSystem || tenant.type !== TenantType.PROVIDER) {
            throw new UnauthorizedException('Access denied: Only System Provider can view Finance Dashboard.');
        }

        // 2. Aggregate Ledger Data
        // Total Revenue (Credit Balance of REVENUE account)
        const revenue = await this.prisma.ledgerEntry.aggregate({
            where: {
                tenantId: tenant.id,
                creditAccount: LedgerAccountType.REVENUE
            },
            _sum: { amount: true }
        });

        // AR (Debit Balance of ACCOUNTS_RECEIVABLE)
        const ar = await this.prisma.ledgerEntry.aggregate({
            where: {
                tenantId: tenant.id,
                debitAccount: LedgerAccountType.ACCOUNTS_RECEIVABLE
            },
            _sum: { amount: true }
        });

        // Recent Transactions
        const recentEntries = await this.prisma.ledgerEntry.findMany({
            where: { tenantId: tenant.id },
            orderBy: { postedAt: 'desc' },
            take: 10
        });

        return {
            stats: {
                totalRevenue: revenue._sum.amount || 0,
                accountsReceivable: ar._sum.amount || 0,
            },
            recentEntries
        };
    }
}
