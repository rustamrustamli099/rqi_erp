
import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';

export class Invoice extends AggregateRoot<Invoice> {
    constructor(
        public readonly id: string,
        public subscriptionId: string,
        public number: string,
        public status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE',
        public amountDue: number,
        public amountPaid: number,
        public amountRemaining: number,
        public currency: string,
        public dueDate: Date,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {
        super();
    }

    static create(
        subscriptionId: string,
        amount: number,
        description: string // description is usually part of items, simplified for now
    ): Invoice {
        return new Invoice(
            crypto.randomUUID(), // Assuming Node 20
            subscriptionId,
            `INV-${Date.now()}`,
            'OPEN',
            amount,
            0,
            amount,
            'AZN',
            new Date(Date.now() + 86400000), // Due tomorrow
            new Date(),
            new Date(),
        );
    }
}
