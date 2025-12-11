import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { AuditModule } from './modules/audit/audit.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TenantMiddleware } from './common/middleware/tenant-context.middleware';
import { SystemModule } from './modules/system/system.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { MenusModule } from './modules/menus/menus.module';
import { FilesModule } from './modules/files/files.module';
import { PrismaService } from './prisma.service';
import { RolesModule } from './modules/roles/roles.module';
import { AddressesModule } from './modules/addresses/addresses.module';

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
    UsersModule,
    TenantsModule,
    BranchesModule,
    AuditModule,
    DashboardModule,
    SystemModule,
    IntegrationsModule,
    MenusModule,
    MenusModule,
    FilesModule,
    RolesModule,
    AddressesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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
