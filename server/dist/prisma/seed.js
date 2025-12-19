"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
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
    const getPermId = async (slug) => {
        const p = await prisma.permission.findUnique({ where: { slug } });
        return p?.id;
    };
    const platformSidebar = await prisma.menu.upsert({
        where: { slug: 'platform_sidebar' },
        update: {},
        create: { name: 'Platform Sidebar', slug: 'platform_sidebar' },
    });
    const tenantSidebar = await prisma.menu.upsert({
        where: { slug: 'tenant_sidebar' },
        update: {},
        create: { name: 'Tenant Sidebar', slug: 'tenant_sidebar' },
    });
    const oldSidebar = await prisma.menu.findUnique({ where: { slug: 'admin_sidebar' } });
    if (oldSidebar) {
        await prisma.menuItem.deleteMany({ where: { menuId: oldSidebar.id } });
        await prisma.menu.delete({ where: { id: oldSidebar.id } });
    }
    await prisma.menuItem.deleteMany({ where: { menuId: { in: [platformSidebar.id, tenantSidebar.id] } } });
    console.log('Seeding Platform Sidebar...');
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
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'Təsdiqləmələr',
            path: '/admin/approvals',
            icon: 'CheckSquare',
            order: 16,
            permissionId: await getPermId('admin:approvals:read')
        }
    });
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
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'Tənzimləmələr',
            path: '/admin/settings',
            icon: 'Settings',
            order: 50,
            permissionId: await getPermId('system:config:general:read')
        }
    });
    await prisma.menuItem.create({
        data: {
            menuId: platformSidebar.id,
            title: 'Abunə Sistemi',
            path: '/admin/billing',
            icon: 'CreditCard',
            order: 25,
            permissionId: await getPermId('system:billing:read')
        }
    });
    console.log('Seeding Tenant Sidebar...');
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
            permissionId: await getPermId('config:dict:currencies:read')
        }
    });
    await prisma.menuItem.create({
        data: {
            menuId: tenantSidebar.id,
            parentId: configParent.id,
            title: 'Fayllar',
            path: '/settings/files',
            icon: 'FileText',
            order: 33,
            permissionId: await getPermId('config:dox_templates:read')
        }
    });
    console.log('Seeding Permissions...');
    function extractPermissions(obj, acc = []) {
        for (const key in obj) {
            const val = obj[key];
            if (val && typeof val === 'object') {
                if ('slug' in val && 'description' in val && 'scope' in val) {
                    acc.push(val);
                }
                else {
                    extractPermissions(val, acc);
                }
            }
        }
        return acc;
    }
    const { PERMISSIONS } = require('../src/common/constants/permissions');
    const permissionList = extractPermissions(PERMISSIONS);
    const allPermissions = [];
    for (const perm of permissionList) {
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
    console.log('Assigning Permissions to Roles...');
    await prisma.rolePermission.deleteMany({ where: { roleId: { in: [ownerRole.id, adminRole.id] } } });
    for (const p of allPermissions) {
        await prisma.rolePermission.create({
            data: { roleId: ownerRole.id, permissionId: p.id }
        });
    }
    for (const p of allPermissions) {
        await prisma.rolePermission.create({
            data: { roleId: adminRole.id, permissionId: p.id }
        });
    }
    const pSettingsRead = await prisma.permission.findFirst({
        where: { slug: { contains: 'system:config' } }
    });
    const passwordHash = await bcrypt.hash('password123', 10);
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
            roleId: ownerRole.id
        },
        create: {
            email: 'admin@example.com',
            password: passwordHash,
            fullName: 'Admin User',
            tenantId: defaultTenant.id,
            roleId: ownerRole.id
        }
    });
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
//# sourceMappingURL=seed.js.map