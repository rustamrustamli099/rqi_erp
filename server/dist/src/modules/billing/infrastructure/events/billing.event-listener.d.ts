import { PaymentSuccessEvent } from '../../../payment/contract/payment.events';
import { BillingUseCase } from '../../application/billing.usecase';
export declare class BillingEventListener {
    private readonly billingUseCase;
    private readonly logger;
    constructor(billingUseCase: BillingUseCase);
    handlePaymentSuccess(event: PaymentSuccessEvent): Promise<void>;
}
