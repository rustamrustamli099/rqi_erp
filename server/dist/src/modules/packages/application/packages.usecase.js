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
exports.PackagesUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
let PackagesUseCase = class PackagesUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
    async findOne(id) {
        const pkg = await this.prisma.package.findUnique({ where: { id } });
        if (!pkg)
            return null;
        return {
            ...pkg,
            priceMonthly: pkg.priceMonthly.toNumber(),
            priceYearly: pkg.priceYearly.toNumber(),
        };
    }
    async update(id, data) {
        return this.prisma.package.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.package.delete({ where: { id } });
    }
};
exports.PackagesUseCase = PackagesUseCase;
exports.PackagesUseCase = PackagesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PackagesUseCase);
//# sourceMappingURL=packages.usecase.js.map