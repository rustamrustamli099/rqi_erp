import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
export declare class SubscriptionsUseCase {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createSubscriptionDto: any): Promise<{
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
    }>;
    findAll(): Promise<({
        tenant: {
            name: string;
            slug: string;
        };
        package: {
            name: string;
            currency: string;
            priceMonthly: Prisma.Decimal;
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
    })[]>;
    findOne(id: string): Promise<({
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
            address: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
        package: {
            id: string;
            name: string;
            description: string | null;
            priceMonthly: Prisma.Decimal;
            priceYearly: Prisma.Decimal;
            currency: string;
            maxUsers: number;
            maxStorageGB: number;
            maxBranches: number;
            features: string | null;
            isActive: boolean;
            isPopular: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        invoices: {
            id: string;
            subscriptionId: string;
            number: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            amountDue: Prisma.Decimal;
            amountPaid: Prisma.Decimal;
            amountRemaining: Prisma.Decimal;
            currency: string;
            dueDate: Date;
            paidAt: Date | null;
            pdfUrl: string | null;
            items: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
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
    }) | null>;
    remove(id: string): Promise<{
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
    }>;
}
