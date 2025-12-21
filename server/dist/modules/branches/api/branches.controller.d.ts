import { BranchesUseCase } from '../application/branches.usecase';
export declare class BranchesController {
    private readonly branchesUseCase;
    constructor(branchesUseCase: BranchesUseCase);
    create(req: any, body: any): Promise<import("../domain/branch.entity").Branch>;
    findAll(req: any): Promise<import("../domain/branch.entity").Branch[]>;
    findOne(id: string): Promise<import("../domain/branch.entity").Branch>;
    update(id: string, body: any): Promise<import("../domain/branch.entity").Branch>;
    remove(id: string): Promise<void>;
}
