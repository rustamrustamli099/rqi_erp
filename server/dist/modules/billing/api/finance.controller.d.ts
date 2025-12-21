import { PrismaService } from '../../../prisma.service';
export declare class FinanceController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(context: any): Promise<{
        stats: {
            totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
            accountsReceivable: number | import("@prisma/client/runtime/library").Decimal;
        };
        recentEntries: {
            id: string;
            tenantId: string;
            debitAccount: import("@prisma/client").$Enums.LedgerAccountType;
            creditAccount: import("@prisma/client").$Enums.LedgerAccountType;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            referenceId: string | null;
            referenceType: string | null;
            description: string | null;
            postedAt: Date;
        }[];
    }>;
}
