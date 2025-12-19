import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';
export declare class Role extends AggregateRoot<Role> {
    readonly id: string;
    name: string;
    permissions: string[];
    tenantId: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, name: string, permissions: string[], tenantId: string | null, createdAt: Date, updatedAt: Date);
}
