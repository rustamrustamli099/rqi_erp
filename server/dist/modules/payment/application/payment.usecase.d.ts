import { PaymentStrategy } from '../infrastructure/payment-strategy.interface';
import { DomainEventBus } from '../../../shared-kernel/event-bus/event-bus.service';
import { ConfigService } from '@nestjs/config';
export declare class PaymentUseCase {
    private readonly configService;
    private readonly eventBus;
    private readonly paymentGateway;
    private readonly logger;
    private strategies;
    constructor(configService: ConfigService, eventBus: DomainEventBus, paymentGateway: any);
    registerStrategy(strategy: PaymentStrategy): void;
    getStrategy(name: string): PaymentStrategy;
    processPayment(provider: string, amount: number, currency: string, metadata: any): Promise<any>;
    handleWebhook(provider: string, payload: any): Promise<void>;
    confirmPayment(transactionId: string, details: any): Promise<void>;
}
