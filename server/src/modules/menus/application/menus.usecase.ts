import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class MenusUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async getSidebar(roleNames: string[]) {
        // Determine which menu to serve
        // If user has Owner or SuperAdmin role, they get the Platform Sidebar
        // Otherwise they get the Tenant Sidebar
        // Normalize roles to lowercase to be safe, or check specifically for 'owner'
        const lowerRoles = roleNames.map(r => r.toLowerCase());
        const isPlatformAdmin = lowerRoles.includes('owner') || lowerRoles.includes('superadmin');
        const menuSlug = isPlatformAdmin ? 'platform_sidebar' : 'tenant_sidebar';

        return this.prisma.menu.findUnique({
            where: { slug: menuSlug },
            include: {
                items: {
                    orderBy: { order: 'asc' },
                    where: { parentId: null }, // Top level
                    include: {
                        permission: true, // Include Permission
                        children: {
                            orderBy: { order: 'asc' },
                            include: {
                                permission: true, // Include Permission
                                children: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        permission: true // Include Permission
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    async createDefaultMenu() {
        // Seeding logic (call this manually or via seed script)
        // Legacy seeding logic - Disabling in favor of seed.ts
        return;
        /*
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
        */
    }
}
