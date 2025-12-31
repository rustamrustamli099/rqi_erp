// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// COMPLETE SLUGS - USER_RIGHTS WITH NEW SUBTABS
const SYSTEM_SLUGS = {
    DASHBOARD: { READ: 'system.dashboard.read' },
    TENANTS: { READ: 'system.tenants.read', CREATE: 'system.tenants.create', UPDATE: 'system.tenants.update', DELETE: 'system.tenants.delete', IMPERSONATE: 'system.tenants.impersonate', MANAGE: 'system.tenants.manage_subscription' },
    BRANCHES: { READ: 'system.branches.read', CREATE: 'system.branches.create', UPDATE: 'system.branches.update', DELETE: 'system.branches.delete' },
    USERS: { READ: 'system.users.users.read', CREATE: 'system.users.users.create', UPDATE: 'system.users.users.update', DELETE: 'system.users.users.delete', INVITE: 'system.users.users.invite', CONNECT_TO_EMPLOYEE: 'system.users.users.connect_to_employee' },
    CURATORS: { READ: 'system.users.curators.read', CREATE: 'system.users.curators.create', UPDATE: 'system.users.curators.update', DELETE: 'system.users.curators.delete' },

    // USER RIGHTS - NEW SEPARATED SUBTABS
    USER_RIGHTS: {
        ROLES: {
            READ: 'system.settings.security.user_rights.roles.read',
            CREATE: 'system.settings.security.user_rights.roles.create',
            UPDATE: 'system.settings.security.user_rights.roles.update',
            DELETE: 'system.settings.security.user_rights.roles.delete',
        },
        MATRIX_VIEW: {
            READ: 'system.settings.security.user_rights.matrix_view.read',
            UPDATE: 'system.settings.security.user_rights.matrix_view.update',
        },
        COMPLIANCE: {
            READ: 'system.settings.security.user_rights.compliance.read',
            DOWNLOAD_REPORT: 'system.settings.security.user_rights.compliance.download_report',
        }
    },

    AUDIT: { READ: 'system.audit_logs.read', EXPORT: 'system.audit_logs.export' },
    SETTINGS: {
        READ: 'system.settings.read', UPDATE: 'system.settings.update',
        GENERAL: {
            READ: 'system.settings.general.read',
            UPDATE: 'system.settings.general.update',
            COMPANY_PROFILE: 'system.settings.general.company_profile.read',
            NOTIFICATIONS: 'system.settings.general.notification_engine.read'
        },
        COMMUNICATION: {
            READ: 'system.settings.communication.read',
            MANAGE: 'system.settings.communication.update',
            SMTP_EMAIL: 'system.settings.communication.smtp_email.read',
            SMTP_SMS: 'system.settings.communication.smtp_sms.read'
        },
        SECURITY: {
            READ: 'system.settings.security.read',
            MANAGE: 'system.settings.security.update',
            // SECURITY POLICY SUB-TABS (SAP-GRADE)
            SECURITY_POLICY: {
                PASSWORD: {
                    READ: 'system.settings.security.security_policy.password.read',
                    UPDATE: 'system.settings.security.security_policy.password.update',
                },
                LOGIN: {
                    READ: 'system.settings.security.security_policy.login.read',
                    UPDATE: 'system.settings.security.security_policy.login.update',
                },
                SESSION: {
                    READ: 'system.settings.security.security_policy.session.read',
                    UPDATE: 'system.settings.security.security_policy.session.update',
                },
                RESTRICTIONS: {
                    READ: 'system.settings.security.security_policy.restrictions.read',
                    CREATE: 'system.settings.security.security_policy.restrictions.create',
                    UPDATE: 'system.settings.security.security_policy.restrictions.update',
                    DELETE: 'system.settings.security.security_policy.restrictions.delete',
                }
            },
            SSO_OAUTH: 'system.settings.security.sso_OAuth.read'
        },
        CONFIG: {
            READ: 'system.settings.system_configurations.read',
            MANAGE: 'system.settings.system_configurations.update',
            BILLING: {
                PRICING: 'system.settings.system_configurations.billing_configurations.pricing.read',
                LIMITS: 'system.settings.system_configurations.billing_configurations.limits.read',
                OVERUSE: 'system.settings.system_configurations.billing_configurations.overuse.read',
                GRACE: 'system.settings.system_configurations.billing_configurations.grace.read',
                CURRENCY_TAX: 'system.settings.system_configurations.billing_configurations.currency_tax.read',
                INVOICE: 'system.settings.system_configurations.billing_configurations.invoice.read',
                EVENTS: 'system.settings.system_configurations.billing_configurations.events.read',
                SECURITY: 'system.settings.system_configurations.billing_configurations.security.read'
            },
            DICTIONARIES: {
                READ: 'system.settings.system_configurations.dictionary.read',
                SECTORS: 'system.settings.system_configurations.dictionary.sectors.read',
                UNITS: 'system.settings.system_configurations.dictionary.units.read',
                CURRENCIES: 'system.settings.system_configurations.dictionary.currencies.read',
                TIME_ZONES: 'system.settings.system_configurations.dictionary.time_zones.read',
                ADDRESSES: {
                    READ_COUNTRY: 'system.settings.system_configurations.dictionary.addresses.read_country',
                    READ_CITY: 'system.settings.system_configurations.dictionary.addresses.read_city',
                    READ_DISTRICT: 'system.settings.system_configurations.dictionary.addresses.read_district'
                }
            },
            TEMPLATES: 'system.settings.system_configurations.document_templates.read',
            WORKFLOW: {
                CONFIG: 'system.settings.system_configurations.workflow.configuration.read',
                CONTROL: 'system.settings.system_configurations.workflow.control.read'
            }
        }
    },
    BILLING: { READ: 'system.billing.read', MARKETPLACE: { READ: 'system.billing.market_place.read', MANAGE: 'system.billing.market_place.create' }, PACKAGES: { READ: 'system.billing.compact_packages.read', MANAGE: 'system.billing.compact_packages.create' }, PLANS: { READ: 'system.billing.plans.read', MANAGE: 'system.billing.plans.create' }, INVOICES: { READ: 'system.billing.invoices.read', APPROVE: 'system.billing.invoices.approve' }, LICENSES: { READ: 'system.billing.licenses.read', MANAGE: 'system.billing.licenses.change_plan' } },
    CONSOLE: {
        READ: 'system.system_console.read',
        DASHBOARD: 'system.system_console.dashboard.read',
        MONITORING: {
            DASHBOARD: 'system.system_console.monitoring.dashboard.read',
            ALERT_RULES: 'system.system_console.monitoring.alert_rules.read',
            ANOMALY_DETECTION: 'system.system_console.monitoring.anomaly_detection.read',
            SYSTEM_LOGS: 'system.system_console.monitoring.system_logs.read'
        },
        AUDIT: { READ: 'system.system_console.audit_compliance.read', MANAGE: 'system.system_console.audit_compliance.export_to_excel' },
        SCHEDULER: { READ: 'system.system_console.job_scheduler.read', EXECUTE: 'system.system_console.job_scheduler.execute' },
        RETENTION: { READ: 'system.system_console.data_retention.read', MANAGE: 'system.system_console.data_retention.manage' },
        FEATURES: { READ: 'system.system_console.feature_flags.read', MANAGE: 'system.system_console.feature_flags.manage' },
        POLICY: 'system.system_console.policy_security.read',
        FEEDBACK: 'system.system_console.feedback.read',
        TOOLS: { READ: 'system.system_console.tools.read', EXECUTE: 'system.system_console.tools.execute' }
    },
    DEVELOPER: { READ: 'system.developer_hub.read', API: 'system.developer_hub.api_reference.read', SDK: 'system.developer_hub.sdk.read', WEBHOOKS: { READ: 'system.developer_hub.webhooks.read', MANAGE: 'system.developer_hub.webhooks.send_test_payload' }, PERM_MAP: 'system.developer_hub.permission_map.read' },
    FILES: { READ: 'system.file_manager.read', UPLOAD: 'system.file_manager.upload', DELETE: 'system.file_manager.delete_file' },
    GUIDE: { READ: 'system.system_guide.read', EDIT: 'system.system_guide.edit', MANAGE: 'system.system_guide.create' },
    APPROVALS: { READ: 'system.approvals.read', APPROVE: 'system.approvals.approve' }
};

