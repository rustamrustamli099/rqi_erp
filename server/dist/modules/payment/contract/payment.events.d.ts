import { DomainEvent } from '../../../shared-kernel/event-bus/domain-event.base';
export declare class PaymentSuccessEvent extends DomainEvent {
    readonly transactionId: string;
    readonly payload: {
        amount: number;
        currency: string;
        provider: string;
        metadata: any;
    };
    static readonly EVENT_NAME = "payment.success";
    readonly eventName = "payment.success";
    constructor(transactionId: string, payload: {
        amount: number;
        currency: string;
        provider: string;
        metadata: any;
    }, metadata?: any);
}
export declare class PaymentFailedEvent extends DomainEvent {
    readonly transactionId: string;
    readonly payload: {
        reason: string;
        provider: string;
        metadata: any;
    };
    static readonly EVENT_NAME = "payment.failed";
    readonly eventName = "payment.failed";
    constructor(transactionId: string, payload: {
        reason: string;
        provider: string;
        metadata: any;
    }, metadata?: any);
}
