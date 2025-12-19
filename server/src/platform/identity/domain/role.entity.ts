
import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';

export class Role extends AggregateRoot<Role> {
    constructor(
        public readonly id: string,
        public name: string,
        public permissions: string[], // Array of Permission IDs
        public tenantId: string | null, // null for System Roles? Or strict tenant isolation?
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {
        super();
    }
}
