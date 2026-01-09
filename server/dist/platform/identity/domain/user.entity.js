"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const aggregate_root_1 = require("../../../shared-kernel/base-entities/aggregate-root");
class User extends aggregate_root_1.AggregateRoot {
    id;
    email;
    passwordHash;
    fullName;
    isActive;
    tenantId;
    createdAt;
    updatedAt;
    constructor(id, email, passwordHash, fullName, isActive, tenantId, createdAt, updatedAt) {
        super();
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.isActive = isActive;
        this.tenantId = tenantId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    changePassword(newHash) {
        this.passwordHash = newHash;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map