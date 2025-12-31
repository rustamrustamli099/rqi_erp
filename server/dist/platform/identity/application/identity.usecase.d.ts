import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
export declare class IdentityUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    findUserByEmail(email: string): Promise<User | null>;
    findAllUsers(tenantId: string): Promise<User[]>;
    findUserById(id: string): Promise<User | null>;
    findUserWithPermissions(id: string): Promise<any>;
    updateRefreshToken(id: string, refreshToken: string): Promise<void>;
    enableMfa(id: string, secret: string): Promise<void>;
    createUser(data: any): Promise<User>;
    assignRole(userId: string, roleId: string, tenantId?: string): Promise<void>;
    revokeRole(userId: string, roleId: string, tenantId?: string): Promise<void>;
}
