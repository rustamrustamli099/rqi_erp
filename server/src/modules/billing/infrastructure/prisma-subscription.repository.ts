
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ISubscriptionRepository } from '../domain/subscription.repository.interface';
import { Subscription, SubscriptionItem } from '../domain/subscription.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
    constructor(private prisma: PrismaService) { }

    async findById(id: string): Promise<Subscription | null> {
        const row = await this.prisma.subscription.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!row) return null;
        return this.mapToDomain(row);
    }

    async findByTenantId(tenantId: string): Promise<Subscription | null> {
        const row = await this.prisma.subscription.findUnique({
            where: { tenantId },
            include: { items: true }
        });
        if (!row) return null;
        return this.mapToDomain(row);
    }

    async findDueSubscriptions(date: Date): Promise<Subscription[]> {
        const rows = await this.prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                nextBillingDate: { lte: date }
            },
            include: { items: true }
        });
        return rows.map(r => this.mapToDomain(r));
    }

    async save(subscription: Subscription): Promise<void> {
        // Upsert logic or separate create/update? Interface said save.
        // For simplicity, let's assume update for now as subscriptions are usually created by signup flow (Tenant module).
        // But if we need create, we use create.
        await this.prisma.subscription.upsert({
            where: { id: subscription.id },
            update: {
                nextBillingDate: subscription.nextBillingDate,
                status: subscription.status,
                // Items handled separately or via nested update? 
                // Using addSubscriptionItem logic for items.
            },
            create: {
                id: subscription.id,
                tenantId: subscription.tenantId,
                packageId: subscription.packageId,
                nextBillingDate: subscription.nextBillingDate,
                status: subscription.status,
                billingCycle: subscription.billingCycle,
            }
        });
    }

    async update(id: string, data: Partial<Subscription>): Promise<void> {
        await this.prisma.subscription.update({
            where: { id },
            data: {
                nextBillingDate: data.nextBillingDate,
                status: data.status,
            }
        });
    }

    async addSubscriptionItem(subscriptionId: string, item: any): Promise<void> {
        await this.prisma.subscriptionItem.create({
            data: {
                subscriptionId,
                name: item.name,
                type: item.type,
                quantity: item.quantity,
                unitPrice: new Prisma.Decimal(item.unitPrice)
            }
        });
    }

    private mapToDomain(row: any): Subscription {
        const items = (row.items || []).map((i: any) => new SubscriptionItem(
            i.id,
            i.name,
            i.type,
            i.quantity,
            Number(i.unitPrice)
        ));

        // Use 'as any' for enum casting or validate
        return new Subscription(
            row.id,
            row.tenantId,
            row.packageId,
            row.status,
            row.billingCycle,
            row.nextBillingDate,
            items,
            row.createdAt,
            row.updatedAt
        );
    }
}
