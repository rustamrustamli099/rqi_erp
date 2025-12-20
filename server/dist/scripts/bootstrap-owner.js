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
require('dotenv').config();
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Bootstrapping System Owner...');
    const email = process.env.OWNER_EMAIL;
    const password = process.env.OWNER_PASSWORD;
    if (!email || !password) {
        console.error('❌ Missing OWNER_EMAIL or OWNER_PASSWORD in .env');
        process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    let systemTenant = await prisma.tenant.findUnique({ where: { slug: 'default' } });
    if (!systemTenant) {
        console.log('Creating System Tenant...');
        systemTenant = await prisma.tenant.create({
            data: {
                name: 'System Provider',
                slug: 'default',
                isSystem: true,
                type: 'PROVIDER'
            }
        });
    }
    console.log(`Upserting Owner: ${email}`);
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            isOwner: true,
            password: passwordHash,
            tenantId: systemTenant.id,
        },
        create: {
            email,
            password: passwordHash,
            fullName: 'System Owner',
            tenantId: systemTenant.id,
            isOwner: true,
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
//# sourceMappingURL=bootstrap-owner.js.map