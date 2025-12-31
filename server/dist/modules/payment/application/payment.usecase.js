"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentUseCase = void 0;
const common_1 = require("@nestjs/common");
const stripe_strategy_1 = require("../infrastructure/stripe.strategy");
const event_bus_service_1 = require("../../../shared-kernel/event-bus/event-bus.service");
const payment_events_1 = require("../contract/payment.events");
const config_1 = require("@nestjs/config");
let PaymentUseCase = PaymentUseCase_1 = class PaymentUseCase {
    configService;
    eventBus;
    paymentGateway;
    logger = new common_1.Logger(PaymentUseCase_1.name);
    strategies = new Map();
    constructor(configService, eventBus, paymentGateway) {
        this.configService = configService;
        this.eventBus = eventBus;
        this.paymentGateway = paymentGateway;
        const stripeStrategy = new stripe_strategy_1.StripeStrategy();
        this.registerStrategy(stripeStrategy);
    }
    registerStrategy(strategy) {
        this.strategies.set(strategy.name, strategy);
    }
    getStrategy(name) {
        const strategy = this.strategies.get(name);
        if (!strategy) {
            throw new common_1.BadRequestException(`Payment provider ${name} not supported`);
        }
        return strategy;
    }
    async processPayment(provider, amount, currency, metadata) {
        const strategy = this.getStrategy(provider);
        try {
            const result = await strategy.initiatePayment(amount, currency, metadata);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async handleWebhook(provider, payload) {
        const strategy = this.getStrategy(provider);
        const result = await strategy.handleWebhook(payload);
        return result;
    }
    async confirmPayment(transactionId, details) {
        this.eventBus.publish(new payment_events_1.PaymentSuccessEvent(transactionId, {
            amount: details.amount,
            currency: details.currency,
            provider: details.provider,
            metadata: details.metadata
        }));
    }
};
exports.PaymentUseCase = PaymentUseCase;
exports.PaymentUseCase = PaymentUseCase = PaymentUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('IPaymentGateway')),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_bus_service_1.DomainEventBus, Object])
], PaymentUseCase);
//# sourceMappingURL=payment.usecase.js.map