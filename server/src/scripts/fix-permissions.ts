
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing permissions...');

    const slug = 'system.settings.security.user_rights.roles.select_permissions';

    const existing = await prisma.permission.findUnique({
        where: { slug }
    });

    if (existing) {
        console.log(`Permission ${slug} already exists.`);
    } else {
        console.log(`Creating permission: ${slug}`);
        await prisma.permission.create({
            data: {
                slug,
                description: 'Manage Role Permissions (Select/Add/Remove)',
                scope: 'SYSTEM',
                module: 'IAM'
            }
        });
        console.log('Permission created successfully.');
    }
    // Find Owner Role
    const ownerRole = await prisma.role.findFirst({
        where: { name: 'Owner' }
    });

    if (ownerRole) {
        console.log(`Found Owner Role: ${ownerRole.id}`);
        // Check if role has permission
        const permId = existing
            ? existing.id
            : (await prisma.permission.findUnique({ where: { slug } }))?.id;

        if (!permId) {
            console.error('Permission ID not found even after creation logic.');
            return;
        }

        if (ownerRole) {
            console.log(`Found Owner Role: ${ownerRole.id}`);
            // Check if role has permission
            const rolePerm = await prisma.rolePermission.findFirst({
                where: {
                    roleId: ownerRole.id,
                    permissionId: permId
                }
            });

            if (rolePerm) {
                console.log('Owner role already has this permission.');
            } else {
                console.log('Assigning permission to Owner role...');
                await prisma.rolePermission.create({
                    data: {
                        roleId: ownerRole.id,
                        permissionId: permId
                    }
                });
                console.log('Assigned successfully.');
            }
        } else {
            console.log('Owner role not found.');
        }
    }
}


main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
