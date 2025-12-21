"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('👑 Seeding Owner Role and Permissions...');
    let ownerRole = await prisma.role.findFirst({
        where: { name: 'Owner', tenantId: null }
    });
    if (!ownerRole) {
        console.log('... Creating Owner Role');
        ownerRole = await prisma.role.create({
            data: {
                name: 'Owner',
                description: 'System Owner with full access',
                tenantId: null
            }
        });
    }
    else {
        console.log('... Owner Role found');
    }
    const allPermissions = await prisma.permission.findMany();
    console.log(`... Found ${allPermissions.length} permissions in DB`);
    if (allPermissions.length === 0) {
        console.error('❌ NO PERMISSIONS FOUND IN DB! Run seed.ts first.');
        process.exit(1);
    }
    console.log('... Assigning permissions to Owner...');
    await prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({
            where: { roleId: ownerRole.id }
        });
        const data = allPermissions.map(p => ({
            roleId: ownerRole.id,
            permissionId: p.id
        }));
        await tx.rolePermission.createMany({
            data: data,
            skipDuplicates: true
        });
    });
    console.log(`✅ Successfully assigned ${allPermissions.length} permissions to Owner role.`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-owner-role.js.map