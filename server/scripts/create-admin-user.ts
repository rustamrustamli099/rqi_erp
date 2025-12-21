import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'qudret.rustem@gmail.com';
    const password = '9314';
    const targetRoleId = 'e610f078-31d5-4183-a0ae-4e03fffe6131';

    console.log(`🚀 Creating user: ${email}...`);

    // 1. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Verify Role
    let role = await prisma.role.findUnique({ where: { id: targetRoleId } });
    if (!role) {
        console.warn(`⚠️ Warning: Role ID ${targetRoleId} not found. Searching for 'Owner' role by name...`);
        role = await prisma.role.findFirst({ where: { name: 'Owner' } });
        if (!role) {
            console.error('❌ Error: Could not find Owner role.');
            process.exit(1);
        }
        console.log(`✅ Found 'Owner' role via name: ${role.id}`);
    } else {
        console.log(`✅ Verified Role ID: ${role.id} (${role.name})`);
    }

    // 3. Create/Update User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            isOwner: true,
            // Update legacy roleId just in case
            roleId: role.id
        },
        create: {
            email,
            password: hashedPassword,
            fullName: 'Qudret Rustem', // Placeholder name
            isOwner: true,
            roleId: role.id
        }
    });

    // 4. Assign UserRole (Strict RBAC)
    // Upsert to ensure no duplicates
    await prisma.userRole.upsert({
        where: {
            userId_roleId_tenantId: {
                userId: user.id,
                roleId: role.id,
                tenantId: "SYSTEM" // Using SYSTEM as default for Owner if database requires string, strictly from schema it might be nullable.
                // Checking schema: tenantId String?
                // But composite unique key: @@unique([userId, roleId, tenantId])
                // If I pass null to prisma upsert where clause it might be tricky.
                // Let's try explicit null if allowed, or check schema constraints.
            } as any
        },
        update: {},
        create: {
            userId: user.id,
            roleId: role.id,
            tenantId: null // Global System Owner
        }
    });

    console.log(`🎉 User created successfully!`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${role.name}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
