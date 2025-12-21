"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressesUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
let AddressesUseCase = class AddressesUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async createCountry(data) {
        return this.prisma.country.create({ data });
    }
    async updateCountry(id, data) {
        return this.prisma.country.update({ where: { id }, data });
    }
    async deleteCountry(id) {
        return this.prisma.country.delete({ where: { id } });
    }
    async createCity(data) {
        return this.prisma.city.create({ data });
    }
    async updateCity(id, data) {
        return this.prisma.city.update({ where: { id }, data });
    }
    async deleteCity(id) {
        return this.prisma.city.delete({ where: { id } });
    }
    async createDistrict(data) {
        return this.prisma.district.create({ data });
    }
    async updateDistrict(id, data) {
        return this.prisma.district.update({ where: { id }, data });
    }
    async deleteDistrict(id) {
        return this.prisma.district.delete({ where: { id } });
    }
};
exports.AddressesUseCase = AddressesUseCase;
exports.AddressesUseCase = AddressesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddressesUseCase);
//# sourceMappingURL=addresses.usecase.js.map