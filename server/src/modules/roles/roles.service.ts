import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true }
                },
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: { permission: true }
                }
            }
        });
    }

    async create(data: Prisma.RoleCreateInput & { permissionIds?: string[] }) {
        const { permissionIds, ...rest } = data;
        return this.prisma.role.create({
            data: {
                ...rest,
                permissions: permissionIds ? {
                    create: permissionIds.map(pid => ({
                        permission: { connect: { id: pid } }
                    }))
                } : undefined
            },
            include: {
                permissions: { include: { permission: true } }
            }
        });
    }

    async update(id: string, data: Prisma.RoleUpdateInput & { permissionIds?: string[] }) {
        const { permissionIds, ...rest } = data;

        // If permissionIds provided, we replace existing ones
        let permissionUpdate: any = undefined;
        if (permissionIds) {
            // First delete existing links
            await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
            // Then create new links
            permissionUpdate = {
                create: permissionIds.map(pid => ({
                    permission: { connect: { id: pid } }
                }))
            };
        }

        return this.prisma.role.update({
            where: { id },
            data: {
                ...rest,
                permissions: permissionUpdate
            },
            include: {
                permissions: { include: { permission: true } }
            }
        });
    }

    async remove(id: string) {
        return this.prisma.role.delete({ where: { id } });
    }

    async findAllPermissions() {
        return this.prisma.permission.findMany();
    }
}
