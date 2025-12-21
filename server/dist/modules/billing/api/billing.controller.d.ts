import { BillingUseCase } from '../application/billing.usecase';
export declare class BillingController {
    private readonly billingUseCase;
    constructor(billingUseCase: BillingUseCase);
    getMySubscription(req: any): Promise<{
        currentMonthlyTotal: number;
        id: string;
        tenantId: string;
        packageId: string;
        status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "SUSPENDED" | "TRIALING";
        billingCycle: "MONTHLY" | "YEARLY";
        nextBillingDate: Date;
        items: import("../domain/subscription.entity").SubscriptionItem[] | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addSubscriptionItem(req: any, body: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
