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
exports.PrismaTenantRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const tenant_entity_1 = require("../domain/tenant.entity");
let PrismaTenantRepository = class PrismaTenantRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(tenant) {
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
    async findById(id) {
        const raw = await this.prisma.tenant.findUnique({ where: { id } });
        if (!raw)
            return null;
        return this.mapToDomain(raw);
    }
    async findAll() {
        const raw = await this.prisma.tenant.findMany();
        return raw.map(this.mapToDomain);
    }
    mapToDomain(raw) {
        return new tenant_entity_1.Tenant(raw.id, raw.name, raw.slug, raw.status, raw.createdAt, raw.updatedAt);
    }
};
exports.PrismaTenantRepository = PrismaTenantRepository;
exports.PrismaTenantRepository = PrismaTenantRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTenantRepository);
//# sourceMappingURL=prisma-tenant.repository.js.map