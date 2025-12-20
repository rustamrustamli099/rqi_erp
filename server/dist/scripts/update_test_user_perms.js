"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const ROLE_ID = '46039a46-6fad-4772-80b3-a25aa56f6de4';
const TARGET_PERMISSIONS = [
    { slug: 'admin_panel.dashboard.read', description: 'View Dashboard' },
    { slug: 'admin_panel.settings.read', description: 'View Settings Page' },
    { slug: 'admin_panel.settings.general.company_profile.read', description: 'View Company Profile' },
    { slug: 'admin_panel.settings.communication.smtp_sms.read', description: 'View SMS Settings' },
    { slug: 'admin_panel.settings.system_configurations.dictionary.sectors.read', description: 'View Sectors Dictionary' }
];
async function main() {
    console.log(`Updating permissions for Role: ${ROLE_ID}`);
    for (const p of TARGET_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                slug: p.slug,
                description: p.description,
                module: 'SYSTEM'
            }
        });
        console.log(`Ensured permission: ${p.slug}`);
    }
    console.log(`Clearing existing permissions for Role: ${ROLE_ID}`);
    await prisma.rolePermission.deleteMany({
        where: { roleId: ROLE_ID }
    });
    for (const p of TARGET_PERMISSIONS) {
        const perm = await prisma.permission.findUnique({ where: { slug: p.slug } });
        if (!perm)
            continue;
        try {
            await prisma.rolePermission.create({
                data: {
                    roleId: ROLE_ID,
                    permissionId: perm.id
                }
            });
            console.log(`Added ${p.slug} to Role`);
        }
        catch (e) {
            console.log(`Permission ${p.slug} already exists on Role (or error)`);
        }
    }
    const TEST_USER_EMAIL = 'testuser@rqi.az';
    const hashedPassword = await bcrypt.hash('password123', 10);
    try {
        await prisma.user.delete({ where: { email: TEST_USER_EMAIL } });
        console.log(`Deleted existing user ${TEST_USER_EMAIL}`);
    }
    catch {
    }
    const user = await prisma.user.create({
        data: {
            email: TEST_USER_EMAIL,
            password: hashedPassword,
            name: 'Test User',
            roleId: ROLE_ID,
        }
    });
    try {
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: ROLE_ID
            }
        });
        console.log(`Assigned Role ${ROLE_ID} to User ${TEST_USER_EMAIL} (Multi-Role table)`);
    }
    catch {
        console.log(`User ${TEST_USER_EMAIL} already has Role ${ROLE_ID} in Multi-Role table`);
    }
    console.log('Update Complete.');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=update_test_user_perms.js.map