"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionActivatedEvent = exports.InvoiceCreatedEvent = void 0;
const domain_event_base_1 = require("../../../shared-kernel/event-bus/domain-event.base");
class InvoiceCreatedEvent extends domain_event_base_1.DomainEvent {
    invoiceId;
    payload;
    static EVENT_NAME = 'billing.invoice.created';
    eventName = InvoiceCreatedEvent.EVENT_NAME;
    constructor(invoiceId, payload, metadata) {
        super(invoiceId, payload, metadata);
        this.invoiceId = invoiceId;
        this.payload = payload;
    }
}
exports.InvoiceCreatedEvent = InvoiceCreatedEvent;
class SubscriptionActivatedEvent extends domain_event_base_1.DomainEvent {
    subscriptionId;
    payload;
    static EVENT_NAME = 'billing.subscription.activated';
    eventName = SubscriptionActivatedEvent.EVENT_NAME;
    constructor(subscriptionId, payload, metadata) {
        super(subscriptionId, payload, metadata);
        this.subscriptionId = subscriptionId;
        this.payload = payload;
    }
}
exports.SubscriptionActivatedEvent = SubscriptionActivatedEvent;
//# sourceMappingURL=billing.events.js.map