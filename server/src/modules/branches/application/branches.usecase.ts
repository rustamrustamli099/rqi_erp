import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IBranchRepository } from '../domain/branch.repository.interface';
import { Branch } from '../domain/branch.entity';
import { DomainEventBus } from '../../../shared-kernel/event-bus/event-bus.service';

@Injectable()
export class BranchesUseCase {
    constructor(
        @Inject('IBranchRepository')
        private readonly branchRepository: IBranchRepository,
        private readonly eventBus: DomainEventBus
    ) { }

    async create(tenantId: string, name: string, address?: string, phone?: string): Promise<Branch> {
        const branch = Branch.create(tenantId, name, address, phone);
        return this.branchRepository.create(branch);
    }

    async findAll(tenantId: string): Promise<Branch[]> {
        return this.branchRepository.findAll(tenantId);
    }

    async findOne(id: string): Promise<Branch> {
        const branch = await this.branchRepository.findById(id);
        if (!branch) throw new NotFoundException('Branch not found');
        return branch;
    }

    // Secure update: Ensure branch belongs to tenant?
    // In strict DDD, repo should check or Service should check. 
    // For now, simple ID check. But ideally we pass tenantId too to findOne.
    async update(id: string, data: Partial<Branch>): Promise<Branch> {
        const branch = await this.branchRepository.findById(id);
        if (!branch) throw new NotFoundException('Branch not found');

        // TODO: Validate tenant ownership here if tenantId is passed
        return this.branchRepository.update(id, data);
    }

    async remove(id: string): Promise<void> {
        return this.branchRepository.delete(id);
    }
}
