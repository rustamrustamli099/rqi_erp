import { Subscription } from './subscription.entity';
export interface ISubscriptionRepository {
    findById(id: string): Promise<Subscription | null>;
    findByTenantId(tenantId: string): Promise<Subscription | null>;
    findDueSubscriptions(date: Date): Promise<Subscription[]>;
    save(subscription: Subscription): Promise<void>;
    update(id: string, data: Partial<Subscription>): Promise<void>;
    addSubscriptionItem(subscriptionId: string, item: any): Promise<void>;
}
