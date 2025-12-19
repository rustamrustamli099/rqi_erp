
export interface DomainEventMetadata {
    tenantId?: string;
    userId?: string;
    traceId?: string;
    correlationId?: string;
    timestamp: Date;
}

export interface IDomainEvent {
    eventId: string;
    aggregateId: string;
    eventName: string;
    version: number;
    metadata: DomainEventMetadata;
    payload: any;
}

export abstract class DomainEvent implements IDomainEvent {
    public readonly eventId: string;
    public readonly version: number = 1;
    public readonly metadata: DomainEventMetadata;

    // Abstract property to force implementation
    public abstract readonly eventName: string;

    constructor(
        public readonly aggregateId: string,
        public readonly payload: any,
        metadata?: Partial<DomainEventMetadata>
    ) {
        this.eventId = crypto.randomUUID();
        this.metadata = {
            timestamp: new Date(),
            traceId: metadata?.traceId || crypto.randomUUID(),
            tenantId: metadata?.tenantId,
            userId: metadata?.userId,
            correlationId: metadata?.correlationId,
        };
    }
}
