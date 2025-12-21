import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';
export declare class Subscription extends AggregateRoot<Subscription> {
    readonly id: string;
    tenantId: string;
    packageId: string;
    status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED' | 'TRIALING';
    billingCycle: 'MONTHLY' | 'YEARLY';
    nextBillingDate: Date;
    items: SubscriptionItem[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, tenantId: string, packageId: string, status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED' | 'TRIALING', billingCycle: 'MONTHLY' | 'YEARLY', nextBillingDate: Date, items: SubscriptionItem[] | undefined, createdAt: Date, updatedAt: Date);
}
export declare class SubscriptionItem {
    readonly id: string;
    name: string;
    type: string;
    quantity: number;
    unitPrice: number;
    constructor(id: string, name: string, type: string, quantity: number, unitPrice: number);
}
