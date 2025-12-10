import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MenusService {
    constructor(private prisma: PrismaService) { }

    async getSidebar(roleNames: string[]) {
        // Fetch the 'admin_sidebar' menu
        // In a real SAP-like app, we would recursively filter items based on permissions
        // matching the user's roles.

        // For now, we return the full structure, and the Frontend filters it too (double security).
        return this.prisma.menu.findUnique({
            where: { slug: 'admin_sidebar' },
            include: {
                items: {
                    orderBy: { order: 'asc' },
                    where: { parentId: null }, // Top level
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                            include: {
                                children: { orderBy: { order: 'asc' } } // 3 levels deep
                            }
                        }
                    }
                }
            }
        });
    }

    async createDefaultMenu() {
        // Seeding logic (call this manually or via seed script)
        const exists = await this.prisma.menu.findUnique({ where: { slug: 'admin_sidebar' } });
        if (exists) return;

        return this.prisma.menu.create({
            data: {
                name: 'Admin Sidebar',
                slug: 'admin_sidebar',
                items: {
                    create: [
                        { title: 'Dashboard', icon: 'LayoutDashboard', path: '/admin', order: 1 },
                        { title: 'Users & Curator', icon: 'Users', path: '/admin/users', order: 2, permission: { create: { slug: 'admin:users:read', module: 'Users' } } },
                        { title: 'Settings', icon: 'Settings', path: '/admin/settings', order: 99 }
                    ]
                }
            }
        });
    }
}
