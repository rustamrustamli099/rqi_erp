
import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';
import { IDomainEvent, DomainEvent } from '../../../shared-kernel/event-bus/domain-event.base';

export class TenantCreatedEvent extends DomainEvent {
    readonly eventName = 'tenant.created';
    constructor(aggregateId: string, public readonly payload: { name: string; email: string }) {
        super(aggregateId, payload);
    }
}

export class Tenant extends AggregateRoot<Tenant> {
    constructor(
        public readonly id: string,
        public name: string,
        public slug: string,
        public status: 'ACTIVE' | 'SUSPENDED' | 'PENDING',
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {
        super();
    }

    static create(id: string, name: string, email: string): Tenant {
        // Simple slug generation
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const tenant = new Tenant(id, name, slug, 'PENDING', new Date(), new Date());

        // Ensure this method is accessible or casting is handled if protected issue persists
        // But extending AggregateRoot should make it available to the class methods.
        (tenant as any).addDomainEvent(new TenantCreatedEvent(id, { name, email }));

        return tenant;
    }

    suspend(): void {
        this.status = 'SUSPENDED';
        // Add suspended event if needed
    }

    activate(): void {
        this.status = 'ACTIVE';
    }
}
