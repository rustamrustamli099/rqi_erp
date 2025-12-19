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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BillingUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingUseCase = void 0;
const common_1 = require("@nestjs/common");
const invoice_entity_1 = require("../domain/invoice.entity");
let BillingUseCase = BillingUseCase_1 = class BillingUseCase {
    subscriptionRepository;
    invoiceRepository;
    packagesService;
    logger = new common_1.Logger(BillingUseCase_1.name);
    constructor(subscriptionRepository, invoiceRepository, packagesService) {
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
        this.packagesService = packagesService;
    }
    async getSubscription(tenantId) {
        return this.subscriptionRepository.findByTenantId(tenantId);
    }
    async calculateMonthlyTotal(subscriptionId) {
        const sub = await this.subscriptionRepository.findById(subscriptionId);
        if (!sub)
            throw new common_1.BadRequestException("Subscription not found");
        const pkg = await this.packagesService.findOne(sub.packageId);
        if (!pkg)
            throw new common_1.BadRequestException("Package configuration missing");
        let total = Number(pkg.priceMonthly);
        for (const item of sub.items) {
            total += Number(item.unitPrice) * item.quantity;
        }
        return total;
    }
    async addSubscriptionItem(subscriptionId, name, type, price, quantity = 1) {
        const sub = await this.subscriptionRepository.findById(subscriptionId);
        if (!sub)
            throw new common_1.BadRequestException("Subscription not found");
        const now = new Date();
        const nextBill = new Date(sub.nextBillingDate);
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysRemaining = Math.max(0, Math.ceil((nextBill.getTime() - now.getTime()) / msPerDay));
        const proratedAmount = (price / 30) * daysRemaining * quantity;
        await this.subscriptionRepository.addSubscriptionItem(subscriptionId, {
            name, type, quantity, unitPrice: price
        });
        if (proratedAmount > 0) {
            await this.createInvoice(subscriptionId, proratedAmount, `Prorated charge for ${name}`);
        }
        this.logger.log(`Added item ${name} to subscription ${subscriptionId}`);
    }
    async createInvoice(subscriptionId, amount, description) {
        const invoice = invoice_entity_1.Invoice.create(subscriptionId, amount, description);
        return this.invoiceRepository.create(invoice);
    }
    async processRecurringBilling() {
        const today = new Date();
        const dueSubs = await this.subscriptionRepository.findDueSubscriptions(today);
        let processed = 0;
        for (const sub of dueSubs) {
            try {
                const total = await this.calculateMonthlyTotal(sub.id);
                await this.createInvoice(sub.id, total, "Monthly Subscription Renewal");
                const nextDate = new Date(sub.nextBillingDate);
                nextDate.setMonth(nextDate.getMonth() + 1);
                await this.subscriptionRepository.update(sub.id, {
                    nextBillingDate: nextDate
                });
                processed++;
            }
            catch (err) {
                this.logger.error(`Failed to process billing for subscription ${sub.id}`, err.stack);
            }
        }
        return { processed };
    }
};
exports.BillingUseCase = BillingUseCase;
exports.BillingUseCase = BillingUseCase = BillingUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ISubscriptionRepository')),
    __param(1, (0, common_1.Inject)('IInvoiceRepository')),
    __param(2, (0, common_1.Inject)('IPackagesService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], BillingUseCase);
//# sourceMappingURL=billing.usecase.js.map