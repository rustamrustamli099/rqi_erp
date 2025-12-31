
import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import type { ISubscriptionRepository } from '../domain/subscription.repository.interface';
import type { IInvoiceRepository } from '../domain/invoice.repository.interface';
import { Subscription } from '../domain/subscription.entity';
import { Invoice } from '../domain/invoice.entity';
import type { IPackagesService } from '../../packages/contract';

@Injectable()
export class BillingUseCase {
    private readonly logger = new Logger(BillingUseCase.name);

    constructor(
        @Inject('ISubscriptionRepository')
        private readonly subscriptionRepository: ISubscriptionRepository,
        @Inject('IInvoiceRepository')
        private readonly invoiceRepository: IInvoiceRepository,
        @Inject('IPackagesService')
        private readonly packagesService: IPackagesService
    ) { }

    async getSubscription(tenantId: string): Promise<Subscription | null> {
        return this.subscriptionRepository.findByTenantId(tenantId);
    }

    /**
     * Calculates monthly total by fetching Package Price and summing Add-ons
     */
    async calculateMonthlyTotal(subscriptionId: string): Promise<number> {
        const sub = await this.subscriptionRepository.findById(subscriptionId);
        if (!sub) throw new BadRequestException("Subscription not found");

        const pkg = await this.packagesService.findOne(sub.packageId);
        if (!pkg) throw new BadRequestException("Package configuration missing");

        let total = Number(pkg.priceMonthly); // Use current package price (or snapshot if stored in sub)

        // Add items
        for (const item of sub.items) {
            total += Number(item.unitPrice) * item.quantity;
        }

        return total;
    }

    /**
     * Add item (Module/User) to subscription w/ Proration
     */
    async addSubscriptionItem(subscriptionId: string, name: string, type: string, price: number, quantity: number = 1) {
        const sub = await this.subscriptionRepository.findById(subscriptionId);
        if (!sub) throw new BadRequestException("Subscription not found");

        // Proration Logic
        const now = new Date();
        const nextBill = new Date(sub.nextBillingDate);
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysRemaining = Math.max(0, Math.ceil((nextBill.getTime() - now.getTime()) / msPerDay));

        // Simple proration (Price / 30 * Days)
        const proratedAmount = (price / 30) * daysRemaining * quantity;

        // Create Item via Repo
        await this.subscriptionRepository.addSubscriptionItem(subscriptionId, {
            name, type, quantity, unitPrice: price
        });

        // Generate Invoice for Prorated Amount
        if (proratedAmount > 0) {
            await this.createInvoice(subscriptionId, proratedAmount, `Prorated charge for ${name}`);
        }

        this.logger.log(`Added item ${name} to subscription ${subscriptionId}`);
    }

    async createInvoice(subscriptionId: string, amount: number, description: string): Promise<Invoice> {
        const invoice = Invoice.create(subscriptionId, amount, description);
        return this.invoiceRepository.create(invoice);
    }

    /**
     * Called by Cron Job
     */
    async processRecurringBilling() {
        const today = new Date();
        // Repository handles "lte: today" logic
        const dueSubs = await this.subscriptionRepository.findDueSubscriptions(today);

        let processed = 0;
        for (const sub of dueSubs) {
            try {
                const total = await this.calculateMonthlyTotal(sub.id);
                await this.createInvoice(sub.id, total, "Monthly Subscription Renewal");

                // Update Next Billing Date (Simple +1 Month logic)
                const nextDate = new Date(sub.nextBillingDate);
                nextDate.setMonth(nextDate.getMonth() + 1);

                // Update Partial
                await this.subscriptionRepository.update(sub.id, {
                    nextBillingDate: nextDate
                });
                processed++;
            } catch (err) {
                this.logger.error(`Failed to process billing for subscription ${sub.id}`, err.stack);
            }
        }
        return { processed };
    }
}
