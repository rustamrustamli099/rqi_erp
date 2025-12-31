
import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';

export class Subscription extends AggregateRoot<Subscription> {
    constructor(
        public readonly id: string,
        public tenantId: string,
        public packageId: string,
        public status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED' | 'TRIALING',
        public billingCycle: 'MONTHLY' | 'YEARLY',
        public nextBillingDate: Date,
        public items: SubscriptionItem[] = [],
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {
        super();
    }
}

export class SubscriptionItem {
    constructor(
        public readonly id: string,
        public name: string,
        public type: string,
        public quantity: number,
        public unitPrice: number,
    ) { }
}
