
import { DomainEvent } from '../../../shared-kernel/event-bus/domain-event.base';

export class InvoiceCreatedEvent extends DomainEvent {
    public static readonly EVENT_NAME = 'billing.invoice.created';
    public readonly eventName = InvoiceCreatedEvent.EVENT_NAME;

    constructor(
        public readonly invoiceId: string,
        public readonly payload: {
            amount: number;
            currency: string;
            tenantId: string;
            dueDate: Date;
        },
        metadata?: any
    ) {
        super(invoiceId, payload, metadata);
    }
}

export class SubscriptionActivatedEvent extends DomainEvent {
    public static readonly EVENT_NAME = 'billing.subscription.activated';
    public readonly eventName = SubscriptionActivatedEvent.EVENT_NAME;

    constructor(
        public readonly subscriptionId: string,
        public readonly payload: {
            tenantId: string;
            packageId: string;
            startDate: Date;
            nextBillingDate: Date;
        },
        metadata?: any
    ) {
        super(subscriptionId, payload, metadata);
    }
}
