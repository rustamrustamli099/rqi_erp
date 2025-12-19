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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_usecase_1 = require("../application/billing.usecase");
const jwt_auth_guard_1 = require("../../../platform/auth/jwt-auth.guard");
const tenant_context_guard_1 = require("../../../platform/tenant-context/tenant-context.guard");
let BillingController = class BillingController {
    billingUseCase;
    constructor(billingUseCase) {
        this.billingUseCase = billingUseCase;
    }
    async getMySubscription(req) {
        const sub = await this.billingUseCase.getSubscription(req.user.tenantId);
        if (!sub)
            throw new common_1.NotFoundException('No active subscription found for this tenant');
        const total = await this.billingUseCase.calculateMonthlyTotal(sub.id);
        return {
            ...sub,
            currentMonthlyTotal: total
        };
    }
    async addSubscriptionItem(req, body) {
        const sub = await this.billingUseCase.getSubscription(req.user.tenantId);
        if (!sub)
            throw new common_1.NotFoundException('No active subscription found');
        await this.billingUseCase.addSubscriptionItem(sub.id, body.name, body.type, body.price, body.quantity);
        return { success: true, message: 'Item added and prorated invoice generated if applicable.' };
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('subscription'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getMySubscription", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "addSubscriptionItem", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('billing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_context_guard_1.TenantContextGuard),
    __metadata("design:paramtypes", [billing_usecase_1.BillingUseCase])
], BillingController);
//# sourceMappingURL=billing.controller.js.map