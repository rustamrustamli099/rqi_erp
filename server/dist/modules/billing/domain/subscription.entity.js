"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionItem = exports.Subscription = void 0;
const aggregate_root_1 = require("../../../shared-kernel/base-entities/aggregate-root");
class Subscription extends aggregate_root_1.AggregateRoot {
    id;
    tenantId;
    packageId;
    status;
    billingCycle;
    nextBillingDate;
    items;
    createdAt;
    updatedAt;
    constructor(id, tenantId, packageId, status, billingCycle, nextBillingDate, items = [], createdAt, updatedAt) {
        super();
        this.id = id;
        this.tenantId = tenantId;
        this.packageId = packageId;
        this.status = status;
        this.billingCycle = billingCycle;
        this.nextBillingDate = nextBillingDate;
        this.items = items;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Subscription = Subscription;
class SubscriptionItem {
    id;
    name;
    type;
    quantity;
    unitPrice;
    constructor(id, name, type, quantity, unitPrice) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}
exports.SubscriptionItem = SubscriptionItem;
//# sourceMappingURL=subscription.entity.js.map