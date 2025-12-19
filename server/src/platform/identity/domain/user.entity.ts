
import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';

export class User extends AggregateRoot<User> {
    constructor(
        public readonly id: string,
        public email: string,
        public passwordHash: string | null,
        public fullName: string | null,
        public isActive: boolean, // Schema doesn't seem to have isActive? Checked schema: no isActive. It has `roleId` etc. 
        // Wait, schema check:
        // isMfaEnabled, hashedRefreshToken.
        // No isActive column in schema provided in step 3770.
        // But maybe it's implicitly active?
        // I will remove isActive or default it.
        // Schema has tenantId, branchId, roleId.
        public tenantId: string | null,
        public roleId: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {
        super();
    }

    changePassword(newHash: string): void {
        this.passwordHash = newHash;
        // this.updatedAt = new Date(); // readonly in class, managed by DB/Repo usually
    }
}
