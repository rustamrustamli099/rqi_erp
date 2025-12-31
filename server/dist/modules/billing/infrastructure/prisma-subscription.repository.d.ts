import { PrismaService } from '../../../prisma.service';
import { ISubscriptionRepository } from '../domain/subscription.repository.interface';
import { Subscription } from '../domain/subscription.entity';
export declare class PrismaSubscriptionRepository implements ISubscriptionRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Subscription | null>;
    findByTenantId(tenantId: string): Promise<Subscription | null>;
    findDueSubscriptions(date: Date): Promise<Subscription[]>;
    save(subscription: Subscription): Promise<void>;
    update(id: string, data: Partial<Subscription>): Promise<void>;
    addSubscriptionItem(subscriptionId: string, item: any): Promise<void>;
    private mapToDomain;
}
