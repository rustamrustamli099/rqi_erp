import { PrismaService } from '../../../prisma.service';
import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
export declare class PrismaUserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    save(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(tenantId: string): Promise<User[]>;
    private mapToDomain;
    updateRefreshToken(id: string, hashedRefreshToken: string): Promise<void>;
    enableMfa(id: string, secret: string): Promise<void>;
    findByIdWithPermissions(id: string): Promise<any>;
    assignRole(userId: string, roleId: string, tenantId?: string): Promise<void>;
    revokeRole(userId: string, roleId: string, tenantId?: string): Promise<void>;
}
