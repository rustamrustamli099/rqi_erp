"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StripeStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeStrategy = void 0;
const common_1 = require("@nestjs/common");
let StripeStrategy = StripeStrategy_1 = class StripeStrategy {
    name = 'STRIPE';
    logger = new common_1.Logger(StripeStrategy_1.name);
    async initiatePayment(amount, currency, metadata) {
        this.logger.log(`Initiating Stripe payment: ${amount} ${currency}`);
        return {
            provider: 'stripe',
            clientSecret: 'mock_pi_' + Date.now() + '_secret_' + Math.random().toString(36).substring(7),
            amount,
            currency
        };
    }
    async verifyPayment(transactionId) {
        this.logger.log(`Verifying Stripe payment: ${transactionId}`);
        return {
            success: true,
            transactionId: transactionId,
            raw: { status: 'succeeded' }
        };
    }
    async handleWebhook(event) {
        this.logger.log(`Received Stripe Webhook: ${event.type}`);
    }
};
exports.StripeStrategy = StripeStrategy;
exports.StripeStrategy = StripeStrategy = StripeStrategy_1 = __decorate([
    (0, common_1.Injectable)()
], StripeStrategy);
//# sourceMappingURL=stripe.strategy.js.map