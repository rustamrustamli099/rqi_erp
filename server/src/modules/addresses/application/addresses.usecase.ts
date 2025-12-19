import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AddressesUseCase {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    // --- Countries ---
    async findAllCountries() {
        return this.prisma.country.findMany({
            include: {
                cities: {
                    include: {
                        districts: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async createCountry(data: Prisma.CountryCreateInput) {
        return this.prisma.country.create({ data });
    }

    async updateCountry(id: string, data: Prisma.CountryUpdateInput) {
        return this.prisma.country.update({ where: { id }, data });
    }

    async deleteCountry(id: string) {
        return this.prisma.country.delete({ where: { id } });
    }

    // --- Cities ---
    async createCity(data: Prisma.CityCreateInput) {
        return this.prisma.city.create({ data });
    }

    async updateCity(id: string, data: Prisma.CityUpdateInput) {
        return this.prisma.city.update({ where: { id }, data });
    }

    async deleteCity(id: string) {
        return this.prisma.city.delete({ where: { id } });
    }

    // --- Districts ---
    async createDistrict(data: Prisma.DistrictCreateInput) {
        return this.prisma.district.create({ data });
    }

    async updateDistrict(id: string, data: Prisma.DistrictUpdateInput) {
        return this.prisma.district.update({ where: { id }, data });
    }

    async deleteDistrict(id: string) {
        return this.prisma.district.delete({ where: { id } });
    }
}
