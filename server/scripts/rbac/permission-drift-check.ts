import { PrismaClient } from '@prisma/client';
import { PermissionSlugs } from '../../../client/src/app/security/permission-slugs';

// Initialize Prisma
const prisma = new PrismaClient();

// Flatten PermissionSlugs object into a list of strings
function flattenSlugs(obj: any): string[] {
    let slugs: string[] = [];
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            slugs.push(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            slugs = slugs.concat(flattenSlugs(obj[key]));
        }
    }
    return slugs;
}

async function main() {
    console.log('🔍 Starting Enterprise RBAC Drift Check...');
    let hasFailure = false;

    // 1. Get Canonical Slugs from Code
    const codeSlugs = new Set(flattenSlugs(PermissionSlugs));
    console.log(`📦 Code defines ${codeSlugs.size} unique permissions.`);

    // 2. Get DB Permissions
    const dbPermissions = await prisma.permission.findMany();
    const dbSlugs = new Set(dbPermissions.map(p => p.slug));
    console.log(`🗄️ Database contains ${dbSlugs.size} permissions.`);

    // 3. Compare: Missing in DB
    const missingInDb = [...codeSlugs].filter(slug => !dbSlugs.has(slug));
    if (missingInDb.length > 0) {
        console.error('❌ CRITICAL: The following permissions are used in code but MISSING in DB:');
        missingInDb.forEach(s => console.error(`   - ${s}`));
        hasFailure = true;
    } else {
        console.log('✅ Code vs DB: Sync OK.');
    }

    // 4. SQL Check: Roles with 0 Permissions
    const emptyRoles = await prisma.$queryRaw`
        SELECT r.id, r.name 
        FROM roles r 
        LEFT JOIN role_permissions rp ON rp."roleId" = r.id 
        WHERE rp."roleId" IS NULL
    ` as any[];

    if (emptyRoles.length > 0) {
        console.warn(`⚠️ WARNING: Found ${emptyRoles.length} roles with NO permissions:`);
        emptyRoles.forEach(r => console.warn(`   - Role: ${r.name} (ID: ${r.id})`));
        // Not a failure, but a warning
    } else {
        console.log('✅ All roles have at least one permission.');
    }

    // 5. SQL Check: Orphan Menu Items
    const orphanMenus = await prisma.$queryRaw`
        SELECT mi.id, mi.title, mi."permissionId"
        FROM menu_items mi
        LEFT JOIN permissions p ON p.id = mi."permissionId"
        WHERE mi."permissionId" IS NOT NULL AND p.id IS NULL
    ` as any[];

    if (orphanMenus.length > 0) {
        console.error(`❌ CRITICAL: Found ${orphanMenus.length} Orphan Menu Items (Linking to non-existent permissions):`);
        orphanMenus.forEach(m => console.error(`   - Menu: ${m.title} (PermID: ${m.permissionId})`));
        hasFailure = true;
    } else {
        console.log('✅ Menu Integrity OK.');
    }

    // 6. SQL Check: Namespace Drift
    const driftStats = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN slug LIKE 'platform.%' THEN 'platform'
            WHEN slug LIKE 'tenant.%' THEN 'tenant'
            WHEN slug LIKE 'admin_panel.%' THEN 'admin_panel'
            WHEN slug LIKE 'system:%' THEN 'system_colon'
            ELSE 'other'
          END as bucket,
          COUNT(*) as count
        FROM permissions
        GROUP BY bucket
    ` as any[];

    console.log('📊 Permission Namespace Stats:', driftStats);

    const badBuckets = driftStats.filter((s: any) =>
        ['admin_panel', 'system_colon', 'other'].includes(s.bucket)
    );

    if (badBuckets.length > 0) {
        console.warn('⚠️ WARNING: Detected Drifted Slugs (admin_panel, system:, etc). Plan migration!');
        // hasFailure = true; // Warn for now until migration complete
    } else {
        console.log('✅ Namespace Hygiene OK.');
    }


    console.log('---------------------------------------------------');
    if (hasFailure) {
        console.error('❌ Drift Check FAILED.');
        process.exit(1);
    } else {
        console.log('✅ Drift Check PASSED.');
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
