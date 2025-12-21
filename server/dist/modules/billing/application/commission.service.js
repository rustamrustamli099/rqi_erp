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
var CommissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let CommissionService = CommissionService_1 = class CommissionService {
    prisma;
    logger = new common_1.Logger(CommissionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processCommission(invoiceId, amount, tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { parentTenant: { include: { resellerProfile: true } } }
        });
        if (!tenant || !tenant.parentTenant || !tenant.parentTenant.resellerProfile) {
            this.logger.log(`Tenant ${tenantId} is direct customer. No commission split.`);
            return;
        }
        const reseller = tenant.parentTenant;
        const profile = reseller.resellerProfile;
        const commissionRate = Number(profile.commissionRate) / 100;
        const commissionAmount = amount * commissionRate;
        const systemAmount = amount - commissionAmount;
        this.logger.log(`Processing Commission for Reseller ${reseller.id}: Rate ${profile.commissionRate}%, Earned: ${commissionAmount}`);
        await this.prisma.resellerProfile.update({
            where: { id: profile.id },
            data: {
                totalRevenue: { increment: amount },
                totalCommission: { increment: commissionAmount }
            }
        });
        await this.prisma.ledgerEntry.create({
            data: {
                tenantId: reseller.id,
                debitAccount: 'CASH',
                creditAccount: 'REVENUE',
                amount: new library_1.Decimal(commissionAmount),
                currency: 'AZN',
            }
        });
    }
};
exports.CommissionService = CommissionService;
exports.CommissionService = CommissionService = CommissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionService);
//# sourceMappingURL=commission.service.js.map