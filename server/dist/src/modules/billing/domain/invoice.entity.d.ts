import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';
export declare class Invoice extends AggregateRoot<Invoice> {
    readonly id: string;
    subscriptionId: string;
    number: string;
    status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';
    amountDue: number;
    amountPaid: number;
    amountRemaining: number;
    currency: string;
    dueDate: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, subscriptionId: string, number: string, status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE', amountDue: number, amountPaid: number, amountRemaining: number, currency: string, dueDate: Date, createdAt: Date, updatedAt: Date);
    static create(subscriptionId: string, amount: number, description: string): Invoice;
}
