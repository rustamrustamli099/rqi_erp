import { PaymentUseCase } from '../application/payment.usecase';
export declare class PaymentController {
    private readonly paymentUseCase;
    constructor(paymentUseCase: PaymentUseCase);
    handleWebhook(signature: string, body: any): Promise<void>;
}
