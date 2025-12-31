import { PrismaService } from '../../../prisma.service';
import { ITenantRepository } from '../domain/tenant.repository.interface';
import { Tenant } from '../domain/tenant.entity';
export declare class PrismaTenantRepository implements ITenantRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    save(tenant: Tenant): Promise<void>;
    findById(id: string): Promise<Tenant | null>;
    findAll(): Promise<Tenant[]>;
    private mapToDomain;
}
