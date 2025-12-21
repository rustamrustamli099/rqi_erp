import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';
export declare class Branch extends AggregateRoot<Branch> {
    readonly id: string;
    tenantId: string;
    name: string;
    address: string | null;
    phone: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, tenantId: string, name: string, address: string | null, phone: string | null, createdAt: Date, updatedAt: Date);
    static create(tenantId: string, name: string, address?: string, phone?: string): Branch;
}
