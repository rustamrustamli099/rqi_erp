import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStrategy } from './strategies/payment-strategy.interface';
import { StripeStrategy } from './strategies/stripe.strategy';

@Injectable()
export class PaymentService {
    private strategies: Map<string, PaymentStrategy> = new Map();

    constructor(private stripeStrategy: StripeStrategy) {
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
        return strategy.initiatePayment(amount, currency, metadata);
    }

    async handleWebhook(provider: string, payload: any) {
        const strategy = this.getStrategy(provider);
        return strategy.handleWebhook(payload);
    }
}
