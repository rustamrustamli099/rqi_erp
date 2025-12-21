"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const role_presets_1 = require("./src/platform/auth/role-presets");
const permissions_1 = require("./src/platform/auth/permissions");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding Roles and Permissions...');
    const allPermissions = Object.values(permissions_1.PermissionRegistry).flatMap(group => Object.values(group));
    for (const slug of allPermissions) {
        const module = slug.split('.')[0];
        await prisma.permission.upsert({
            where: { slug },
            update: { module },
            create: { slug, module, description: `Permission to ${slug}` }
        });
    }
    console.log('✅ Permissions synced.');
    for (const [key, preset] of Object.entries(role_presets_1.RolePresets.SYSTEM)) {
        await upsertRole(preset.name, preset.description, preset.permissions, true);
    }
    for (const [key, preset] of Object.entries(role_presets_1.RolePresets.TENANT)) {
        await upsertRole(preset.name, preset.description, preset.permissions, false);
    }
    console.log('✅ Roles synced.');
}
async function upsertRole(name, description, permissionSlugs, isSystem) {
    const existingRole = await prisma.role.findFirst({
        where: {
            name: name,
            tenantId: null
        }
    });
    let role;
    if (existingRole) {
        role = await prisma.role.update({
            where: { id: existingRole.id },
            data: { description, isSystem }
        });
    }
    else {
        role = await prisma.role.create({
            data: {
                name,
                description,
                isSystem,
                tenantId: null
            }
        });
    }
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const perms = await prisma.permission.findMany({ where: { slug: { in: permissionSlugs } } });
    if (perms.length > 0) {
        await prisma.rolePermission.createMany({
            data: perms.map(p => ({
                roleId: role.id,
                permissionId: p.id
            }))
        });
    }
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-roles.js.map