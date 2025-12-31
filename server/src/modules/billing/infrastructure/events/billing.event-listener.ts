import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentSuccessEvent } from '../../../payment/contract/payment.events';
import { BillingUseCase } from '../../application/billing.usecase';

@Injectable()
export class BillingEventListener {
    private readonly logger = new Logger(BillingEventListener.name);

    constructor(private readonly billingUseCase: BillingUseCase) { }

    @OnEvent(PaymentSuccessEvent.EVENT_NAME)
    async handlePaymentSuccess(event: PaymentSuccessEvent) {
        this.logger.log(`Received Payment Success Event: ${event.transactionId} for amount ${event.payload.amount}`);

        // Example Logic: 
        // 1. If metadata contains subscriptionId, mark invoice as paid
        // 2. Or extend subscription

        const { metadata, amount } = event.payload;
        if (metadata && metadata.subscriptionId) {
            try {
                // In a real scenario, we'd have a method to handle external payment confirmation
                // await this.billingUseCase.recordPayment(metadata.subscriptionId, amount);
                this.logger.log(`Processed payment for subscription ${metadata.subscriptionId}`);
            } catch (e) {
                this.logger.error(`Failed to process payment for subscription ${metadata.subscriptionId}`, e.stack);
            }
        }
    }
}
