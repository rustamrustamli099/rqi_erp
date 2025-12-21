import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Setting up Zero-Permission Test Environment...');

    // 1. Create/Get Test Role (0 Permissions)
    const roleName = 'Test Role';
    let testRole = await prisma.role.findFirst({ where: { name: roleName } });

    if (!testRole) {
        testRole = await prisma.role.create({
            data: {
                name: roleName,
                description: 'Role for manual RBAC verification (Initially 0 permissions)',
                isSystem: false,
                tenantId: null // Global or System level for simplicity, or specific tenant? Assuming System for now.
            }
        });
        console.log(`✅ Created Role: ${roleName}`);
    } else {
        console.log(`ℹ️ Role already exists: ${roleName}`);
        // Ensure no permissions
        await prisma.rolePermission.deleteMany({ where: { roleId: testRole.id } });
        console.log(`🧹 Cleared all permissions for ${roleName}`);
    }

    // 2. Create Test User
    const email = 'test@rqi.az';
    const password = '123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            isOwner: false, // Explicitly NOT owner
            roleId: testRole.id,
            fullName: 'Test User'
        },
        create: {
            email,
            password: hashedPassword,
            fullName: 'Test User',
            isOwner: false,
            roleId: testRole.id
        }
    });

    // 3. Assign UserRole
    await prisma.userRole.upsert({
        where: {
            userId_roleId_tenantId: {
                userId: user.id,
                roleId: testRole.id,
                tenantId: "SYSTEM" // Using SYSTEM as default placeholder if schema requires string
            } as any
        },
        update: {},
        create: {
            userId: user.id,
            roleId: testRole.id,
            tenantId: null
        }
    });

    console.log(`
🎉 Test Setup Complete!
-----------------------------------------------
User:  ${email}
Pass:  ${password}
Role:  ${roleName} (Permissions: 0)
-----------------------------------------------
You can now log in and verify that the sidebar is empty and access is denied everywhere.
    `);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
