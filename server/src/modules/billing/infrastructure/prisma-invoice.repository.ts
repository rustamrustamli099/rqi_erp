
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { IInvoiceRepository } from '../domain/invoice.repository.interface';
import { Invoice } from '../domain/invoice.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaInvoiceRepository implements IInvoiceRepository {
    constructor(private prisma: PrismaService) { }

    async create(invoice: Invoice): Promise<Invoice> {
        const created = await this.prisma.invoice.create({
            data: {
                id: invoice.id,
                subscriptionId: invoice.subscriptionId,
                number: invoice.number,
                status: invoice.status,
                amountDue: new Prisma.Decimal(invoice.amountDue),
                amountPaid: new Prisma.Decimal(invoice.amountPaid),
                amountRemaining: new Prisma.Decimal(invoice.amountRemaining),
                currency: invoice.currency,
                dueDate: invoice.dueDate,
                // items: ... stored as JSON?
            }
        });
        return this.mapToDomain(created);
    }

    async findById(id: string): Promise<Invoice | null> {
        const row = await this.prisma.invoice.findUnique({ where: { id } });
        if (!row) return null;
        return this.mapToDomain(row);
    }

    async findBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
        const rows = await this.prisma.invoice.findMany({ where: { subscriptionId } });
        return rows.map(this.mapToDomain);
    }

    private mapToDomain(row: any): Invoice {
        return new Invoice(
            row.id,
            row.subscriptionId,
            row.number,
            row.status,
            Number(row.amountDue),
            Number(row.amountPaid),
            Number(row.amountRemaining),
            row.currency,
            row.dueDate,
            row.createdAt,
            row.updatedAt
        );
    }
}
