"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaInvoiceRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const invoice_entity_1 = require("../domain/invoice.entity");
const client_1 = require("@prisma/client");
let PrismaInvoiceRepository = class PrismaInvoiceRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(invoice) {
        const created = await this.prisma.invoice.create({
            data: {
                id: invoice.id,
                subscriptionId: invoice.subscriptionId,
                number: invoice.number,
                status: invoice.status,
                amountDue: new client_1.Prisma.Decimal(invoice.amountDue),
                amountPaid: new client_1.Prisma.Decimal(invoice.amountPaid),
                amountRemaining: new client_1.Prisma.Decimal(invoice.amountRemaining),
                currency: invoice.currency,
                dueDate: invoice.dueDate,
            }
        });
        return this.mapToDomain(created);
    }
    async findById(id) {
        const row = await this.prisma.invoice.findUnique({ where: { id } });
        if (!row)
            return null;
        return this.mapToDomain(row);
    }
    async findBySubscriptionId(subscriptionId) {
        const rows = await this.prisma.invoice.findMany({ where: { subscriptionId } });
        return rows.map(this.mapToDomain);
    }
    mapToDomain(row) {
        return new invoice_entity_1.Invoice(row.id, row.subscriptionId, row.number, row.status, Number(row.amountDue), Number(row.amountPaid), Number(row.amountRemaining), row.currency, row.dueDate, row.createdAt, row.updatedAt);
    }
};
exports.PrismaInvoiceRepository = PrismaInvoiceRepository;
exports.PrismaInvoiceRepository = PrismaInvoiceRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaInvoiceRepository);
//# sourceMappingURL=prisma-invoice.repository.js.map