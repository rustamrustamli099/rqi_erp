"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const permission_slugs_1 = require("../../../client/src/app/security/permission-slugs");
const prisma = new client_1.PrismaClient();
function flattenSlugs(obj, prefix = '') {
    let slugs = [];
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            slugs.push(obj[key]);
        }
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
            slugs = slugs.concat(flattenSlugs(obj[key]));
        }
    }
    return slugs;
}
async function main() {
    console.log('🔍 Starting Permission Drift Check...');
    const codeSlugs = new Set(flattenSlugs(permission_slugs_1.PermissionSlugs));
    console.log(`📦 Code defines ${codeSlugs.size} unique permissions.`);
    const dbPermissions = await prisma.permission.findMany();
    const dbSlugs = new Set(dbPermissions.map(p => p.slug));
    console.log(`🗄️ Database contains ${dbSlugs.size} permissions.`);
    const missingInDb = [...codeSlugs].filter(slug => !dbSlugs.has(slug));
    const unknownInDb = [...dbSlugs].filter(slug => !codeSlugs.has(slug));
    console.log('---------------------------------------------------');
    if (missingInDb.length > 0) {
        console.error('❌ CRITICAL FAILURE: The following permissions are used in code but MISSING in DB:');
        missingInDb.forEach(s => console.error(`   - ${s}`));
        process.exit(1);
    }
    else {
        console.log('✅ All code permissions exist in DB.');
    }
    if (unknownInDb.length > 0) {
        console.warn('⚠️ WARNING: The following permissions exist in DB but are NOT defined in code (Ghost Permissions):');
        unknownInDb.forEach(s => console.warn(`   - ${s}`));
    }
    console.log('---------------------------------------------------');
    console.log('✅ Drift Check Passed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=permission-drift-check.js.map