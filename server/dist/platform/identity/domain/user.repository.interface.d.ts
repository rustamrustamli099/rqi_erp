import { User } from './user.entity';
export interface IUserRepository {
    save(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(tenantId: string): Promise<User[]>;
    updateRefreshToken(id: string, refreshToken: string): Promise<void>;
    findByIdWithPermissions(id: string): Promise<any>;
    enableMfa(id: string, secret: string): Promise<void>;
    assignRole(userId: string, roleId: string, tenantId?: string): Promise<void>;
    revokeRole(userId: string, roleId: string, tenantId?: string): Promise<void>;
}
export declare const IUserRepository: unique symbol;
