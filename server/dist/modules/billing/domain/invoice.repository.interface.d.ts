import { Invoice } from './invoice.entity';
export interface IInvoiceRepository {
    create(invoice: Invoice): Promise<Invoice>;
    findById(id: string): Promise<Invoice | null>;
    findBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
}
