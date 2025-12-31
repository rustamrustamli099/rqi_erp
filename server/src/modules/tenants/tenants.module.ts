import { Module } from '@nestjs/common';
import { TenantsController } from './api/tenants.controller';
import { TenantsUseCase } from './application/tenants.usecase';
import { PrismaService } from '../../prisma.service';
import { PrismaTenantRepository } from './infrastructure/prisma-tenant.repository';
import { ITenantRepository } from './domain/tenant.repository.interface';
import { DomainEventsModule } from '../../shared-kernel/event-bus/domain-events.module';

@Module({
    imports: [DomainEventsModule],
    controllers: [TenantsController],
    providers: [
        TenantsUseCase,
        PrismaService,
        {
            provide: ITenantRepository,
            useClass: PrismaTenantRepository,
        },
    ],
    exports: [TenantsUseCase],
})
export class TenantsModule { }
