
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(user: User): Promise<void> {
        await this.prisma.user.upsert({
            where: { id: user.id },
            update: {
                email: user.email,
                password: user.passwordHash || '', // Schema is non-nullable password
                fullName: user.fullName,
                tenantId: user.tenantId,
                roleId: user.roleId,
                isOwner: user.isOwner,
            },
            create: {
                id: user.id,
                email: user.email,
                password: user.passwordHash || '',
                fullName: user.fullName,
                tenantId: user.tenantId,
                roleId: user.roleId,
                isOwner: user.isOwner,
            }
        });
    }

    async findById(id: string): Promise<User | null> {
        const raw = await this.prisma.user.findUnique({ where: { id } });
        if (!raw) return null;
        return this.mapToDomain(raw);
    }

    async findByEmail(email: string): Promise<User | null> {
        const raw = await this.prisma.user.findUnique({ where: { email } });
        if (!raw) return null;
        return this.mapToDomain(raw);
    }

    async findAll(tenantId: string): Promise<User[]> {
        const raw = await this.prisma.user.findMany({ where: { tenantId } });
        return raw.map(this.mapToDomain);
    }

    private mapToDomain(raw: any): User {
        return new User(
            raw.id,
            raw.email,
            raw.password,
            raw.fullName || raw.name, // Handle both fields
            true, // isActive
            raw.isOwner || false, // isOwner
            raw.tenantId,
            raw.roleId,
            raw.createdAt,
            raw.updatedAt
        );
    }

    async updateRefreshToken(id: string, hashedRefreshToken: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { hashedRefreshToken }
        });
    }

    async enableMfa(id: string, secret: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: {
                mfaSecret: secret,
                isMfaEnabled: true
            }
        });
    }

    async findByIdWithPermissions(id: string): Promise<any> {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: { // Multi-Role
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

    async assignRole(userId: string, roleId: string, tenantId?: string): Promise<void> {
        await this.prisma.userRole.upsert({
            where: {
                userId_roleId_tenantId: {
                    userId,
                    roleId,
                    tenantId: (tenantId || null) as any
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

    async revokeRole(userId: string, roleId: string, tenantId?: string): Promise<void> {
        try {
            await this.prisma.userRole.delete({
                where: {
                    userId_roleId_tenantId: {
                        userId,
                        roleId,
                        tenantId: (tenantId || null) as any
                    }
                }
            });
        } catch (e) {
            // Ignore if not found
        }
    }
}
