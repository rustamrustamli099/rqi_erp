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
async function bootstrapSystem() {
    console.log('🚀 Bootstrapping System Tenant...');
    const existingSystem = await prisma.tenant.findFirst({
        where: { isSystem: true },
    });
    if (existingSystem) {
        console.log(`✅ System Tenant already exists: ${existingSystem.name} (${existingSystem.id})`);
        return;
    }
    console.log('⚙️ Creating System Tenant (PROVIDER)...');
    const systemTenant = await prisma.tenant.create({
        data: {
            name: 'Smart ERP Provider (System)',
            slug: 'system-provider',
            type: client_1.TenantType.PROVIDER,
            isSystem: true,
            status: 'ACTIVE',
            email: 'admin@smarterp.az',
            website: 'https://smarterp.az',
        },
    });
    console.log(`✅ Created System Tenant: ${systemTenant.id}`);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('Admin123!', salt);
    const adminEmail = 'superadmin@smarterp.az';
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingUser) {
        const adminUser = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                fullName: 'System Super Admin',
                tenantId: systemTenant.id,
            },
        });
        console.log(`✅ Created System Admin User: ${adminUser.email}`);
    }
    else {
        console.log(`⚠️ System Admin User ${adminEmail} already exists. Linking to System Tenant...`);
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { tenantId: systemTenant.id },
        });
    }
    console.log('🎉 System Bootstrap Complete!');
}
bootstrapSystem()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=bootstrap-system.js.map