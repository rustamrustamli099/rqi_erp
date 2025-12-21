import { DomainEvent } from '../../../shared-kernel/event-bus/domain-event.base';
export declare class InvoiceCreatedEvent extends DomainEvent {
    readonly invoiceId: string;
    readonly payload: {
        amount: number;
        currency: string;
        tenantId: string;
        dueDate: Date;
    };
    static readonly EVENT_NAME = "billing.invoice.created";
    readonly eventName = "billing.invoice.created";
    constructor(invoiceId: string, payload: {
        amount: number;
        currency: string;
        tenantId: string;
        dueDate: Date;
    }, metadata?: any);
}
export declare class SubscriptionActivatedEvent extends DomainEvent {
    readonly subscriptionId: string;
    readonly payload: {
        tenantId: string;
        packageId: string;
        startDate: Date;
        nextBillingDate: Date;
    };
    static readonly EVENT_NAME = "billing.subscription.activated";
    readonly eventName = "billing.subscription.activated";
    constructor(subscriptionId: string, payload: {
        tenantId: string;
        packageId: string;
        startDate: Date;
        nextBillingDate: Date;
    }, metadata?: any);
}
