
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('👑 Seeding Owner Role and Permissions...');

    // 1. Ensure Owner Role Exists
    let ownerRole = await prisma.role.findFirst({
        where: { name: 'Owner', tenantId: null }
    });

    if (!ownerRole) {
        console.log('... Creating Owner Role');
        ownerRole = await prisma.role.create({
            data: {
                name: 'Owner',
                description: 'System Owner with full access',
                tenantId: null // System Scope
            }
        });
    } else {
        console.log('... Owner Role found');
    }

    // 2. Fetch ALL Permissions
    const allPermissions = await prisma.permission.findMany();
    console.log(`... Found ${allPermissions.length} permissions in DB`);

    if (allPermissions.length === 0) {
        console.error('❌ NO PERMISSIONS FOUND IN DB! Run seed.ts first.');
        process.exit(1);
    }

    // 3. Assign ALL Permissions to Owner
    console.log('... Assigning permissions to Owner...');

    // Performance: Use createMany or transaction
    // First clear existing to handle updates/removals? Or just upsert?
    // Clearing is safer for "Source of Truth" to remove stale ones.

    await prisma.$transaction(async (tx) => {
        // Clear all permissions for Owner
        await tx.rolePermission.deleteMany({
            where: { roleId: ownerRole!.id }
        });

        // Re-insert all
        const data = allPermissions.map(p => ({
            roleId: ownerRole!.id,
            permissionId: p.id
        }));

        await tx.rolePermission.createMany({
            data: data,
            skipDuplicates: true
        });
    });

    console.log(`✅ Successfully assigned ${allPermissions.length} permissions to Owner role.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
