
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Debugging Owner Permissions...');

    // 1. Find all "Owner" roles
    const ownerRoles = await prisma.role.findMany({
        where: { name: 'Owner' },
        include: {
            permissions: {
                include: { permission: true }
            }
        }
    });

    console.log(`Found ${ownerRoles.length} roles named "Owner"`);

    for (const role of ownerRoles) {
        console.log(`\nRole: ${role.name} | ID: ${role.id} | Scope: ${role.scope} | TenantId: ${role.tenantId}`);
        console.log(`Total Permissions: ${role.permissions.length}`);

        // Check for specific critical permissions
        const slugs = role.permissions.map(p => p.permission.slug);

        const criticalToCheck = [
            'system.settings.security.user_rights.roles_permissions.read',
            'system.settings.security.user_rights.roles_permissions.view_matrix',
            'system.settings.security.user_rights.roles_permissions.export_to_excel',
            'system.settings.read'
        ];

        criticalToCheck.forEach(slug => {
            const has = slugs.includes(slug);
            console.log(`   [${has ? '✅' : '❌'}] ${slug}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
