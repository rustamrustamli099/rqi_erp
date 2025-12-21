"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFailedEvent = exports.PaymentSuccessEvent = void 0;
const domain_event_base_1 = require("../../../shared-kernel/event-bus/domain-event.base");
class PaymentSuccessEvent extends domain_event_base_1.DomainEvent {
    transactionId;
    payload;
    static EVENT_NAME = 'payment.success';
    eventName = PaymentSuccessEvent.EVENT_NAME;
    constructor(transactionId, payload, metadata) {
        super(transactionId, payload, metadata);
        this.transactionId = transactionId;
        this.payload = payload;
    }
}
exports.PaymentSuccessEvent = PaymentSuccessEvent;
class PaymentFailedEvent extends domain_event_base_1.DomainEvent {
    transactionId;
    payload;
    static EVENT_NAME = 'payment.failed';
    eventName = PaymentFailedEvent.EVENT_NAME;
    constructor(transactionId, payload, metadata) {
        super(transactionId, payload, metadata);
        this.transactionId = transactionId;
        this.payload = payload;
    }
}
exports.PaymentFailedEvent = PaymentFailedEvent;
//# sourceMappingURL=payment.events.js.map