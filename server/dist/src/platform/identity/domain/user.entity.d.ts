import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';
export declare class User extends AggregateRoot<User> {
    readonly id: string;
    email: string;
    passwordHash: string | null;
    fullName: string | null;
    isActive: boolean;
    isOwner: boolean;
    tenantId: string | null;
    roleId: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, email: string, passwordHash: string | null, fullName: string | null, isActive: boolean, isOwner: boolean, tenantId: string | null, roleId: string | null, createdAt: Date, updatedAt: Date);
    changePassword(newHash: string): void;
}
