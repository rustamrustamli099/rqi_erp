
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting migration of legacy roles...');

    const users = await prisma.user.findMany({
        where: {
            roleId: { not: null },
        },
    });

    console.log(`Found ${users.length} users with legacy roles.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
        if (!user.roleId) continue;

        // Check if mapping already exists using findFirst to avoid unique constraint type issues
        const existing = await prisma.userRole.findFirst({
            where: {
                userId: user.id,
                roleId: user.roleId,
                tenantId: user.tenantId
            }
        });

        if (existing) {
            skippedCount++;
            continue;
        }

        try {
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: user.roleId,
                    tenantId: user.tenantId,
                    assignedBy: 'MIGRATION_SCRIPT'
                }
            });
            migratedCount++;
        } catch (error) {
            console.error(`Failed to migrate user ${user.id}:`, error);
        }
    }

    const logMessage = `[${new Date().toISOString()}] Migration Result: Migrated: ${migratedCount}, Skipped: ${skippedCount}`;
    console.log(`✅ Migration complete.`);
    console.log(logMessage);

    // Simple Audit Log
    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    fs.appendFileSync(path.join(logDir, 'migration_audit.log'), logMessage + '\n');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
