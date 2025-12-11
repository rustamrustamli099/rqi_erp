import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                role: {
                    include: {
                        permissions: { include: { permission: true } }
                    }
                }
            }
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        const { skip, take, cursor, where, orderBy } = params || {};
        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                tenant: true,
                branch: true,
                role: true
            }
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        if (data.password) {
            data.password = await bcrypt.hash(data.password as string, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data,
            include: {
                role: true
            }
        });
    }

    async remove(id: string): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken },
        });
    }
}
