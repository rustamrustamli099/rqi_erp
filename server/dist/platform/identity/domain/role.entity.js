"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const aggregate_root_1 = require("../../../shared-kernel/base-entities/aggregate-root");
class Role extends aggregate_root_1.AggregateRoot {
    id;
    name;
    permissions;
    tenantId;
    createdAt;
    updatedAt;
    constructor(id, name, permissions, tenantId, createdAt, updatedAt) {
        super();
        this.id = id;
        this.name = name;
        this.permissions = permissions;
        this.tenantId = tenantId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Role = Role;
//# sourceMappingURL=role.entity.js.map