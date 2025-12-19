import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { StripeStrategy } from '../infrastructure/stripe.strategy';
import { PaymentStrategy } from '../infrastructure/payment-strategy.interface';
import { PrismaService } from '../../../prisma.service';
import { DomainEventBus } from '../../../shared-kernel/event-bus/event-bus.service';
import { PaymentSuccessEvent } from '../contract/payment.events';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentUseCase {
    private readonly logger = new Logger(PaymentUseCase.name);
    private strategies: Map<string, PaymentStrategy> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly eventBus: DomainEventBus,
        @Inject('IPaymentGateway') private readonly paymentGateway: any // Type is PaymentStrategy interface, token handles injection
    ) {
        const stripeStrategy = new StripeStrategy();
        this.registerStrategy(stripeStrategy);
    }

    registerStrategy(strategy: PaymentStrategy) {
        this.strategies.set(strategy.name, strategy);
    }

    getStrategy(name: string): PaymentStrategy {
        const strategy = this.strategies.get(name);
        if (!strategy) {
            throw new BadRequestException(`Payment provider ${name} not supported`);
        }
        return strategy;
    }

    async processPayment(provider: string, amount: number, currency: string, metadata: any) {
        const strategy = this.getStrategy(provider);
        try {
            const result = await strategy.initiatePayment(amount, currency, metadata);
            // In a real flow, this might be synchronous or async webhook based.
            // For now, if initiation returns success immediately (or mock), we publish success.
            // But usually 'initiate' returns a client secret. The ACTUAL success comes via Webhook.
            return result;
        } catch (error) {
            // Log failure
            throw error;
        }
    }

    async handleWebhook(provider: string, payload: any) {
        const strategy = this.getStrategy(provider);
        const result = await strategy.handleWebhook(payload); // Expecting PaymentResult

        // If the strategy returns a transaction result, publish event
        // Note: We need to adapt the strategy interface to return standardized result to be useful here.
        // Assuming verification logic happens here or in strategy.

        // MOCK: Construct event for now based on payload or result
        // Ideally checking result.status === 'succeeded'

        return result;
    }

    // New method called when payment is definitely confirmed
    async confirmPayment(transactionId: string, details: any) {
        this.eventBus.publish(new PaymentSuccessEvent(transactionId, {
            amount: details.amount,
            currency: details.currency,
            provider: details.provider,
            metadata: details.metadata
        }));
    }
}
