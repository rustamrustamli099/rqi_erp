
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { IBranchRepository } from '../domain/branch.repository.interface';
import { Branch } from '../domain/branch.entity';

@Injectable()
export class PrismaBranchRepository implements IBranchRepository {
    constructor(private prisma: PrismaService) { }

    async create(branch: Branch): Promise<Branch> {
        // We map Domain Entity to Prisma Input
        // Note: ID generation. If entity has ID, use it. If not, let DB.
        // Our Entity constructor has ID. Logic: We generate UUID here or let generic logic handle.
        // Let's assume we rely on Prisma default usually? 
        // But DDD says Entity must have ID.
        // Let's map fully.
        const created = await this.prisma.branch.create({
            data: {
                // id: branch.id, // Only if we generated it. 
                // Let's check schema. usually String @id @default(uuid()).
                // If we don't send ID, prisma generates.
                // We should return the RESULT which has the ID.
                tenantId: branch.tenantId,
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
            }
        });
        return this.mapToDomain(created);
    }

    async findAll(tenantId: string): Promise<Branch[]> {
        const rows = await this.prisma.branch.findMany({ where: { tenantId } });
        return rows.map(this.mapToDomain);
    }

    async findById(id: string): Promise<Branch | null> {
        const row = await this.prisma.branch.findUnique({ where: { id } });
        if (!row) return null;
        return this.mapToDomain(row);
    }

    async update(id: string, data: Partial<Branch>): Promise<Branch> {
        // Prune undefined
        const updateData: any = {
            name: data.name,
            address: data.address,
            phone: data.phone
        };
        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updated = await this.prisma.branch.update({
            where: { id },
            data: updateData
        });
        return this.mapToDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.branch.delete({ where: { id } });
    }

    private mapToDomain(row: any): Branch {
        return new Branch(
            row.id,
            row.tenantId,
            row.name,
            row.address,
            row.phone,
            row.createdAt,
            row.updatedAt
        );
    }
}
