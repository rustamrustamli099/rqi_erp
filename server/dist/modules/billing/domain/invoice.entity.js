"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const aggregate_root_1 = require("../../../shared-kernel/base-entities/aggregate-root");
class Invoice extends aggregate_root_1.AggregateRoot {
    id;
    subscriptionId;
    number;
    status;
    amountDue;
    amountPaid;
    amountRemaining;
    currency;
    dueDate;
    createdAt;
    updatedAt;
    constructor(id, subscriptionId, number, status, amountDue, amountPaid, amountRemaining, currency, dueDate, createdAt, updatedAt) {
        super();
        this.id = id;
        this.subscriptionId = subscriptionId;
        this.number = number;
        this.status = status;
        this.amountDue = amountDue;
        this.amountPaid = amountPaid;
        this.amountRemaining = amountRemaining;
        this.currency = currency;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(subscriptionId, amount, description) {
        return new Invoice(crypto.randomUUID(), subscriptionId, `INV-${Date.now()}`, 'OPEN', amount, 0, amount, 'AZN', new Date(Date.now() + 86400000), new Date(), new Date());
    }
}
exports.Invoice = Invoice;
//# sourceMappingURL=invoice.entity.js.map