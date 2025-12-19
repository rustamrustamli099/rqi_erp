"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
const aggregate_root_1 = require("../../../shared-kernel/base-entities/aggregate-root");
class Branch extends aggregate_root_1.AggregateRoot {
    id;
    tenantId;
    name;
    address;
    phone;
    createdAt;
    updatedAt;
    constructor(id, tenantId, name, address, phone, createdAt, updatedAt) {
        super();
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(tenantId, name, address, phone) {
        return new Branch(crypto.randomUUID(), tenantId, name, address || null, phone || null, new Date(), new Date());
    }
}
exports.Branch = Branch;
//# sourceMappingURL=branch.entity.js.map