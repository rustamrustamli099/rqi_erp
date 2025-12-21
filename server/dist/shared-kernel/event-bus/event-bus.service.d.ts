import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDomainEvent } from './domain-event.base';
export declare class DomainEventBus {
    private readonly eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    publish(event: IDomainEvent): void;
    publishAll(events: IDomainEvent[]): void;
}
