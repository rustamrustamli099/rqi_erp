import { TenantsUseCase } from '../application/tenants.usecase';
export declare class TenantsController {
    private readonly tenantsUseCase;
    constructor(tenantsUseCase: TenantsUseCase);
    create(body: {
        name: string;
        email: string;
    }): Promise<import("../domain/tenant.entity").Tenant>;
    findAll(): Promise<import("../domain/tenant.entity").Tenant[]>;
}
