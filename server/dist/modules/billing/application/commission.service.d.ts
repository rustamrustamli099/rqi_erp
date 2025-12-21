import { PrismaService } from '../../../prisma.service';
export declare class CommissionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processCommission(invoiceId: string, amount: number, tenantId: string): Promise<void>;
}
