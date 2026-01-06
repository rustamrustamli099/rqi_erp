
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('Checking permissions...');
    const slugsToCheck = [
        'system.approvals.forward',
        'system.approvals.reject',
        'system.approvals.export_to_excel',
        'system.file_manager.read',
        'system.system_guide.read',
        // Compliance
        'system.settings.security.user_rights.compliance.read',
        'system.settings.security.user_rights.compliance.download_report',
        'system.settings.security.user_rights.compliance.generate_evidence',
        'system.settings.security.user_rights.compliance.download_json_soc2',
        'system.settings.security.user_rights.compliance.download_json_iso',
        // Billing Config Updates
        'system.settings.system_configurations.billing_configurations.pricing.update',
        'system.settings.system_configurations.billing_configurations.limits.update',
        'system.settings.system_configurations.billing_configurations.overuse.update',
        'system.settings.system_configurations.billing_configurations.grace.update',
        'system.settings.system_configurations.billing_configurations.currency_tax.update',
        'system.settings.system_configurations.billing_configurations.invoice.update',
        'system.settings.system_configurations.billing_configurations.events.update',
        'system.settings.system_configurations.billing_configurations.security.update'
    ];

    const found = await prisma.permission.findMany({
        where: {
            slug: { in: slugsToCheck }
        }
    });

    console.log('Found permissions:', found.map(p => p.slug));
    const foundSlugs = new Set(found.map(p => p.slug));

    const missing = slugsToCheck.filter(s => !foundSlugs.has(s));
    console.log('MISSING permissions:', missing);

    if (missing.length > 0) {
        console.log('Attempting to create missing permissions manually...');
        for (const slug of missing) {
            try {
                await prisma.permission.create({
                    data: {
                        slug,
                        description: `Manual Fix: ${slug}`,
                        scope: 'SYSTEM',
                        module: 'fixing'
                    }
                });
                console.log(`Created ${slug}`);
            } catch (e) {
                console.error(`Failed to create ${slug}:`, e.message);
            }
        }
    }
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
