
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MISSING_PERMS = [
    { slug: 'system.billing.view', name: 'Billing View', module: 'billing' },
    { slug: 'system.settings.view', name: 'Settings View', module: 'settings' },
    { slug: 'system.system_console.view', name: 'System Console View', module: 'system_console' },
    { slug: 'system.developer_hub.view', name: 'Developer Hub View', module: 'developer_hub' },
    { slug: 'system.settings.security.view', name: 'Security Settings View', module: 'settings' },
    { slug: 'system.settings.system_configurations.view', name: 'System Config View', module: 'settings' }
];

async function main() {
    console.log('🔧 Fixing Missing Permissions...');

    // 1. Create Permissions
    const createdIds: string[] = [];
    for (const p of MISSING_PERMS) {
        const perm = await prisma.permission.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                slug: p.slug,
                name: p.name,
                module: p.module,
                scope: 'SYSTEM'
            }
        });
        createdIds.push(perm.id);
        console.log(`✅ Ensured permission: ${p.slug}`);
    }

    // 2. Assign to Owner
    const ownerRole = await prisma.role.findFirst({
        where: { name: 'Owner', tenantId: null }
    });

    if (ownerRole) {
        console.log(`Role Owner found: ${ownerRole.id}. Assigning permissions...`);
        for (const pid of createdIds) {
            try {
                await prisma.rolePermission.create({
                    data: { roleId: ownerRole.id, permissionId: pid }
                });
            } catch (e) {
                // Ignore duplicates
            }
        }
        console.log('✅ Assigned missing permissions to Owner.');
    } else {
        console.error('❌ Owner role not found!');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
