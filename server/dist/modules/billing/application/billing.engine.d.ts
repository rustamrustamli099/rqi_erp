import { PrismaService } from '../../../prisma.service';
import { CommissionService } from './commission.service';
export declare class BillingEngine {
    private readonly prisma;
    private readonly commissionService;
    private readonly logger;
    constructor(prisma: PrismaService, commissionService: CommissionService);
    generateInvoice(subscriptionId: string, items: {
        name: string;
        amount: number;
    }[]): Promise<{
        id: string;
        subscriptionId: string;
        number: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        amountRemaining: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        dueDate: Date;
        paidAt: Date | null;
        pdfUrl: string | null;
        items: import("@prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    processPayment(invoiceId: string, gateway?: 'STRIPE' | 'KAPITAL'): Promise<({
        subscription: {
            tenant: {
                id: string;
                name: string;
                slug: string;
                parentTenantId: string | null;
                email: string | null;
                phone: string | null;
                website: string | null;
                status: string;
                type: import("@prisma/client").$Enums.TenantType;
                isSystem: boolean;
                address: import("@prisma/client").Prisma.JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            packageId: string;
            status: import("@prisma/client").$Enums.SubscriptionStatus;
            billingCycle: import("@prisma/client").$Enums.BillingCycle;
            startDate: Date;
            nextBillingDate: Date;
            endDate: Date | null;
            trialEndsAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        subscriptionId: string;
        number: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        amountDue: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        amountRemaining: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        dueDate: Date;
        paidAt: Date | null;
        pdfUrl: string | null;
        items: import("@prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }) | {
        success: boolean;
        invoiceId: string;
    }>;
    private postToLedger;
}
