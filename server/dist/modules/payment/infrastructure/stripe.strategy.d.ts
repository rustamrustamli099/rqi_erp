import { PaymentStrategy, PaymentResult } from './payment-strategy.interface';
export declare class StripeStrategy implements PaymentStrategy {
    name: string;
    private readonly logger;
    initiatePayment(amount: number, currency: string, metadata: any): Promise<any>;
    verifyPayment(transactionId: string): Promise<PaymentResult>;
    handleWebhook(event: any): Promise<void>;
}
