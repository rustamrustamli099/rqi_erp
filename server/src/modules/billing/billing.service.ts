import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculates the current total cost for a subscription including base plan and active add-ons.
     */
    async calculateMonthlyTotal(subscriptionId: string): Promise<number> {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { package: true, items: true }
        });

        if (!sub) throw new BadRequestException("Subscription not found");

        let total = Number(sub.package.priceMonthly);

        // Add items (modules, extra users)
        for (const item of sub.items) {
            total += Number(item.unitPrice) * item.quantity;
        }

        return total;
    }

    /**
     * Adds a module or extra item to the subscription.
     * Handles proration for the remainder of the current billing cycle.
     */
    async addSubscriptionItem(subscriptionId: string, name: string, type: string, price: number, quantity: number = 1) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { package: true }
        });

        if (!sub) throw new BadRequestException("Subscription not found");

        // Proration Logic
        // 1. Calculate days remaining in cycle
        const now = new Date();
        const nextBill = new Date(sub.nextBillingDate);
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysRemaining = Math.max(0, Math.ceil((nextBill.getTime() - now.getTime()) / msPerDay));

        // Simple 30-day assumption for monthly rate proration logic for now, or exact days
        const proratedAmount = (price / 30) * daysRemaining * quantity;

        // Create the item
        const item = await this.prisma.subscriptionItem.create({
            data: {
                subscriptionId,
                name,
                type,
                quantity,
                unitPrice: new Prisma.Decimal(price)
            }
        });

        // Create an Invoice for the pro-rated amount immediately (SAP style - charge for feature activation)
        if (proratedAmount > 0) {
            await this.createInvoice(subscriptionId, proratedAmount, `Prorated charge for ${name}`);
        }

        return item;
    }

    /**
     * Generates an invoice for the subscription.
     */
    async createInvoice(subscriptionId: string, amount: number, description: string) {
        const invNum = `INV-${Date.now()}`;
        return this.prisma.invoice.create({
            data: {
                subscriptionId,
                number: invNum,
                amountDue: new Prisma.Decimal(amount),
                amountRemaining: new Prisma.Decimal(amount),
                status: 'OPEN',
                dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Due tomorrow
                items: JSON.stringify([{ description, amount }])
            }
        });
    }

    /**
     * Checks for due subscriptions and generates invoices (Scheduler would call this).
     */
    async processRecurringBilling() {
        const today = new Date();
        const dueSubs = await this.prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                nextBillingDate: { lte: today }
            }
        });

        for (const sub of dueSubs) {
            const total = await this.calculateMonthlyTotal(sub.id);
            // Create Invoice
            await this.createInvoice(sub.id, total, "Monthly Subscription Renewal");

            // Update next billing date
            const nextDate = new Date(sub.nextBillingDate);
            nextDate.setMonth(nextDate.getMonth() + 1);

            await this.prisma.subscription.update({
                where: { id: sub.id },
                data: { nextBillingDate: nextDate }
            });
        }

        return { processed: dueSubs.length };
    }
}
