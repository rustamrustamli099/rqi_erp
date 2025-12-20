import { SubscriptionsUseCase } from '../application/subscriptions.usecase';
export declare class SubscriptionsController {
    private readonly subscriptionsUseCase;
    constructor(subscriptionsUseCase: SubscriptionsUseCase);
    create(createSubscriptionDto: any): Promise<{
        id: string;
        tenantId: string;
        packageId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
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
            priceMonthly: import("@prisma/client/runtime/library").Decimal;
            currency: string;
        };
    } & {
        id: string;
        tenantId: string;
        packageId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
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
            type: import(".prisma/client").$Enums.TenantType;
            isSystem: boolean;
            address: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
        invoices: {
            id: string;
            subscriptionId: string;
            number: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            amountDue: import("@prisma/client/runtime/library").Decimal;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            amountRemaining: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            dueDate: Date;
            paidAt: Date | null;
            pdfUrl: string | null;
            items: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        package: {
            id: string;
            name: string;
            description: string | null;
            priceMonthly: import("@prisma/client/runtime/library").Decimal;
            priceYearly: import("@prisma/client/runtime/library").Decimal;
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
    } & {
        id: string;
        tenantId: string;
        packageId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
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
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        nextBillingDate: Date;
        endDate: Date | null;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
