import { BillingUseCase } from '../../application/billing.usecase';
export declare class BillingCron {
    private readonly billingUseCase;
    private readonly logger;
    constructor(billingUseCase: BillingUseCase);
    handleDailyBilling(): Promise<void>;
}
