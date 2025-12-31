
import { Role } from './role.entity';

export interface IRoleRepository {
    save(role: Role): Promise<void>;
    findById(id: string): Promise<Role | null>;
    findAll(tenantId: string): Promise<Role[]>;
}

export const IRoleRepository = Symbol('IRoleRepository');
