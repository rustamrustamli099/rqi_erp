import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';
import { IPackagesService } from '../contract';

@Injectable()
export class PackagesUseCase implements IPackagesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.PackageCreateInput) {
        return this.prisma.package.create({ data });
    }

    async findAll() {
        const packages = await this.prisma.package.findMany({
            orderBy: { priceMonthly: 'asc' },
        });
        return packages.map(pkg => ({
            ...pkg,
            priceMonthly: pkg.priceMonthly.toNumber(),
            priceYearly: pkg.priceYearly.toNumber(),
        }));
    }

    async findOne(id: string) {
        const pkg = await this.prisma.package.findUnique({ where: { id } });
        if (!pkg) return null;
        return {
            ...pkg,
            priceMonthly: pkg.priceMonthly.toNumber(),
            priceYearly: pkg.priceYearly.toNumber(),
        };
    }

    async update(id: string, data: Prisma.PackageUpdateInput) {
        return this.prisma.package.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.package.delete({ where: { id } });
    }
}
