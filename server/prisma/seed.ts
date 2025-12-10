// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./dev.db',
        },
    },
});

async function main() {
    console.log('Seeding database...');

    // 1. Clean up (Optional, be careful in prod)
    // await prisma.menuItem.deleteMany();
    // await prisma.menu.deleteMany();

    // 2. Create Roles (if not exist)
    // 2. Create Roles (if not exist)
    // Using explicit composite key for upsert
    // Note: In SQLite/Prisma, unique on [name, tenantId] means we need to query that way.
    // Simplifying to findFirst then create to avoid type gymnastics in seed.

    let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: { name: 'admin', description: 'Administrator' }
        });
    }

    let tenantRole = await prisma.role.findFirst({ where: { name: 'tenant_admin' } });
    if (!tenantRole) {
        tenantRole = await prisma.role.create({
            data: { name: 'tenant_admin', description: 'Tenant Administrator' }
        });
    }

    let ownerRole = await prisma.role.findFirst({ where: { name: 'owner' } });
    if (!ownerRole) {
        ownerRole = await prisma.role.create({
            data: { name: 'owner', description: 'System Owner (Super Admin)' }
        });
    }

    // 3. Create Admin Sidebar Menu
    const sidebar = await prisma.menu.upsert({
        where: { slug: 'admin_sidebar' },
        update: {},
        create: {
            name: 'Admin Sidebar',
            slug: 'admin_sidebar',
        },
    });

    // 4. Create Menu Items
    // Dashboard
    await prisma.menuItem.create({
        data: {
            menuId: sidebar.id,
            title: 'İdarə etmə paneli',
            path: '/',
            icon: 'LayoutDashboard',
            order: 1,

        }
    });

    // 2.a Create Granular Permissions

    // 2.a Create Granular Permissions


    // 2.a Create Granular Permissions
    /*
    const permissions = [
        // ... (manual list)
    ];
    */
    // Importing permissions from constant or defining them here if import fails in seed env
    // For safety in seed script, I will redefine the object structure here to avoid module resolution headaches common in seed scripts.
    const SYSTEM_PERMISSIONS = {
        TENANTS: { VIEW: 'tenants:read', CREATE: 'tenants:create', UPDATE: 'tenants:update', DELETE: 'tenants:delete', SUSPEND: 'tenants:suspend', MANAGE_SUBSCRIPTION: 'tenants:billing' },
        USERS: { VIEW: 'users:read', CREATE: 'users:create', UPDATE: 'users:update', DELETE: 'users:delete', RESET_PASSWORD: 'users:password:reset', MANAGE_ROLES: 'users:roles:assign' },
        ROLES: { VIEW: 'roles:read', CREATE: 'roles:create', UPDATE: 'roles:update', DELETE: 'roles:delete' },
        SYSTEM: { VIEW_LOGS: 'system:logs:view', MANAGE_SETTINGS: 'system:settings:manage', MANAGE_INTEGRATIONS: 'system:integrations:manage' },
        DASHBOARD: { VIEW_GLOBAL: 'dashboard:global:view', VIEW_TENANT: 'dashboard:tenant:view' }
    };

    console.log('Seeding Permissions...');
    const allPermissions = [];
    for (const [module, perms] of Object.entries(SYSTEM_PERMISSIONS)) {
        for (const [action, slug] of Object.entries(perms)) {
            const description = `${module} - ${action}`;
            const p = await prisma.permission.upsert({
                where: { slug },
                update: {},
                create: { slug, description, module: module.toLowerCase() }
            });
            allPermissions.push(p);
        }
    }

    /* Legacy loop removed */

    // Fetch created permissions for linking
    // Using the slug directly or from constant if accessible. 
    // We used 'system:settings:manage' in the constant
    const pSettingsRead = await prisma.permission.findUnique({ where: { slug: 'system:settings:manage' } });

    // ... rest of menu items

    // Admin Section
    const adminItem = await prisma.menuItem.create({
        data: {
            menuId: sidebar.id,
            title: 'Admin Paneli',
            path: '/admin',
            icon: 'ShieldCheck',
            order: 2,
            permissionId: pSettingsRead?.id,
        }
    });

    // Admin Sub-items
    await Promise.all([
        prisma.menuItem.create({
            data: {
                menuId: sidebar.id,
                parentId: adminItem.id,
                title: 'Tenantlar',
                path: '/admin/tenants',
                icon: 'Building',
                order: 1,
            }
        }),
        prisma.menuItem.create({
            data: {
                menuId: sidebar.id,
                parentId: adminItem.id,
                title: 'İstifadəçilər',
                path: '/admin/users',
                icon: 'Users',
                order: 2,
            }
        }),
        prisma.menuItem.create({
            data: {
                menuId: sidebar.id,
                parentId: adminItem.id,
                title: 'Tənzimləmələr',
                path: '/admin/settings',
                icon: 'Settings',
                order: 3,
            }
        }),
        prisma.menuItem.create({
            data: {
                menuId: sidebar.id,
                parentId: adminItem.id,
                title: 'Rollar & İcazələr',
                path: '/admin/roles',
                icon: 'Lock',
                order: 4,
            }
        })
    ]);

    // Tenant Section
    await prisma.menuItem.create({
        data: {
            menuId: sidebar.id,
            title: 'İstifadəçilər',
            path: '/users',
            icon: 'Users',
            order: 3,
        }
    });

    // 5. Create Admin User (Owner)
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Tenant first
    let defaultTenant = await prisma.tenant.findUnique({ where: { slug: 'default' } });
    if (!defaultTenant) {
        defaultTenant = await prisma.tenant.create({
            data: {
                name: 'Default Tenant',
                slug: 'default'
            }
        });
    }

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: passwordHash,
            fullName: 'Admin User',
            tenantId: defaultTenant.id,
            roles: {
                create: [
                    { roleId: ownerRole.id },
                    { roleId: adminRole.id }
                ]
            }
        }
    });

    console.log('Admin User created:', adminUser.email);
    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
