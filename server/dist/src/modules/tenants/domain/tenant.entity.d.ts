import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';
import { DomainEvent } from '../../../shared-kernel/event-bus/domain-event.base';
export declare class TenantCreatedEvent extends DomainEvent {
    readonly payload: {
        name: string;
        email: string;
    };
    readonly eventName = "tenant.created";
    constructor(aggregateId: string, payload: {
        name: string;
        email: string;
    });
}
export declare class Tenant extends AggregateRoot<Tenant> {
    readonly id: string;
    name: string;
    slug: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, name: string, slug: string, status: 'ACTIVE' | 'SUSPENDED' | 'PENDING', createdAt: Date, updatedAt: Date);
    static create(id: string, name: string, email: string): Tenant;
    suspend(): void;
    activate(): void;
}
