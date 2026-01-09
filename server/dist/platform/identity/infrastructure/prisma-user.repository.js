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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const user_entity_1 = require("../domain/user.entity");
let PrismaUserRepository = class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(user) {
        await this.prisma.user.upsert({
            where: { id: user.id },
            update: {
                email: user.email,
                password: user.passwordHash || '',
                fullName: user.fullName,
                tenantId: user.tenantId,
            },
            create: {
                id: user.id,
                email: user.email,
                password: user.passwordHash || '',
                fullName: user.fullName,
                tenantId: user.tenantId,
            }
        });
    }
    async findById(id) {
        const raw = await this.prisma.user.findUnique({ where: { id } });
        if (!raw)
            return null;
        return this.mapToDomain(raw);
    }
    async findByEmail(email) {
        const raw = await this.prisma.user.findUnique({ where: { email } });
        if (!raw)
            return null;
        return this.mapToDomain(raw);
    }
    async findAll(tenantId) {
        const raw = await this.prisma.user.findMany({ where: { tenantId } });
        return raw.map(this.mapToDomain);
    }
    mapToDomain(raw) {
        return new user_entity_1.User(raw.id, raw.email, raw.password, raw.fullName || raw.name, true, raw.tenantId, raw.createdAt, raw.updatedAt);
    }
    async updateRefreshToken(id, hashedRefreshToken) {
        await this.prisma.user.update({
            where: { id },
            data: { hashedRefreshToken }
        });
    }
    async enableMfa(id, secret) {
        await this.prisma.user.update({
            where: { id },
            data: {
                mfaSecret: secret,
                isMfaEnabled: true
            }
        });
    }
    async findByIdWithPermissions(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: { include: { permission: true } }
                            }
                        }
                    }
                }
            }
        });
    }
    async assignRole(userId, roleId, tenantId) {
        await this.prisma.userRole.upsert({
            where: {
                userId_roleId_tenantId: {
                    userId,
                    roleId,
                    tenantId: (tenantId || null)
                }
            },
            update: {},
            create: {
                userId,
                roleId,
                tenantId: tenantId || null,
                assignedBy: 'SYSTEM'
            }
        });
    }
    async revokeRole(userId, roleId, tenantId) {
        try {
            await this.prisma.userRole.delete({
                where: {
                    userId_roleId_tenantId: {
                        userId,
                        roleId,
                        tenantId: (tenantId || null)
                    }
                }
            });
        }
        catch (e) {
        }
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map