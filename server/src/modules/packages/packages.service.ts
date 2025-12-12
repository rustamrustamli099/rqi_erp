import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PackagesService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.PackageCreateInput) {
        return this.prisma.package.create({ data });
    }

    async findAll() {
        return this.prisma.package.findMany({
            orderBy: { priceMonthly: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.package.findUnique({ where: { id } });
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
