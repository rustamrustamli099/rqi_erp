import { IDomainEvent } from '../event-bus/domain-event.base';
export declare abstract class AggregateRoot<T> {
    private _domainEvents;
    get domainEvents(): IDomainEvent[];
    protected addDomainEvent(event: IDomainEvent): void;
    clearEvents(): void;
}
