// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Bootstrapping System Owner...');

    const email = process.env.OWNER_EMAIL;
    const password = process.env.OWNER_PASSWORD;

    if (!email || !password) {
        console.error('❌ Missing OWNER_EMAIL or OWNER_PASSWORD in .env');
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Ensure System Tenant
    let systemTenant = await prisma.tenant.findUnique({ where: { slug: 'default' } });
    if (!systemTenant) {
        console.log('Creating System Tenant...');
        systemTenant = await prisma.tenant.create({
            data: {
                name: 'System Provider',
                slug: 'default',
                isSystem: true,
                type: 'PROVIDER' // Assuming enum exists or will exist matching schema
            }
        });
    }

    // Upsert Owner User
    console.log(`Upserting Owner: ${email}`);

    // Check if user exists to preserve ID if possible, or just upsert
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            isOwner: true,
            password: passwordHash,
            tenantId: systemTenant.id,
            // roleId: null, // Clear usage of roleId
        },
        create: {
            email,
            password: passwordHash,
            fullName: 'System Owner',
            tenantId: systemTenant.id,
            isOwner: true,
            // roleId: null,
        }
    });

    console.log(`✅ Owner bootstrapped: ${user.email}`);
    console.log(`⚠️ NOTE: Ensure 'isOwner' migration is applied!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
