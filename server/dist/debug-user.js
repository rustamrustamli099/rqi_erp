"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkUser() {
    console.log('--- CHECKING USER PERMISSIONS ---');
    try {
        const email = 'qudret.rustem@gmail.com';
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                roles: { include: { role: true } }
            }
        });
        if (!user) {
            console.log(`User ${email} NOT FOUND.`);
            return;
        }
        console.log(`User Found: ${user.email}`);
        console.log(`isOwner (DB): ${user.isOwner}`);
        const roles = user.roles || [];
        console.log('Assigned Roles:', roles.map(r => r.role.name));
        const ownerRole = await prisma.role.findFirst({
            where: { name: 'Owner' }
        });
        if (ownerRole) {
            console.log(`\nFound Owner Role: ${ownerRole.id}`);
            const allPermissions = await prisma.permission.findMany();
            console.log(`Total Permissions in DB: ${allPermissions.length}`);
            const existingCount = await prisma.rolePermission.count({
                where: { roleId: ownerRole.id }
            });
            if (existingCount < allPermissions.length) {
                console.log(`Owner role has ${existingCount} permissions. Upgrading to SAP_ALL...`);
                await prisma.rolePermission.deleteMany({ where: { roleId: ownerRole.id } });
                await prisma.rolePermission.createMany({
                    data: allPermissions.map(p => ({
                        roleId: ownerRole.id,
                        permissionId: p.id,
                        createdBy: 'DEBUG_SCRIPT'
                    })),
                    skipDuplicates: true
                });
                console.log(`SUCCESS: Assigning permissions completed.`);
            }
            else {
                console.log('Owner Role already has full permissions.');
            }
        }
    }
    catch (err) {
        console.error("Script Error:", err);
    }
}
checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=debug-user.js.map