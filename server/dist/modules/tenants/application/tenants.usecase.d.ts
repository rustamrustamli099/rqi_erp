import { ITenantRepository } from '../domain/tenant.repository.interface';
import { DomainEventBus } from '../../../shared-kernel/event-bus/event-bus.service';
import { Tenant } from '../domain/tenant.entity';
export declare class TenantsUseCase {
    private readonly repository;
    private readonly eventBus;
    private readonly logger;
    constructor(repository: ITenantRepository, eventBus: DomainEventBus);
    createTenant(name: string, email: string): Promise<Tenant>;
    getAllTenants(): Promise<Tenant[]>;
}
