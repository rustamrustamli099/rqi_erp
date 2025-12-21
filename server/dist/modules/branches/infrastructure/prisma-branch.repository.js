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
exports.PrismaBranchRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const branch_entity_1 = require("../domain/branch.entity");
let PrismaBranchRepository = class PrismaBranchRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(branch) {
        const created = await this.prisma.branch.create({
            data: {
                tenantId: branch.tenantId,
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
            }
        });
        return this.mapToDomain(created);
    }
    async findAll(tenantId) {
        const rows = await this.prisma.branch.findMany({ where: { tenantId } });
        return rows.map(this.mapToDomain);
    }
    async findById(id) {
        const row = await this.prisma.branch.findUnique({ where: { id } });
        if (!row)
            return null;
        return this.mapToDomain(row);
    }
    async update(id, data) {
        const updateData = {
            name: data.name,
            address: data.address,
            phone: data.phone
        };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        const updated = await this.prisma.branch.update({
            where: { id },
            data: updateData
        });
        return this.mapToDomain(updated);
    }
    async delete(id) {
        await this.prisma.branch.delete({ where: { id } });
    }
    mapToDomain(row) {
        return new branch_entity_1.Branch(row.id, row.tenantId, row.name, row.address, row.phone, row.createdAt, row.updatedAt);
    }
};
exports.PrismaBranchRepository = PrismaBranchRepository;
exports.PrismaBranchRepository = PrismaBranchRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaBranchRepository);
//# sourceMappingURL=prisma-branch.repository.js.map