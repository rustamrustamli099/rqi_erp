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
var BillingCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const billing_usecase_1 = require("../../application/billing.usecase");
let BillingCron = BillingCron_1 = class BillingCron {
    billingUseCase;
    logger = new common_1.Logger(BillingCron_1.name);
    constructor(billingUseCase) {
        this.billingUseCase = billingUseCase;
    }
    async handleDailyBilling() {
        this.logger.log('Running daily billing cron...');
        try {
            await this.billingUseCase.processRecurringBilling();
            this.logger.log('Daily billing cycle complete.');
        }
        catch (error) {
            this.logger.error('Critical failure in billing cycle', error.stack);
        }
    }
};
exports.BillingCron = BillingCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingCron.prototype, "handleDailyBilling", null);
exports.BillingCron = BillingCron = BillingCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [billing_usecase_1.BillingUseCase])
], BillingCron);
//# sourceMappingURL=billing.cron.js.map