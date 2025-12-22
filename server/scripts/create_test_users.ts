import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const OWNER_ROLE_ID = '95d0bbe0-e6be-42cf-b545-f1484a9f704f';
const OWNER_EMAIL = 'admin@antigravity.az';
const OWNER_PASSWORD = 'password';

const TEST_EMAIL = 'test@antigravity.az';
const TEST_PASSWORD = 'password';
const TEST_ROLE_NAME = 'Test Zero Perms';

async function main() {
    console.log('🚀 Starting User Provisioning...');

    // 1. Ensure Owner Role Exists
    const ownerRole = await prisma.role.findUnique({ where: { id: OWNER_ROLE_ID } });
    if (!ownerRole) {
        console.warn(`⚠️ Owner Role (${OWNER_ROLE_ID}) not found! Please seed the DB properly first.`);
        // We try to create it anyway as fallback or exit?
        // User implies it exists.
    } else {
        console.log(`✅ Found Owner Role: ${ownerRole.name}`);
    }

    // 2. Upsert Admin User
    const hashedPassword = await bcrypt.hash(OWNER_PASSWORD, 10);

    const adminUser = await prisma.user.upsert({
        where: { email: OWNER_EMAIL },
        update: {
            password: hashedPassword,
            isOwner: true,
            roles: {
                deleteMany: {}, // Clear existing roles
                create: {
                    roleId: OWNER_ROLE_ID
                }
            }
        },
        create: {
            email: OWNER_EMAIL,
            password: hashedPassword,
            name: 'System Admin',
            isOwner: true,
            roles: {
                create: {
                    roleId: OWNER_ROLE_ID
                }
            }
        }
    });

    console.log(`✅ Admin User Upserted: ${adminUser.email} (Password: ${OWNER_PASSWORD})`);

    // 3. Create Zero-Permission Test Role
    // 3. Create Zero-Permission Test Role (Manual Upsert)
    // Prisma upsert can fail on composite unique with nulls
    let testRole = await prisma.role.findFirst({
        where: {
            name: TEST_ROLE_NAME,
            tenantId: null
        }
    });

    if (testRole) {
        // Update: Remove all permissions
        await prisma.role.update({
            where: { id: testRole.id },
            data: {
                permissions: { deleteMany: {} }
            }
        });
    } else {
        // Create
        testRole = await prisma.role.create({
            data: {
                name: TEST_ROLE_NAME,
                description: 'Zero Permission Test Role',
                isSystem: true,
                status: 'ACTIVE',
                tenantId: null
            }
        });
    }

    // Workaround if upsert fails on composite null:
    // We can't easily upsert with null tenantId if schema says @@unique([tenantId, name]). 
    // Postgres treats NULL != NULL usually, but Prisma might handle it.
    // If undefined query, I'll fix.

    console.log(`✅ Test Role Ensured: ${testRole.name} (Permissions cleared)`);

    // 4. Upsert Test User
    const testUser = await prisma.user.upsert({
        where: { email: TEST_EMAIL },
        update: {
            password: hashedPassword,
            isOwner: false,
            roles: {
                deleteMany: {},
                create: {
                    roleId: testRole.id
                }
            }
        },
        create: {
            email: TEST_EMAIL,
            password: hashedPassword,
            name: 'Zero Perm User',
            isOwner: false,
            roles: {
                create: {
                    roleId: testRole.id
                }
            }
        }
    });

    console.log(`✅ Test User Upserted: ${testUser.email} (Password: ${TEST_PASSWORD})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
