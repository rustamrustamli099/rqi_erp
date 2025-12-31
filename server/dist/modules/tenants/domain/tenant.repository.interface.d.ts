import { Tenant } from './tenant.entity';
export interface ITenantRepository {
    save(tenant: Tenant): Promise<void>;
    findById(id: string): Promise<Tenant | null>;
    findAll(): Promise<Tenant[]>;
}
export declare const ITenantRepository: unique symbol;
