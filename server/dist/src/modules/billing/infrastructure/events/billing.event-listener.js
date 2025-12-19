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
var BillingEventListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingEventListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const payment_events_1 = require("../../../payment/contract/payment.events");
const billing_usecase_1 = require("../../application/billing.usecase");
let BillingEventListener = BillingEventListener_1 = class BillingEventListener {
    billingUseCase;
    logger = new common_1.Logger(BillingEventListener_1.name);
    constructor(billingUseCase) {
        this.billingUseCase = billingUseCase;
    }
    async handlePaymentSuccess(event) {
        this.logger.log(`Received Payment Success Event: ${event.transactionId} for amount ${event.payload.amount}`);
        const { metadata, amount } = event.payload;
        if (metadata && metadata.subscriptionId) {
            try {
                this.logger.log(`Processed payment for subscription ${metadata.subscriptionId}`);
            }
            catch (e) {
                this.logger.error(`Failed to process payment for subscription ${metadata.subscriptionId}`, e.stack);
            }
        }
    }
};
exports.BillingEventListener = BillingEventListener;
__decorate([
    (0, event_emitter_1.OnEvent)(payment_events_1.PaymentSuccessEvent.EVENT_NAME),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_events_1.PaymentSuccessEvent]),
    __metadata("design:returntype", Promise)
], BillingEventListener.prototype, "handlePaymentSuccess", null);
exports.BillingEventListener = BillingEventListener = BillingEventListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [billing_usecase_1.BillingUseCase])
], BillingEventListener);
//# sourceMappingURL=billing.event-listener.js.map