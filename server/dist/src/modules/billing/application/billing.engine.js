"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillingEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingEngine = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const client_1 = require("@prisma/client");
const commission_service_1 = require("./commission.service");
let BillingEngine = BillingEngine_1 = class BillingEngine {
    prisma;
    commissionService;
    logger = new common_1.Logger(BillingEngine_1.name);
    constructor(prisma, commissionService) {
        this.prisma = prisma;
        this.commissionService = commissionService;
    }
    async generateInvoice(subscriptionId, items) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { tenant: true }
        });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        const amountDue = items.reduce((sum, item) => sum + item.amount, 0);
        const invoice = await this.prisma.invoice.create({
            data: {
                subscriptionId: sub.id,
                number: `INV-${Date.now()}`,
                status: client_1.InvoiceStatus.OPEN,
                amountDue,
                amountRemaining: amountDue,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                items: items,
            }
        });
        this.logger.log(`Generated Invoice ${invoice.number} for Tenant ${sub.tenant.name} (${sub.tenantId})`);
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
    async processPayment(invoiceId, gateway = 'STRIPE') {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { subscription: { include: { tenant: true } } }
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        if (invoice.status === client_1.InvoiceStatus.PAID)
            return invoice;
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: client_1.InvoiceStatus.PAID,
                amountPaid: invoice.amountDue,
                amountRemaining: 0,
                paidAt: new Date(),
            }
        });
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
        await this.postToLedger(invoice);
        return { success: true, invoiceId };
    }
    async postToLedger(invoice) {
        const systemTenant = await this.prisma.tenant.findFirst({
            where: { type: client_1.TenantType.PROVIDER, isSystem: true }
        });
        if (!systemTenant) {
            this.logger.error('CRITICAL: System Tenant not found! Revenue lost in accounting.');
            return;
        }
        await this.prisma.ledgerEntry.createMany({
            data: [
                {
                    tenantId: systemTenant.id,
                    debitAccount: client_1.LedgerAccountType.CASH,
                    creditAccount: client_1.LedgerAccountType.REVENUE,
                    amount: invoice.amountDue,
                    currency: invoice.currency,
                    referenceId: invoice.id,
                    referenceType: 'INVOICE',
                    description: `Subscription Revenue: ${invoice.number} (${invoice.subscription.tenant.name})`
                }
            ]
        });
        this.logger.log(`✅ System Ledger Entry Created: +${invoice.amountDue} AZN for Provider`);
        await this.commissionService.processCommission(invoice.id, Number(invoice.amountDue), invoice.subscription.tenant.id);
    }
};
exports.BillingEngine = BillingEngine;
exports.BillingEngine = BillingEngine = BillingEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commission_service_1.CommissionService])
], BillingEngine);
//# sourceMappingURL=billing.engine.js.map