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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const jwt_auth_guard_1 = require("../../../platform/auth/jwt-auth.guard");
const tenant_context_guard_1 = require("../../../platform/tenant-context/tenant-context.guard");
const tenant_context_decorator_1 = require("../../../platform/auth/decorators/tenant-context.decorator");
const client_1 = require("@prisma/client");
let FinanceController = class FinanceController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(context) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: context.tenantId }
        });
        if (!tenant || !tenant.isSystem || tenant.type !== client_1.TenantType.PROVIDER) {
            throw new common_1.UnauthorizedException('Access denied: Only System Provider can view Finance Dashboard.');
        }
        const revenue = await this.prisma.ledgerEntry.aggregate({
            where: {
                tenantId: tenant.id,
                creditAccount: client_1.LedgerAccountType.REVENUE
            },
            _sum: { amount: true }
        });
        const ar = await this.prisma.ledgerEntry.aggregate({
            where: {
                tenantId: tenant.id,
                debitAccount: client_1.LedgerAccountType.ACCOUNTS_RECEIVABLE
            },
            _sum: { amount: true }
        });
        const recentEntries = await this.prisma.ledgerEntry.findMany({
            where: { tenantId: tenant.id },
            orderBy: { postedAt: 'desc' },
            take: 10
        });
        return {
            stats: {
                totalRevenue: revenue._sum.amount || 0,
                accountsReceivable: ar._sum.amount || 0,
            },
            recentEntries
        };
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, tenant_context_decorator_1.TenantContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getDashboardStats", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('finance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_context_guard_1.TenantContextGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map