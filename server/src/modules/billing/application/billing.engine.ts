
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
    LedgerAccountType,
    TenantType,
    TransactionStatus,
    InvoiceStatus,
    BillingCycle
} from '@prisma/client';
import { CommissionService } from './commission.service';

@Injectable()
export class BillingEngine {
    private readonly logger = new Logger(BillingEngine.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly commissionService: CommissionService
    ) { }

    /**
     * 1. Generate Invoice (Core Logic)
     * Designed to be called by Scheduler or Admin Console
     */
    async generateInvoice(
        subscriptionId: string,
        items: { name: string; amount: number }[]
    ) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { tenant: true }
        });

        if (!sub) throw new NotFoundException('Subscription not found');

        const amountDue = items.reduce((sum, item) => sum + item.amount, 0);

        // Create Invoice
        const invoice = await this.prisma.invoice.create({
            data: {
                subscriptionId: sub.id,
                number: `INV-${Date.now()}`,
                status: InvoiceStatus.OPEN,
                amountDue,
                amountRemaining: amountDue,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
                items: items as any, // Simple JSON storage for now
            }
        });

        this.logger.log(`Generated Invoice ${invoice.number} for Tenant ${sub.tenant.name} (${sub.tenantId})`);

        // Create Platform Billing Transaction (Pending)
        await this.prisma.billingTransaction.create({
            data: {
                invoiceId: invoice.id,
                amount: amountDue,
                status: 'PENDING',
                gateway: 'SYSTEM_GENERATED',
            }
        });

        return invoice;
    }

    /**
     * 2. Process Payment (Mock Gateway)
     * This simulates a successful charge and triggers Accounting
     */
    async processPayment(invoiceId: string, gateway: 'STRIPE' | 'KAPITAL' = 'STRIPE') {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { subscription: { include: { tenant: true } } }
        });

        if (!invoice) throw new NotFoundException('Invoice not found');
        if (invoice.status === InvoiceStatus.PAID) return invoice;

        // 1. Update Invoice
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: InvoiceStatus.PAID,
                amountPaid: invoice.amountDue,
                amountRemaining: 0,
                paidAt: new Date(),
            }
        });

        // 2. Log Platform Transaction Success
        await this.prisma.billingTransaction.create({
            data: {
                invoiceId: invoice.id,
                amount: invoice.amountDue,
                status: 'SUCCESS',
                gateway,
                gatewayTxId: `tx_mock_${Date.now()}`
            }
        });

        this.logger.log(`Invoice ${invoice.number} PAID. Triggering Accounting...`);

        // 3. Trigger Ledger Posting (Accounting)
        await this.postToLedger(invoice);

        return { success: true, invoiceId };
    }

    /**
     * 3. Accounting Engine
     * Posts strict Double-Entry Ledger records
     */
    private async postToLedger(invoice: any) {
        // Find System Tenant (Provider)
        const systemTenant = await this.prisma.tenant.findFirst({
            where: { type: TenantType.PROVIDER, isSystem: true }
        });

        if (!systemTenant) {
            this.logger.error('CRITICAL: System Tenant not found! Revenue lost in accounting.');
            return;
        }

        // Determine Accounts
        // Debit: CASH (Asset increases)
        // Credit: REVENUE (Income increases)

        // In strict accounting, we credit Revenue.

        await this.prisma.ledgerEntry.createMany({
            data: [
                // 1. Provider Revenue Entry
                {
                    tenantId: systemTenant.id, // Only System Tenant sees this revenue
                    debitAccount: LedgerAccountType.CASH,
                    creditAccount: LedgerAccountType.REVENUE,
                    amount: invoice.amountDue,
                    currency: invoice.currency,
                    referenceId: invoice.id,
                    referenceType: 'INVOICE',
                    description: `Subscription Revenue: ${invoice.number} (${invoice.subscription.tenant.name})`
                }
            ]
        });

        this.logger.log(`✅ System Ledger Entry Created: +${invoice.amountDue} AZN for Provider`);

        // Check for Reseller (If Customer Tenant has a Reseller)
        // Call Commission Service
        await this.commissionService.processCommission(invoice.id, Number(invoice.amountDue), invoice.subscription.tenant.id);
    }
}
