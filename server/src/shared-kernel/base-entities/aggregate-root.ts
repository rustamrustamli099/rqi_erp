
import { IDomainEvent } from '../event-bus/domain-event.base';

export abstract class AggregateRoot<T> {
    private _domainEvents: IDomainEvent[] = [];

    get domainEvents(): IDomainEvent[] {
        return this._domainEvents;
    }

    protected addDomainEvent(event: IDomainEvent): void {
        this._domainEvents.push(event);
    }

    public clearEvents(): void {
        this._domainEvents = [];
    }
}
