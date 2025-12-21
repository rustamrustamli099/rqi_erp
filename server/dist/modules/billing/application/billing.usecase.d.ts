import type { ISubscriptionRepository } from '../domain/subscription.repository.interface';
import type { IInvoiceRepository } from '../domain/invoice.repository.interface';
import { Subscription } from '../domain/subscription.entity';
import { Invoice } from '../domain/invoice.entity';
import type { IPackagesService } from '../../packages/contract';
export declare class BillingUseCase {
    private readonly subscriptionRepository;
    private readonly invoiceRepository;
    private readonly packagesService;
    private readonly logger;
    constructor(subscriptionRepository: ISubscriptionRepository, invoiceRepository: IInvoiceRepository, packagesService: IPackagesService);
    getSubscription(tenantId: string): Promise<Subscription | null>;
    calculateMonthlyTotal(subscriptionId: string): Promise<number>;
    addSubscriptionItem(subscriptionId: string, name: string, type: string, price: number, quantity?: number): Promise<void>;
    createInvoice(subscriptionId: string, amount: number, description: string): Promise<Invoice>;
    processRecurringBilling(): Promise<{
        processed: number;
    }>;
}
