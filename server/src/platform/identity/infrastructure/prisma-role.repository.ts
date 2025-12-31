
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { IRoleRepository } from '../domain/role.repository.interface';
import { Role } from '../domain/role.entity';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(role: Role): Promise<void> {
        // Implementation for Role save
        await this.prisma.role.upsert({
            where: { id: role.id },
            update: {
                name: role.name,
                // permissions logic to be mapped
            },
            create: {
                id: role.id,
                name: role.name,
                tenantId: role.tenantId || 'system', // fallback
                // permissions logic
            }
        });
    }

    async findById(id: string): Promise<Role | null> {
        const raw = await this.prisma.role.findUnique({ where: { id }, include: { permissions: true } });
        if (!raw) return null;
        return this.mapToDomain(raw);
    }

    async findAll(tenantId: string): Promise<Role[]> {
        const raw = await this.prisma.role.findMany({ where: { tenantId }, include: { permissions: true } });
        return raw.map(this.mapToDomain);
    }

    private mapToDomain(raw: any): Role {
        // Map permissions array from relation
        return new Role(
            raw.id,
            raw.name,
            raw.permissions?.map((p: any) => p.name) || [],
            raw.tenantId,
            raw.createdAt,
            raw.updatedAt
        );
    }
}
