
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ITenantRepository } from '../domain/tenant.repository.interface';
import { DomainEventBus } from '../../../shared-kernel/event-bus/event-bus.service';
import { Tenant } from '../domain/tenant.entity';

@Injectable()
export class TenantsUseCase {
    private readonly logger = new Logger(TenantsUseCase.name);

    constructor(
        @Inject(ITenantRepository) private readonly repository: ITenantRepository,
        private readonly eventBus: DomainEventBus,
    ) { }

    async createTenant(name: string, email: string): Promise<Tenant> {
        this.logger.log(`Creating tenant: ${name}`);
        const id = crypto.randomUUID();
        const tenant = Tenant.create(id, name, email);

        await this.repository.save(tenant);
        this.eventBus.publishAll(tenant.domainEvents);
        tenant.clearEvents();

        return tenant;
    }

    async getAllTenants(): Promise<Tenant[]> {
        return this.repository.findAll();
    }
}
