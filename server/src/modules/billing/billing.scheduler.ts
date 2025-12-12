import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { BillingService } from './billing.service';

@Injectable()
export class BillingScheduler {
    private readonly logger = new Logger(BillingScheduler.name);

    constructor(
        private prisma: PrismaService,
        private paymentService: PaymentService,
        private billingService: BillingService,
    ) { }

    // Run every day at midnight
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyBilling() {
        this.logger.log('Starting Daily Billing Run...');

        const today = new Date();

        // 1. Find Subscriptions Due for Billing
        const dueSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: { in: ['ACTIVE', 'PAST_DUE'] },
                nextBillingDate: { lte: today },
            },
            include: {
                tenant: true,
                package: true,
                items: true,
                paymentMethods: { where: { isDefault: true } }
            }
        });

        this.logger.log(`Found ${dueSubscriptions.length} subscriptions due for billing.`);

        for (const sub of dueSubscriptions) {
            this.processSubscription(sub);
        }
    }

    private async processSubscription(sub: any) {
        this.logger.log(`Processing subscription for tenant: ${sub.tenant.name} (${sub.tenantId})`);

        // A. Calculate Total Amount
        let amount = Number(sub.package.priceMonthly);

        // Add Modules
        for (const item of sub.items) {
            amount += Number(item.unitPrice) * item.quantity;
        }

        // Add Usage (Mock logic for now, represents API overages etc)
        // const usageCost = await this.billingService.calculateUsageCost(sub.tenantId);
        // amount += usageCost;

        // B. Attempt Payment
        const paymentMethod = sub.paymentMethods[0];
        let paymentSuccess = false;
        let transactionId = null;

        if (paymentMethod) {
            try {
                const result = await this.paymentService.processPayment(
                    paymentMethod.provider,
                    amount,
                    sub.package.currency,
                    { subscriptionId: sub.id }
                );
                // Mock check - in strategy we return a secret, here we assume it auto-confirms or we check status
                // For simulation, let's assume always success unless specified
                paymentSuccess = true;
                transactionId = result.clientSecret; // Mock ID
            } catch (error) {
                this.logger.error(`Payment failed for ${sub.tenant.name}: ${error.message}`);
            }
        } else {
            this.logger.warn(`No default payment method for ${sub.tenant.name}`);
        }

        // C. Handle Result
        if (paymentSuccess) {
            await this.handleSuccess(sub, amount, transactionId || 'MANUAL');
        } else {
            await this.handleFailure(sub, amount);
        }
    }

    private async handleSuccess(sub: any, amount: number, transactionId: string) {
        // 1. Generate PAID Invoice
        await this.prisma.invoice.create({
            data: {
                subscriptionId: sub.id,
                number: `INV-${Date.now()}`,
                amountDue: amount,
                amountPaid: amount,
                amountRemaining: 0,
                status: 'PAID',
                dueDate: new Date(),
                paidAt: new Date(),
                transactions: {
                    create: {
                        amount,
                        status: 'SUCCESS',
                        providerTxId: transactionId
                    }
                }
            }
        });

        // 2. Update Subscription Dates
        const nextDate = new Date(sub.nextBillingDate);
        nextDate.setMonth(nextDate.getMonth() + 1); // Monthly cycle

        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
                status: 'ACTIVE',
                nextBillingDate: nextDate,
                // Reset any retry counters if we had them
            }
        });

        this.logger.log(`Billing successful for ${sub.tenant.name}. Next bill: ${nextDate.toISOString()}`);
    }

    private async handleFailure(sub: any, amount: number) {
        // 1. Generate OPEN/FAILED Invoice
        await this.prisma.invoice.create({
            data: {
                subscriptionId: sub.id,
                number: `INV-${Date.now()}`,
                amountDue: amount,
                amountPaid: 0,
                amountRemaining: amount,
                status: 'OPEN', // or PAST_DUE logic
                dueDate: new Date(),
                transactions: {
                    create: {
                        amount,
                        status: 'FAILED',
                        failureReason: 'Payment Declined or No Method'
                    }
                }
            }
        });

        // 2. SAP Retry Logic: 1 -> 3 -> 7 days
        // For simplicity, we just mark as PAST_DUE and don't advance the date, so it picks up tomorrow?
        // Better: Store a "retryCount" or "lastRetryDate".
        // Assuming naive daily retry for now.

        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'PAST_DUE' } // Triggers the "Payment Required" warnings ideally
        });

        this.logger.warn(`Billing failed for ${sub.tenant.name}. Status set to PAST_DUE.`);
    }
}
