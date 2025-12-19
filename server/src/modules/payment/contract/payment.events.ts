
import { DomainEvent } from '../../../shared-kernel/event-bus/domain-event.base';

export class PaymentSuccessEvent extends DomainEvent {
    public static readonly EVENT_NAME = 'payment.success';
    public readonly eventName = PaymentSuccessEvent.EVENT_NAME;

    constructor(
        public readonly transactionId: string,
        public readonly payload: {
            amount: number;
            currency: string;
            provider: string;
            metadata: any;
        },
        metadata?: any
    ) {
        super(transactionId, payload, metadata);
    }
}

export class PaymentFailedEvent extends DomainEvent {
    public static readonly EVENT_NAME = 'payment.failed';
    public readonly eventName = PaymentFailedEvent.EVENT_NAME;

    constructor(
        public readonly transactionId: string,
        public readonly payload: {
            reason: string;
            provider: string;
            metadata: any;
        },
        metadata?: any
    ) {
        super(transactionId, payload, metadata);
    }
}
