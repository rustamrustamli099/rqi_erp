import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './platform/auth/auth.module';
import { IdentityModule } from './platform/identity/identity.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TenantMiddleware } from './platform/tenant-context/tenant-context.middleware';
import { SystemModule } from './platform/console/system.module';
import { IntegrationsModule } from './integrations/adapters/integrations.module';
import { DomainEventsModule } from './shared-kernel/event-bus/domain-events.module';
import { RedisModule } from './platform/redis/redis.module';
import { SchedulerModule } from './platform/scheduler/scheduler.module';
import { MaintenanceModule } from './platform/maintenance/maintenance.module';
import { AuditModule } from './system/audit/audit.module';
import { RetentionModule } from './platform/retention/retention.module';
import { MonitoringModule } from './platform/observability/monitoring.module';
import { MenusModule } from './modules/menus/menus.module';
import { PermissionsModule } from './modules/admin/iam/permissions/permissions.module';
import { RolesModule } from './modules/admin/iam/roles/roles.module';
import { RoleApprovalsModule } from './modules/admin/iam/role-approvals/role-approvals.module';
import { ApprovalsModule } from './modules/admin/iam/approvals/approvals.module';
import { FilesModule } from './modules/files/files.module';
import { PrismaService } from './prisma.service';
import { AddressesModule } from './modules/addresses/addresses.module';
import { MaintenanceGuard } from './platform/maintenance/maintenance.guard';
import { CustomThrottlerGuard } from './platform/auth/throttler.guard';
import { TenantContextGuard } from './platform/tenant-context/tenant-context.guard';
import { PermissionsGuard } from './platform/auth/permissions.guard';
import { PackagesModule } from './modules/packages/packages.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

import { PaymentModule } from './modules/payment/payment.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { WorkflowModule } from './platform/workflow/workflow.module';
import { NotificationsModule } from './platform/notifications/notifications.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available globally
      envFilePath: '.env',
    }),
    AuthModule,
    IdentityModule,
    TenantsModule,
    BranchesModule,
    AuditModule,
    DashboardModule,
    SystemModule,
    IntegrationsModule,
    DomainEventsModule,
    RedisModule,
    SchedulerModule,
    MaintenanceModule,
    AuditModule,
    RetentionModule,
    MonitoringModule,
    MenusModule,
    PermissionsModule,
    RolesModule,
    FilesModule,
    AddressesModule,
    PackagesModule,
    SubscriptionsModule,
    PaymentModule,
    ComplianceModule,
    RoleApprovalsModule,
    ApprovalsModule,
    WorkflowModule,
    NotificationsModule,
    ExportModule,
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        serializers: {
          req(req) {
            req.headers = { ...req.headers };
            delete req.headers['authorization']; // REDACT
            delete req.headers['cookie']; // REDACT
            return req;
          },
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
    {
      provide: APP_GUARD, // Runs after AuthGuard (if AuthGuard was global, but it's not). 
      // Important: This guard works best if Auth is checked first. 
      // Since AuthGuard is local to controllers, this Global Guard runs for ALL requests.
      // It blindly checks req.user. If req.user is missing (Public route), it passes.
      // If req.user is present (Protected route), it enforces context.
      useClass: TenantContextGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
