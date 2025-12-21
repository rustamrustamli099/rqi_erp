import { PrismaService } from '../../../prisma.service';
import { IBranchRepository } from '../domain/branch.repository.interface';
import { Branch } from '../domain/branch.entity';
export declare class PrismaBranchRepository implements IBranchRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(branch: Branch): Promise<Branch>;
    findAll(tenantId: string): Promise<Branch[]>;
    findById(id: string): Promise<Branch | null>;
    update(id: string, data: Partial<Branch>): Promise<Branch>;
    delete(id: string): Promise<void>;
    private mapToDomain;
}