const TENANT_SLUGS = {
    DASHBOARD: { READ: 'tenant.dashboard.read' },
    USERS: { READ: 'tenant.users.read', CREATE: 'tenant.users.create', MANAGE: 'tenant.users.update' },
    ROLES: { READ: 'tenant.roles.read', CREATE: 'tenant.roles.create', UPDATE: 'tenant.roles.update', DELETE: 'tenant.roles.delete' },
    MATRIX_VIEW: { READ: 'tenant.matrix_view.read', UPDATE: 'tenant.matrix_view.update' },
    SETTINGS: { READ: 'tenant.settings.read', UPDATE: 'tenant.settings.update', MANAGE: 'tenant.settings.update' },
    BILLING: { READ: 'tenant.billing.read', PAY: 'tenant.billing.pay_invoice' },
    REPORTS: { READ: 'tenant.reports.read', EXPORT: 'tenant.reports.export' }
};

const IAM_SLUGS = { ROLE: { SUBMIT: 'system.user_rights.roles.submit', APPROVE: 'system.user_rights.roles.approve', REJECT: 'system.user_rights.roles.reject' } };
const LEGACY_MAP = { 'tenants.create': SYSTEM_SLUGS.TENANTS.CREATE };

async function main() {
    console.log('🚀 Starting Permission Seed V5 (NEW SUBTABS)...');

    console.log('🗑️ Wiping existing permissions...');
    await prisma.rolePermission.deleteMany({});
    await prisma.permission.deleteMany({});

    const flattenSlugs = (obj: any): { slug: string; scope: string, module: string }[] => {
        let results: { slug: string; scope: string, module: string }[] = [];
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                const slug = obj[key];
                const scope = slug.startsWith('tenant.') ? 'TENANT' : 'SYSTEM';
                const parts = slug.split('.');
                const module = parts.length > 1 ? parts[1] : 'general';
                results.push({ slug, scope, module });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                results = results.concat(flattenSlugs(obj[key]));
            }
        }
        return results;
    };

    const systemPerms = flattenSlugs(SYSTEM_SLUGS);
    const tenantPerms = flattenSlugs(TENANT_SLUGS);
    const iamPerms = flattenSlugs(IAM_SLUGS);

    const allPermissions = [
        ...systemPerms, ...tenantPerms, ...iamPerms,
        ...Object.keys(LEGACY_MAP).map(k => ({ slug: k, scope: 'SYSTEM', module: 'legacy' }))
    ];

    const uniquePermissions = Array.from(new Set(allPermissions.map(p => p.slug)))
        .map(slug => allPermissions.find(p => p.slug === slug)!);

    console.log(`📝 Found ${uniquePermissions.length} unique permissions definitions.`);

    console.log('💾 Inserting permissions into DB...');
    await prisma.permission.createMany({
        data: uniquePermissions.map(p => ({ slug: p.slug, description: `Auto: ${p.slug}`, scope: p.scope, module: p.module })),
        skipDuplicates: true
    });

    console.log('🔍 Fetching inserted permission IDs...');
    const dbPermissions = await prisma.permission.findMany();
    const slugToId: Record<string, string> = {};
    for (const perm of dbPermissions) {
        slugToId[perm.slug] = perm.id;
    }
    console.log(`📦 Fetched ${dbPermissions.length} permissions from DB.`);

    console.log('👑 Assigning SYSTEM permissions to "Owner" roles...');
    const systemOwners = await prisma.role.findMany({ where: { name: 'Owner', scope: 'SYSTEM' } });

    for (const role of systemOwners) {
        const permsToAssign = uniquePermissions
            .filter(p => slugToId[p.slug])
            .map(p => ({ roleId: role.id, permissionId: slugToId[p.slug] }));

        if (permsToAssign.length > 0) {
            await prisma.rolePermission.createMany({ data: permsToAssign, skipDuplicates: true });
            console.log(`   ✅ Assigned ${permsToAssign.length} perms to System Owner: ${role.name}`);
        }
    }

    console.log('🏢 Assigning TENANT permissions to Tenant Owners/Admins...');
    const tenantRoles = await prisma.role.findMany({ where: { scope: 'TENANT', name: { in: ['Owner', 'Admin'] } } });
    console.log(`Found ${tenantRoles.length} Tenant Admin/Owner roles.`);
    const tenantOnlyPerms = uniquePermissions.filter(p => p.scope === 'TENANT');

    for (const role of tenantRoles) {
        const permsToAssign = tenantOnlyPerms
            .filter(p => slugToId[p.slug])
            .map(p => ({ roleId: role.id, permissionId: slugToId[p.slug] }));

        if (permsToAssign.length > 0) {
            await prisma.rolePermission.createMany({ data: permsToAssign, skipDuplicates: true });
            console.log(`   ✅ Assigned ${permsToAssign.length} perms to Tenant Role: ${role.name}`);
        }
    }

    console.log('✅ Seed V5 Completed Successfully!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
