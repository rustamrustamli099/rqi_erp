"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./platform/auth/auth.module");
const identity_module_1 = require("./platform/identity/identity.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const branches_module_1 = require("./modules/branches/branches.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const tenant_context_middleware_1 = require("./platform/tenant-context/tenant-context.middleware");
const system_module_1 = require("./platform/console/system.module");
const integrations_module_1 = require("./integrations/adapters/integrations.module");
const domain_events_module_1 = require("./shared-kernel/event-bus/domain-events.module");
const redis_module_1 = require("./platform/redis/redis.module");
const scheduler_module_1 = require("./platform/scheduler/scheduler.module");
const maintenance_module_1 = require("./platform/maintenance/maintenance.module");
const audit_module_1 = require("./system/audit/audit.module");
const retention_module_1 = require("./platform/retention/retention.module");
const monitoring_module_1 = require("./platform/observability/monitoring.module");
const menus_module_1 = require("./modules/menus/menus.module");
const permissions_module_1 = require("./modules/admin/iam/permissions/permissions.module");
const roles_module_1 = require("./modules/admin/iam/roles/roles.module");
const role_approvals_module_1 = require("./modules/admin/iam/role-approvals/role-approvals.module");
const files_module_1 = require("./modules/files/files.module");
const prisma_service_1 = require("./prisma.service");
const addresses_module_1 = require("./modules/addresses/addresses.module");
const maintenance_guard_1 = require("./platform/maintenance/maintenance.guard");
const throttler_guard_1 = require("./platform/auth/throttler.guard");
const tenant_context_guard_1 = require("./platform/tenant-context/tenant-context.guard");
const permissions_guard_1 = require("./platform/auth/permissions.guard");
const packages_module_1 = require("./modules/packages/packages.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const payment_module_1 = require("./modules/payment/payment.module");
const compliance_module_1 = require("./modules/compliance/compliance.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(tenant_context_middleware_1.TenantMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            auth_module_1.AuthModule,
            identity_module_1.IdentityModule,
            tenants_module_1.TenantsModule,
            branches_module_1.BranchesModule,
            audit_module_1.AuditModule,
            dashboard_module_1.DashboardModule,
            system_module_1.SystemModule,
            integrations_module_1.IntegrationsModule,
            domain_events_module_1.DomainEventsModule,
            redis_module_1.RedisModule,
            scheduler_module_1.SchedulerModule,
            maintenance_module_1.MaintenanceModule,
            audit_module_1.AuditModule,
            retention_module_1.RetentionModule,
            monitoring_module_1.MonitoringModule,
            menus_module_1.MenusModule,
            permissions_module_1.PermissionsModule,
            roles_module_1.RolesModule,
            files_module_1.FilesModule,
            addresses_module_1.AddressesModule,
            packages_module_1.PackagesModule,
            subscriptions_module_1.SubscriptionsModule,
            payment_module_1.PaymentModule,
            compliance_module_1.ComplianceModule,
            role_approvals_module_1.RoleApprovalsModule,
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    customProps: (req, res) => ({
                        context: 'HTTP',
                    }),
                    transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
                    serializers: {
                        req(req) {
                            req.headers = { ...req.headers };
                            delete req.headers['authorization'];
                            delete req.headers['cookie'];
                            return req;
                        },
                    },
                },
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            prisma_service_1.PrismaService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_guard_1.CustomThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: maintenance_guard_1.MaintenanceGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_context_guard_1.TenantContextGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permissions_guard_1.PermissionsGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map