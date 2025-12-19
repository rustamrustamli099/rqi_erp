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
exports.PrismaSubscriptionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const subscription_entity_1 = require("../domain/subscription.entity");
const client_1 = require("@prisma/client");
let PrismaSubscriptionRepository = class PrismaSubscriptionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.subscription.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!row)
            return null;
        return this.mapToDomain(row);
    }
    async findByTenantId(tenantId) {
        const row = await this.prisma.subscription.findUnique({
            where: { tenantId },
            include: { items: true }
        });
        if (!row)
            return null;
        return this.mapToDomain(row);
    }
    async findDueSubscriptions(date) {
        const rows = await this.prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                nextBillingDate: { lte: date }
            },
            include: { items: true }
        });
        return rows.map(r => this.mapToDomain(r));
    }
    async save(subscription) {
        await this.prisma.subscription.upsert({
            where: { id: subscription.id },
            update: {
                nextBillingDate: subscription.nextBillingDate,
                status: subscription.status,
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
    async update(id, data) {
        await this.prisma.subscription.update({
            where: { id },
            data: {
                nextBillingDate: data.nextBillingDate,
                status: data.status,
            }
        });
    }
    async addSubscriptionItem(subscriptionId, item) {
        await this.prisma.subscriptionItem.create({
            data: {
                subscriptionId,
                name: item.name,
                type: item.type,
                quantity: item.quantity,
                unitPrice: new client_1.Prisma.Decimal(item.unitPrice)
            }
        });
    }
    mapToDomain(row) {
        const items = (row.items || []).map((i) => new subscription_entity_1.SubscriptionItem(i.id, i.name, i.type, i.quantity, Number(i.unitPrice)));
        return new subscription_entity_1.Subscription(row.id, row.tenantId, row.packageId, row.status, row.billingCycle, row.nextBillingDate, items, row.createdAt, row.updatedAt);
    }
};
exports.PrismaSubscriptionRepository = PrismaSubscriptionRepository;
exports.PrismaSubscriptionRepository = PrismaSubscriptionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSubscriptionRepository);
//# sourceMappingURL=prisma-subscription.repository.js.map