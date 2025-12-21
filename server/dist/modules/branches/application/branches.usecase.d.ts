import type { IBranchRepository } from '../domain/branch.repository.interface';
import { Branch } from '../domain/branch.entity';
import { DomainEventBus } from '../../../shared-kernel/event-bus/event-bus.service';
export declare class BranchesUseCase {
    private readonly branchRepository;
    private readonly eventBus;
    constructor(branchRepository: IBranchRepository, eventBus: DomainEventBus);
    create(tenantId: string, name: string, address?: string, phone?: string): Promise<Branch>;
    findAll(tenantId: string): Promise<Branch[]>;
    findOne(id: string): Promise<Branch>;
    update(id: string, data: Partial<Branch>): Promise<Branch>;
    remove(id: string): Promise<void>;
}
