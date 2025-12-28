/**
 * Create Test User with No Permissions
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createTestUser() {
    const prisma = new PrismaClient();

    try {
        // 1. Create empty role (no permissions)
        let testRole = await prisma.role.findFirst({
            where: { name: 'Test Role (No Permissions)' }
        });

        if (!testRole) {
            testRole = await prisma.role.create({
                data: {
                    name: 'Test Role (No Permissions)',
                    description: 'Test üçün heç bir icazəsi olmayan rol',
                    scope: 'SYSTEM',
                    status: 'ACTIVE',
                    isLocked: false,
                    isEnabled: true
                }
            });
        }
        console.log('Role:', testRole.id, testRole.name);

        // 2. Hash password
        const hashedPassword = await bcrypt.hash('Test123!', 10);

        // 3. Create test user
        let testUser = await prisma.user.findUnique({
            where: { email: 'test@noperm.com' }
        });

        if (!testUser) {
            testUser = await prisma.user.create({
                data: {
                    email: 'test@noperm.com',
                    password: hashedPassword,
                    fullName: 'Test NoPerm',
                    scope: 'SYSTEM'
                }
            });
        }
        console.log('User:', testUser.id, testUser.email);

        // 4. Assign role to user
        const existingAssignment = await prisma.userRole.findFirst({
            where: {
                userId: testUser.id,
                roleId: testRole.id
            }
        });

        if (!existingAssignment) {
            await prisma.userRole.create({
                data: {
                    userId: testUser.id,
                    roleId: testRole.id
                }
            });
        }
        console.log('Role assigned to user');

        console.log('\n=== TEST USER CREATED ===');
        console.log('Email: test@noperm.com');
        console.log('Password: Test123!');
        console.log('Role: Test Role (No Permissions)');
        console.log('Permissions: 0 (heç biri)');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
