import { Branch } from './branch.entity';
export interface IBranchRepository {
    create(branch: Branch): Promise<Branch>;
    findAll(tenantId: string): Promise<Branch[]>;
    findById(id: string): Promise<Branch | null>;
    update(id: string, branch: Partial<Branch>): Promise<Branch>;
    delete(id: string): Promise<void>;
}
