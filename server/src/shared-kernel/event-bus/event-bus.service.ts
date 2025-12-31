import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDomainEvent } from './domain-event.base';

@Injectable()
export class DomainEventBus {
    private readonly logger = new Logger(DomainEventBus.name);

    constructor(private readonly eventEmitter: EventEmitter2) { }

    publish(event: IDomainEvent): void {
        this.logger.log(`Publishing event: ${event.eventName}`, {
            aggregateId: event.aggregateId,
            eventId: event.eventId,
            tenantId: event.metadata.tenantId,
            userId: event.metadata.userId,
            traceId: event.metadata.traceId,
        });
        this.eventEmitter.emit(event.eventName, event);
    }

    publishAll(events: IDomainEvent[]): void {
        events.forEach(event => this.publish(event));
    }
}
