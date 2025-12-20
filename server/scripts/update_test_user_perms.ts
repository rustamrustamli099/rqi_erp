import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLE_ID = '46039a46-6fad-4772-80b3-a25aa56f6de4';

/*
  Permissions requested:
  - dashboard read -> "admin_panel.dashboard.read"
  - settings general read -> "admin_panel.settings.general.company_profile.read"
  - settings sms read -> "admin_panel.settings.communication.smtp_sms.read"
*/

const TARGET_PERMISSIONS = [
    { slug: 'admin_panel.dashboard.read', description: 'View Dashboard' },
    { slug: 'admin_panel.settings.read', description: 'View Settings Page' }, // Page Level
    { slug: 'admin_panel.settings.general.company_profile.read', description: 'View Company Profile' },
    { slug: 'admin_panel.settings.communication.smtp_sms.read', description: 'View SMS Settings' },
    { slug: 'admin_panel.settings.system_configurations.dictionary.sectors.read', description: 'View Sectors Dictionary' }
];

async function main() {
    console.log(`Updating permissions for Role: ${ROLE_ID}`);

    // 1. Ensure permissions exist
    for (const p of TARGET_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                slug: p.slug,
                description: p.description,
                module: 'SYSTEM' // Default module
            }
        });
        console.log(`Ensured permission: ${p.slug}`);
    }

    // 2. Clear existing permissions for this role to ensure strict testing
    console.log(`Clearing existing permissions for Role: ${ROLE_ID}`);
    await prisma.rolePermission.deleteMany({
        where: { roleId: ROLE_ID }
    });

    for (const p of TARGET_PERMISSIONS) {
        const perm = await prisma.permission.findUnique({ where: { slug: p.slug } });
        if (!perm) continue;

        try {
            await prisma.rolePermission.create({
                data: {
                    roleId: ROLE_ID,
                    permissionId: perm.id
                }
            });
            console.log(`Added ${p.slug} to Role`);
        } catch (e) {
            console.log(`Permission ${p.slug} already exists on Role (or error)`);
        }
    }

    // 3. Create Test User (FORCE RECREATE)
    const TEST_USER_EMAIL = 'testuser@rqi.az';
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Delete if exists to ensure clean state
    try {
        await prisma.user.delete({ where: { email: TEST_USER_EMAIL } });
        console.log(`Deleted existing user ${TEST_USER_EMAIL}`);
    } catch {
        // ignore if not found
    }

    const user = await prisma.user.create({
        data: {
            email: TEST_USER_EMAIL,
            password: hashedPassword,
            name: 'Test User',
            roleId: ROLE_ID, // Assign the Legacy ID for compatibility
        }
    });

    // Also assign via Multi-Role relation
    try {
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: ROLE_ID
            }
        });
        console.log(`Assigned Role ${ROLE_ID} to User ${TEST_USER_EMAIL} (Multi-Role table)`);
    } catch {
        console.log(`User ${TEST_USER_EMAIL} already has Role ${ROLE_ID} in Multi-Role table`);
    }

    console.log('Update Complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
