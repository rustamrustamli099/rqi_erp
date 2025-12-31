
import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ITenantRepository } from '../domain/tenant.repository.interface';
import { Tenant } from '../domain/tenant.entity';

@Injectable()
export class PrismaTenantRepository implements ITenantRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(tenant: Tenant): Promise<void> {
        // Map Domain Entity to Prisma Model
        await this.prisma.tenant.upsert({
            where: { id: tenant.id },
            update: {
                name: tenant.name,
                slug: tenant.slug, 
                status: tenant.status,
                updatedAt: new Date()
            },
            create: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                status: tenant.status,
                createdAt: tenant.createdAt,
            }
        });
    }

    async findById(id: string): Promise<Tenant | null> {
        const raw = await this.prisma.tenant.findUnique({ where: { id } });
        if (!raw) return null;
        return this.mapToDomain(raw);
    }

    async findAll(): Promise<Tenant[]> {
        const raw = await this.prisma.tenant.findMany();
        return raw.map(this.mapToDomain);
    }

    private mapToDomain(raw: any): Tenant {
        return new Tenant(
            raw.id,
            raw.name,
            raw.slug,
            raw.status as any,
            raw.createdAt,
            raw.updatedAt
        );
    }
}
