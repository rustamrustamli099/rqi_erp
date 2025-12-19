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
export declare abstract class DomainEvent implements IDomainEvent {
    readonly aggregateId: string;
    readonly payload: any;
    readonly eventId: string;
    readonly version: number;
    readonly metadata: DomainEventMetadata;
    abstract readonly eventName: string;
    constructor(aggregateId: string, payload: any, metadata?: Partial<DomainEventMetadata>);
}
