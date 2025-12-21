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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
let SubscriptionsUseCase = class SubscriptionsUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSubscriptionDto) {
        const existing = await this.prisma.subscription.findUnique({
            where: { tenantId: createSubscriptionDto.tenantId }
        });
        if (existing && existing.status === 'ACTIVE') {
            throw new common_1.BadRequestException('Tenant already has an active subscription');
        }
        const pkg = await this.prisma.package.findUnique({ where: { id: createSubscriptionDto.packageId } });
        if (!pkg)
            throw new common_1.BadRequestException('Package not found');
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        return this.prisma.subscription.upsert({
            where: { tenantId: createSubscriptionDto.tenantId },
            update: {
                packageId: createSubscriptionDto.packageId,
                status: 'ACTIVE',
                startDate: new Date(),
                nextBillingDate: nextBilling,
                endDate: null
            },
            create: {
                tenantId: createSubscriptionDto.tenantId,
                packageId: createSubscriptionDto.packageId,
                status: 'ACTIVE',
                startDate: new Date(),
                nextBillingDate: nextBilling,
                billingCycle: 'MONTHLY'
            }
        });
    }
    async findAll() {
        return this.prisma.subscription.findMany({
            include: {
                tenant: { select: { name: true, slug: true } },
                package: { select: { name: true, priceMonthly: true, currency: true } }
            }
        });
    }
    async findOne(id) {
        return this.prisma.subscription.findUnique({
            where: { id },
            include: {
                tenant: true,
                package: true,
                invoices: true
            }
        });
    }
    async remove(id) {
        return this.prisma.subscription.update({
            where: { id },
            data: { status: 'CANCELED', endDate: new Date() }
        });
    }
};
exports.SubscriptionsUseCase = SubscriptionsUseCase;
exports.SubscriptionsUseCase = SubscriptionsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsUseCase);
//# sourceMappingURL=subscriptions.usecase.js.map