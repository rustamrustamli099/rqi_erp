"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const billing_usecase_1 = require("./application/billing.usecase");
const billing_event_listener_1 = require("./infrastructure/events/billing.event-listener");
const billing_cron_1 = require("./infrastructure/cron/billing.cron");
const billing_engine_1 = require("./application/billing.engine");
const commission_service_1 = require("./application/commission.service");
const prisma_service_1 = require("../../prisma.service");
const prisma_subscription_repository_1 = require("./infrastructure/prisma-subscription.repository");
const prisma_invoice_repository_1 = require("./infrastructure/prisma-invoice.repository");
const packages_module_1 = require("../packages/packages.module");
const billing_controller_1 = require("./api/billing.controller");
const finance_controller_1 = require("./api/finance.controller");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule,
            packages_module_1.PackagesModule
        ],
        controllers: [billing_controller_1.BillingController, finance_controller_1.FinanceController],
        providers: [
            billing_usecase_1.BillingUseCase,
            billing_event_listener_1.BillingEventListener,
            billing_cron_1.BillingCron,
            prisma_service_1.PrismaService,
            {
                provide: 'ISubscriptionRepository',
                useClass: prisma_subscription_repository_1.PrismaSubscriptionRepository,
            },
            {
                provide: 'IInvoiceRepository',
                useClass: prisma_invoice_repository_1.PrismaInvoiceRepository,
            },
            billing_engine_1.BillingEngine,
            commission_service_1.CommissionService
        ],
        exports: [billing_usecase_1.BillingUseCase, billing_engine_1.BillingEngine, commission_service_1.CommissionService],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map