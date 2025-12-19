import { PrismaClient } from '@prisma/client';
import { RolePresets } from './src/platform/auth/role-presets';
import { PermissionRegistry } from './src/platform/auth/permissions';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Roles and Permissions...');

    // 1. Upsert All Helper Permissions (Optional, usually we seed permissions based on what's used in roles)
    // But here we want a complete catalog in DB
    const allPermissions = Object.values(PermissionRegistry).flatMap(group => Object.values(group));

    for (const slug of allPermissions) {
        // Simple module inference: 'billing.invoices.view' -> 'billing'
        const module = slug.split('.')[0];
        await prisma.permission.upsert({
            where: { slug },
            update: { module },
            create: { slug, module, description: `Permission to ${slug}` }
        });
    }

    console.log('✅ Permissions synced.');

    // 2. Seed System Roles
    for (const [key, preset] of Object.entries(RolePresets.SYSTEM)) {
        await upsertRole(preset.name, preset.description, preset.permissions, true);
    }

    // 3. Seed Tenant Roles
    for (const [key, preset] of Object.entries(RolePresets.TENANT)) {
        await upsertRole(preset.name, preset.description, preset.permissions, false);
    }

    console.log('✅ Roles synced.');
}

async function upsertRole(name: string, description: string, permissionSlugs: string[], isSystem: boolean) {
    // 1. Check if role exists (Global roles have tenantId: null)
    const existingRole = await prisma.role.findFirst({
        where: {
            name: name,
            tenantId: null
        }
    });

    let role;
    if (existingRole) {
        role = await prisma.role.update({
            where: { id: existingRole.id },
            data: { description, isSystem }
        });
    } else {
        role = await prisma.role.create({
            data: {
                name,
                description,
                isSystem,
                tenantId: null
            }
        });
    }

    // 2. Refresh Permissions
    // Delete all current permissions for this role
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    // Fetch Permission IDs
    const perms = await prisma.permission.findMany({ where: { slug: { in: permissionSlugs } } });

    // Insert RolePermissions
    if (perms.length > 0) {
        await prisma.rolePermission.createMany({
            data: perms.map(p => ({
                roleId: role.id,
                permissionId: p.id
            }))
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
