import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGISTRY_SLUGS = [
    'system.dashboard.read',
    'system.tenants.read',
    'system.branches.read',
    'system.users.users.read',
    'system.users.curators.read',
    'system.billing.marketplace.read',
    'system.billing.compact_packages.read',
    'system.billing.plans.read',
    'system.approvals.read',
    'system.file_manager.read',
    'system.system_guide.read',
    'system.settings.general.company_profile.read',
    'system.settings.communication.smtp_email.read',
    'system.settings.security.user_rights.role.read',
    'system.settings.system_configurations.dictionary.read',
    'system.system_console.dashboard.read',
    'system.system_console.monitoring.dashboard.read',
    'system.developer_hub.api_reference.read'
];

async function main() {
    let found = 0, missing = 0;
    const miss: string[] = [];

    for (const slug of REGISTRY_SLUGS) {
        const exists = await prisma.permission.findFirst({ where: { slug } });
        if (exists) { found++; console.log('✅', slug); }
        else { missing++; miss.push(slug); console.log('❌', slug); }
    }

    console.log(`\nFound: ${found} / Missing: ${missing}`);
    if (miss.length) console.log('Missing:', miss.join(', '));
}

main().finally(() => prisma.$disconnect());
