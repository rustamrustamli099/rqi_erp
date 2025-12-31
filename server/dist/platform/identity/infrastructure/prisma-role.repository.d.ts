import { PrismaService } from '../../../prisma.service';
import { IRoleRepository } from '../domain/role.repository.interface';
import { Role } from '../domain/role.entity';
export declare class PrismaRoleRepository implements IRoleRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    save(role: Role): Promise<void>;
    findById(id: string): Promise<Role | null>;
    findAll(tenantId: string): Promise<Role[]>;
    private mapToDomain;
}
