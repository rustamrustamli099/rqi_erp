"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
class DomainEvent {
    aggregateId;
    payload;
    eventId;
    version = 1;
    metadata;
    constructor(aggregateId, payload, metadata) {
        this.aggregateId = aggregateId;
        this.payload = payload;
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
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.base.js.map