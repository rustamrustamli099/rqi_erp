/**
 * RBAC Test Users Seed Script
 * 
 * Run: npx ts-node scripts/seed-test-users.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface TestUser {
    email: string;
    name: string;
    permissions: string[];
}

const TEST_USERS: TestUser[] = [
    {
        email: 'curators-only@test.com',
        name: 'Curators Only Test User',
        permissions: ['system.users.curators.read']
    },
    {
        email: 'users-only@test.com',
        name: 'Users Only Test User',
        permissions: ['system.users.users.read']
    },
    {
        email: 'monitoring-only@test.com',
        name: 'Monitoring Only Test User',
        permissions: ['system.console.monitoring.dashboard.read']
    },
    {
        email: 'dictionaries-currency@test.com',
        name: 'Dictionaries Currency Only Test User',
        permissions: ['system.settings.system_configurations.dictionary.currency.read']
    },
    {
        email: 'no-permissions@test.com',
        name: 'No Permissions Test User',
        permissions: []
    }
];

async function main() {
    console.log('🚀 Starting RBAC Test Users Seed...\n');

    const password = await bcrypt.hash('TestPassword123!', 10);

    for (const testUser of TEST_USERS) {
        console.log(`Creating user: ${testUser.email}`);

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: testUser.email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: testUser.email,
                    name: testUser.name,
                    password,
                    scope: 'SYSTEM'
                }
            });
            console.log(`  ✅ User created: ${user.id}`);
        } else {
            console.log(`  ℹ️ User already exists: ${user.id}`);
        }

        // Create role for this test user
        const roleName = `TEST_${testUser.email.split('@')[0].toUpperCase().replace(/-/g, '_')}`;

        let role = await prisma.role.findFirst({
            where: {
                name: roleName,
                tenantId: null
            }
        });

        if (!role) {
            role = await prisma.role.create({
                data: {
                    name: roleName,
                    description: `Test role for ${testUser.name}`,
                    scope: 'SYSTEM',
                    isLocked: false,
                    status: 'ACTIVE'
                }
            });
            console.log(`  ✅ Role created: ${role.name}`);
        } else {
            console.log(`  ℹ️ Role already exists: ${role.name}`);
        }

        // Delete existing permissions for the role
        await prisma.rolePermission.deleteMany({
            where: { roleId: role.id }
        });

        // Add permissions (find or create Permission by slug)
        for (const slug of testUser.permissions) {
            let permission = await prisma.permission.findUnique({
                where: { slug }
            });

            if (!permission) {
                // Create permission if it doesn't exist
                permission = await prisma.permission.create({
                    data: {
                        slug,
                        name: slug.split('.').pop() || slug,
                        module: slug.split('.')[1] || 'general',
                        scope: 'SYSTEM'
                    }
                });
                console.log(`  ⚠️ Permission created: ${slug}`);
            }

            await prisma.rolePermission.create({
                data: {
                    roleId: role.id,
                    permissionId: permission.id
                }
            });
        }
        console.log(`  ✅ ${testUser.permissions.length} permissions added`);

        // Check if user-role relation exists
        const existingUserRole = await prisma.userRole.findFirst({
            where: {
                userId: user.id,
                roleId: role.id
            }
        });

        if (!existingUserRole) {
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: role.id
                }
            });
            console.log(`  ✅ Role assigned to user\n`);
        } else {
            console.log(`  ℹ️ Role already assigned\n`);
        }
    }

    console.log('✅ All test users created successfully!');
    console.log('\nTest credentials:');
    console.log('Password: TestPassword123!');
    console.log('\nEmails:');
    TEST_USERS.forEach(u => console.log(`  - ${u.email}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
