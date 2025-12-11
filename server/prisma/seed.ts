// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';


const prisma = new PrismaClient();

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

    // Helper to get permission ID
    const getPermId = async (slug: string) => {
        const p = await prisma.permission.findUnique({ where: { slug } });
        return p?.id;
    };

    // 3. Create Sidebars
    // A. PLATFORM SIDEBAR (For Owner/SuperAdmin)
    const platformSidebar = await prisma.menu.upsert({
        where: { slug: 'platform_sidebar' },
        update: {},
        create: { name: 'Platform Sidebar', slug: 'platform_sidebar' },
    });

    // B. TENANT SIDEBAR (For Tenant Admins/Users)
    const tenantSidebar = await prisma.menu.upsert({
        where: { slug: 'tenant_sidebar' },
        update: {},
        create: { name: 'Tenant Sidebar', slug: 'tenant_sidebar' },
    });

    // Clean up old items
    const oldSidebar = await prisma.menu.findUnique({ where: { slug: 'admin_sidebar' } });
    if (oldSidebar) {
        await prisma.menuItem.deleteMany({ where: { menuId: oldSidebar.id } });
        await prisma.menu.delete({ where: { id: oldSidebar.id } });
    }

    // Clean up new items to ensure fresh seed
    await prisma.menuItem.deleteMany({ where: { menuId: { in: [platformSidebar.id, tenantSidebar.id] } } });


    // ===========================================
    // PLATFORM SIDEBAR CONTENT
    // ===========================================
    console.log('Seeding Platform Sidebar...');

    // 1. Dashboard
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'İdarə etmə paneli',
            path: '/',
            icon: 'LayoutDashboard',
            order: 10,
            permissionId: await getPermId('dashboard:view')
        }
    });

    // 1.5 Users (Admin)
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'İstifadəçilər',
            path: '/admin/users',
            icon: 'Users',
            order: 15,
            permissionId: await getPermId('system:users:read')
        }
    });

    // 1.6 Approvals (Admin)
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'Təsdiqləmələr',
            path: '/admin/approvals',
            icon: 'CheckSquare', // or specific icon if available
            order: 16,
            permissionId: await getPermId('admin:approvals:read')
        }
    });

    // 2. Tenants (Top Level as requested)
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'Tenantlar',
            path: '/admin/tenants',
            icon: 'Building',
            order: 20,
            permissionId: await getPermId('system:tenants:read')
        }
    });

    // 3. Settings (Top Level "System Settings")
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'Tənzimləmələr', // Settings
            path: '/admin/settings',
            icon: 'Settings',
            order: 50,
            permissionId: await getPermId('system:config:general:read')
        }
    });

    // 2.1 Packages (Service Plans)
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'Paketlər',
            path: '/admin/packages',
            icon: 'Package', // Lucide icon
            order: 25,
            permissionId: await getPermId('system:packages:read')
        }
    });

    // 2.2 Subscriptions (Active Billings)
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'Abunəliklər',
            path: '/admin/subscriptions',
            icon: 'CreditCard',
            order: 26,
            permissionId: await getPermId('system:subscriptions:read')
        }
    });


    // ===========================================
    // TENANT SIDEBAR CONTENT
    // ===========================================
    console.log('Seeding Tenant Sidebar...');

    // 1. Dashboard
    await prisma.menuItem.create({
        data: {
            menuId: tenantSidebar.id,
            title: 'İdarə etmə paneli',
            path: '/',
            icon: 'LayoutDashboard',
            order: 10,
            permissionId: await getPermId('dashboard:view')
        }
    });

    // 2. Users module
    await prisma.menuItem.create({
        data: {
            menuId: tenantSidebar.id,
            title: 'İstifadəçilər',
            path: '/users',
            icon: 'Users',
            order: 20,
            permissionId: await getPermId('users:read')
        }
    });

    // 3. Settings Group
    const configParent = await prisma.menuItem.create({
        data: {
            menuId: tenantSidebar.id,
            title: 'Tənzimləmələr',
            path: '/settings',
            icon: 'Settings',
            order: 30,
            permissionId: await getPermId('config:roles:read')
        }
    });

    // Config -> Roles
    await prisma.menuItem.create({
        data: {
            menuId: tenantSidebar.id,
            parentId: configParent.id,
            title: 'Rollar',
            path: '/settings/roles',
            icon: 'Shield',
            order: 31,
            permissionId: await getPermId('config:roles:read')
        }
    });

    // Config -> Dictionaries
    await prisma.menuItem.create({
        data: {
            menuId: tenantSidebar.id,
            parentId: configParent.id,
            title: 'Soraqçalar',
            path: '/settings/dictionaries',
            icon: 'Book',
            order: 32,
            title: 'Soraqçalar',
            path: '/settings/dictionaries',
            icon: 'Book',
            order: 32,
            permissionId: await getPermId('config:dict:currencies:read') // Changed from generic if needed
        }
    });

    // Config -> Files
    await prisma.menuItem.create({
        data: {
            menuId: tenantSidebar.id,
            parentId: configParent.id,
            title: 'Fayllar',
            path: '/settings/files', // Assuming this route exists or we use settings tab
            icon: 'FileText',
            order: 33,
            permissionId: await getPermId('config:dox_templates:read') // Using a placeholder permission or add new
        }
    });

    // 2.a Create Granular Permissions


    // 2.a Create Granular Permissions
    console.log('Seeding Permissions...');

    // Recursive helper to extract leaf permissions
    function extractPermissions(obj: any, acc: any[] = []) {
        for (const key in obj) {
            const val = obj[key];
            if (val && typeof val === 'object') {
                if ('slug' in val && 'description' in val && 'scope' in val) {
                    // It's a leaf permission node
                    acc.push(val);
                } else {
                    // Recurse
                    extractPermissions(val, acc);
                }
            }
        }
        return acc;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PERMISSIONS } = require('../src/common/constants/permissions');

    const permissionList = extractPermissions(PERMISSIONS);
    const allPermissions: any[] = [];

    for (const perm of permissionList) {
        // Derive module from slug (first segment)
        const parts = perm.slug.split(':');
        const moduleName = parts[0];

        const p = await prisma.permission.upsert({
            where: { slug: perm.slug },
            update: { description: perm.description, module: moduleName, scope: perm.scope },
            create: {
                slug: perm.slug,
                description: perm.description,
                module: moduleName,
                scope: perm.scope
            }
        });
        allPermissions.push(p);
    }

    console.log(`Seeded ${allPermissions.length} permissions.`);

    // 2.b Assign ALL permissions to Owner and Admin roles (for Full Access)
    console.log('Assigning Permissions to Roles...');

    // Clear existing permissions first to avoid conflicts/stale data
    await prisma.rolePermission.deleteMany({ where: { roleId: { in: [ownerRole.id, adminRole.id] } } });

    // Assign all to Owner
    for (const p of allPermissions) {
        await prisma.rolePermission.create({
            data: { roleId: ownerRole.id, permissionId: p.id }
        });
    }
    // Assign all to Admin (or maybe slightly restricted? For now Full)
    for (const p of allPermissions) {
        await prisma.rolePermission.create({
            data: { roleId: adminRole.id, permissionId: p.id }
        });
    }


    // Fetch specific permission for menu linking
    // Using a safe default from the new structure
    const pSettingsRead = await prisma.permission.findFirst({
        where: { slug: { contains: 'system:config' } }
    });

    // ... rest of menu items

    // Admin Section
    // This section is now replaced by the new menu structure above.
    // The original content for Admin Section and Tenant Section is removed.

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
        update: {
            roleId: ownerRole.id // Ensure role is updated
        },
        create: {
            email: 'admin@example.com',
            password: passwordHash,
            fullName: 'Admin User',
            tenantId: defaultTenant.id,
            roleId: ownerRole.id // Single Role
        }
    });

    // 6. Seed Sectors
    console.log('Seeding Sectors...');
    const sectors = [
        'Information Technology', 'Finance', 'Healthcare', 'Education',
        'Construction', 'Retail', 'Logistics', 'Manufacturing', 'Other'
    ];
    for (const name of sectors) {
        const slug = name.toLowerCase().replace(/ /g, '-');
        await prisma.sector.upsert({
            where: { slug },
            update: {},
            create: { name, slug }
        });
    }

    // 7. Seed Timezones
    console.log('Seeding Timezones...');
    const timezones = [
        { name: 'Asia/Baku', offset: '+04:00', description: 'Azerbaijan Time' },
        { name: 'Europe/Istanbul', offset: '+03:00', description: 'Turkey Time' },
        { name: 'Europe/London', offset: '+00:00', description: 'Greenwich Mean Time' },
        { name: 'America/New_York', offset: '-05:00', description: 'Eastern Standard Time' },
        { name: 'UTC', offset: '+00:00', description: 'Coordinated Universal Time' }
    ];
    for (const tz of timezones) {
        await prisma.timezone.upsert({
            where: { name: tz.name },
            update: {},
            create: tz
        });
    }

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
