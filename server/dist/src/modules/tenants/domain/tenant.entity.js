"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = exports.TenantCreatedEvent = void 0;
const aggregate_root_1 = require("../../../shared-kernel/base-entities/aggregate-root");
const domain_event_base_1 = require("../../../shared-kernel/event-bus/domain-event.base");
class TenantCreatedEvent extends domain_event_base_1.DomainEvent {
    payload;
    eventName = 'tenant.created';
    constructor(aggregateId, payload) {
        super(aggregateId, payload);
        this.payload = payload;
    }
}
exports.TenantCreatedEvent = TenantCreatedEvent;
class Tenant extends aggregate_root_1.AggregateRoot {
    id;
    name;
    slug;
    status;
    createdAt;
    updatedAt;
    constructor(id, name, slug, status, createdAt, updatedAt) {
        super();
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(id, name, email) {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const tenant = new Tenant(id, name, slug, 'PENDING', new Date(), new Date());
        tenant.addDomainEvent(new TenantCreatedEvent(id, { name, email }));
        return tenant;
    }
    suspend() {
        this.status = 'SUSPENDED';
    }
    activate() {
        this.status = 'ACTIVE';
    }
}
exports.Tenant = Tenant;
//# sourceMappingURL=tenant.entity.js.map