import { PrismaService } from '../../../prisma.service';
import { IInvoiceRepository } from '../domain/invoice.repository.interface';
import { Invoice } from '../domain/invoice.entity';
export declare class PrismaInvoiceRepository implements IInvoiceRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(invoice: Invoice): Promise<Invoice>;
    findById(id: string): Promise<Invoice | null>;
    findBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
    private mapToDomain;
}
