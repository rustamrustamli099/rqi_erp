
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =================================================================================================
// DATA DEFINITIONS (Inlined to avoid import issues)
// =================================================================================================

import { admin_panel_permissions } from '../src/platform/auth/permission.service';

const platform_permissions = admin_panel_permissions;


const tenant_permissions = {
    dashboard: { perms: ['view'] },
    users: { perms: ['read', 'manage'] },
    settings: { perms: ['read', 'manage'] },
};

const ADMIN_MENU_TREE = [{
    id: 'dashboard',
    label: 'İdarə etmə paneli',
    icon: 'LayoutDashboard',
    path: '/admin/dashboard',
    permission: 'system.dashboard.view'
},
{
    id: 'tenants',
    label: 'Tenantlar',
    icon: 'Building2',
    path: '/admin/tenants',
    permission: 'system.tenants.view'
},
{
    id: 'branches',
    label: 'Filiallar',
    icon: 'GitBranch',
    path: '/admin/branches',
    permission: 'system.branches.view'
},
{
    id: 'users_group',
    label: 'İstifadəçilər',
    icon: 'Users',
    permission: 'system.users.users.view',
    children: [{
        id: 'users',
        label: 'İstifadəçilər',
        path: '/admin/users?tab=users',
        permission: 'system.users.users.view'
    },
    {
        id: 'curators',
        label: 'Kuratorlar',
        path: '/admin/users?tab=curators',
        permission: 'system.users.curators.view'
    }
    ]
},
{
    id: 'billing',
    label: 'Bilinq',
    icon: 'CreditCard',
    path: '/admin/billing',
    permission: 'system.billing.view',
    children: [{
        id: 'market_place',
        label: 'Marketplace',
        path: '/admin/billing?tab=market_place',
        permission: 'system.billing.market_place.read'
    }, // Keeping read if view not explicit in map, but map has view. Let used view.
    {
        id: 'compact_packages',
        label: 'Kompakt Paketlər',
        path: '/admin/billing?tab=packages',
        permission: 'system.billing.compact_packages.read'
    },
    {
        id: 'plans',
        label: 'Planlar',
        path: '/admin/billing?tab=plans',
        permission: 'system.billing.plans.read'
    },
    {
        id: 'invoices',
        label: 'Fakturalar',
        path: '/admin/billing?tab=invoices',
        permission: 'system.billing.invoices.read'
    },
    {
        id: 'licenses',
        label: 'Lisenziyalar',
        path: '/admin/billing?tab=licenses',
        permission: 'system.billing.licenses.read'
    },
    ]
},
{
    id: 'approvals',
    label: 'Təsdiqləmələr',
    icon: 'CheckSquare',
    path: '/admin/approvals',
    permission: 'system.approvals.view'
},
{
    id: 'files',
    label: 'Fayl Meneceri',
    icon: 'Folder',
    path: '/admin/files',
    permission: 'system.file_manager.view'
},
{
    id: 'guide',
    label: 'Sistem Bələdçisi',
    icon: 'BookOpen',
    path: '/admin/guide',
    permission: 'system.system_guide.view'
},
{
    id: 'settings',
    label: 'Tənzimləmələr',
    icon: 'Settings',
    path: '/admin/settings',
    permission: 'system.settings.view',
    children: [{
        id: 'general',
        label: 'Ümumi',
        icon: 'Sliders',
        permission: 'system.settings.general.view',
        children: [ // Groups need view
            {
                id: 'company_profile',
                label: 'Şirkət Profili',
                path: '/admin/settings?tab=general',
                permission: 'system.settings.general.company_profile.view'
            },
            {
                id: 'notification_engine',
                label: 'Bildiriş Mühərriki',
                path: '/admin/settings?tab=notifications',
                permission: 'system.settings.general.notification_engine.view'
            },
        ]
    },
    {
        id: 'communication',
        label: 'Kommunikasiya',
        icon: 'MessageSquare',
        permission: 'system.settings.communication.view',
        children: [{
            id: 'smtp_email',
            label: 'SMTP Email',
            path: '/admin/settings?tab=smtp',
            permission: 'system.settings.communication.smtp_email.view'
        },
        {
            id: 'smtp_sms',
            label: 'SMS Gateway',
            path: '/admin/settings?tab=sms',
            permission: 'system.settings.communication.smtp_sms.view'
        },
        ]
    },
    {
        id: 'security',
        label: 'Təhlükəsizlik',
        icon: 'Shield',
        permission: 'system.settings.security.view',
        children: [{
            id: 'policies',
            label: 'Siyasətlər',
            path: '/admin/settings?tab=security',
            permission: 'system.settings.security.security_policy.global_policy.view'
        },
        {
            id: 'sso',
            label: 'SSO & OAuth',
            path: '/admin/settings?tab=sso',
            permission: 'system.settings.security.sso_OAuth.view'
        },
        {
            id: 'rights',
            label: 'İstifadəçi Hüquqları',
            path: '/admin/settings?tab=roles',
            permission: 'system.settings.security.user_rights.role.view'
        },
        ]
    },
    {
        id: 'system_config',
        label: 'Sistem Konfiqurasiyası',
        icon: 'Database',
        permission: 'system.settings.system_configurations.view',
        children: [{
            id: 'billing_config',
            label: 'Bilinq Ayarları',
            path: '/admin/settings?tab=billing_config',
            permission: 'system.settings.system_configurations.billing_configurations.price_rules.view'
        },
        {
            id: 'dictionaries',
            label: 'Soraqçalar',
            icon: 'Book',
            permission: 'system.settings.system_configurations.dictionary.view',
            children: [{
                id: 'sectors',
                label: 'Sektorlar',
                path: '/admin/settings?tab=dictionaries&entity=sectors',
                permission: 'system.settings.system_configurations.dictionary.sectors.view'
            },
            {
                id: 'units',
                label: 'Ölçü Vahidləri',
                path: '/admin/settings?tab=dictionaries&entity=units',
                permission: 'system.settings.system_configurations.dictionary.units.view'
            },
            {
                id: 'currencies',
                label: 'Valyutalar',
                path: '/admin/settings?tab=dictionaries&entity=currencies',
                permission: 'system.settings.system_configurations.dictionary.currencies.view'
            },
            {
                id: 'time_zones',
                label: 'Saat Qurşaqları',
                path: '/admin/settings?tab=dictionaries&entity=time_zones',
                permission: 'system.settings.system_configurations.dictionary.time_zones.view'
            },
            {
                id: 'addresses',
                label: 'Ünvanlar',
                permission: 'system.settings.system_configurations.dictionary.addresses.view',
                children: [ // Corrected to view
                    {
                        id: 'country',
                        label: 'Ölkələr',
                        path: '/admin/settings?tab=dictionaries&entity=country',
                        permission: 'system.settings.system_configurations.dictionary.addresses.country.view'
                    },
                    {
                        id: 'city',
                        label: 'Şəhərlər',
                        path: '/admin/settings?tab=dictionaries&entity=city',
                        permission: 'system.settings.system_configurations.dictionary.addresses.city.view'
                    },
                    {
                        id: 'district',
                        label: 'Rayonlar',
                        path: '/admin/settings?tab=dictionaries&entity=district',
                        permission: 'system.settings.system_configurations.dictionary.addresses.district.view'
                    },
                ]
            }
            ]
        },
        {
            id: 'templates',
            label: 'Sənəd Şablonları',
            path: '/admin/settings?tab=templates',
            permission: 'system.settings.system_configurations.document_templates.view'
        },
        {
            id: 'workflow',
            label: 'Workflow',
            path: '/admin/settings?tab=workflow',
            permission: 'system.settings.system_configurations.workflow.configuration.view'
        },
        ]
    }
    ]
},
{
    id: 'system_console',
    label: 'Sistem Konsolu',
    icon: 'Terminal',
    permission: 'system.system_console.view',
    children: [{
        id: 'console_dash',
        label: 'Dashboard',
        path: '/admin/console?tab=dashboard',
        permission: 'system.system_console.dashboard.view'
    },
    {
        id: 'monitoring',
        label: 'Monitoring',
        path: '/admin/console?tab=monitoring',
        permission: 'system.system_console.monitoring.dashboard.view'
    },
    {
        id: 'audit',
        label: 'Audit & Compliance',
        path: '/admin/console?tab=audit',
        permission: 'system.system_console.audit_compliance.view'
    },
    {
        id: 'scheduler',
        label: 'Job Scheduler',
        path: '/admin/console?tab=scheduler',
        permission: 'system.system_console.job_scheduler.view'
    },
    {
        id: 'retention',
        label: 'Data Retention',
        path: '/admin/console?tab=retention',
        permission: 'system.system_console.data_retention.view'
    },
    {
        id: 'feature_flags',
        label: 'Feature Flags',
        path: '/admin/console?tab=feature_flags',
        permission: 'system.system_console.feature_flags.view'
    },
    {
        id: 'policy_security',
        label: 'Policy Security',
        path: '/admin/console?tab=policy',
        permission: 'system.system_console.policy_security.view'
    },
    {
        id: 'feedback',
        label: 'Feedback',
        path: '/admin/console?tab=feedback',
        permission: 'system.system_console.feedback.view'
    },
    {
        id: 'tools',
        label: 'Tools',
        path: '/admin/console?tab=tools',
        permission: 'system.system_console.tools.view'
    },
    ]
},
{
    id: 'developer_hub',
    label: 'Developer Hub',
    icon: 'Code',
    permission: 'system.developer_hub.view',
    children: [{
        id: 'api',
        label: 'API Reference',
        path: '/admin/developer?tab=api',
        permission: 'system.developer_hub.api_reference.view'
    },
    {
        id: 'sdk',
        label: 'SDKs',
        path: '/admin/developer?tab=sdk',
        permission: 'system.developer_hub.sdk.view'
    },
    {
        id: 'webhooks',
        label: 'Webhooks',
        path: '/admin/developer?tab=webhooks',
        permission: 'system.developer_hub.webhooks.view'
    },
    {
        id: 'perm_map',
        label: 'Permission Map',
        path: '/admin/developer?tab=permissions',
        permission: 'system.developer_hub.permission_map.view'
    },
    ]
},
];


// =================================================================================================
// HELPERS
// =================================================================================================

function flattenPermissions(obj: any, prefix: string = 'platform'): string[] {
    let slugs: string[] = [];
    for (const key in obj) {
        if (key === 'perms' && Array.isArray(obj[key])) {
            obj[key].forEach((action: string) => {
                slugs.push(`${prefix}.${action}`);
            });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const nextPrefix = prefix ? `${prefix}.${key}` : key;
            slugs = slugs.concat(flattenPermissions(obj[key], nextPrefix));
        }
    }
    return slugs;
}

function generateNameFromSlug(slug: string): string {
    // Example: admin_panel.settings.general.read -> Settings General Read
    // Remove 'admin_panel' prefix for cleaner names if desired, or keep it.
    // Let's keep it but format nicely.
    return slug
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).replace(/_/g, ' '))
        .join(' - ');
}

// =================================================================================================
// MAIN
// =================================================================================================

async function main() {
    console.log('🚀 Starting Database Seed...');

    // 1. Clean Permissions and Menus (Safety)
    console.log('🧹 Cleaning Permissions and Menus...');
    // Unlink permissions from MenuItems
    await prisma.menuItem.updateMany({ where: { permissionId: { not: null } }, data: { permissionId: null } });

    // Clear Relations
    await prisma.rolePermission.deleteMany({});

    // Clear Menus
    await prisma.menuItem.deleteMany({});
    await prisma.menu.deleteMany({});

    // 2. Seed Permissions
    console.log('🌱 Seeding Permissions...');
    const platformSlugs = flattenPermissions(platform_permissions, 'system');
    const tenantSlugs = flattenPermissions(tenant_permissions, 'tenant');
    const allSlugs = Array.from(new Set([...platformSlugs, ...tenantSlugs]));
    const permissionMap = new Map<string, string>();

    for (const slug of allSlugs) {
        const name = generateNameFromSlug(slug);
        const module = slug.split('.')[1] || 'general';
        const scope = slug.startsWith('tenant.') ? 'TENANT' : 'SYSTEM';

        const perm = await prisma.permission.upsert({
            where: { slug },
            update: { name, module, scope },
            create: { slug, name, module, scope }
        });
        permissionMap.set(slug, perm.id);
    }
    console.log(`✅ Seeded ${allSlugs.length} permissions.`);

    // SAP-Grade Drift Check: Remove Orphaned Permissions
    console.log('⚖️ Checking for Permission Drift...');
    const allDbPermissions = await prisma.permission.findMany({ select: { slug: true } });
    const codeSlugs = new Set(allSlugs);
    const orphans = allDbPermissions.filter(p => !codeSlugs.has(p.slug));

    if (orphans.length > 0) {
        console.warn(`⚠️ Found ${orphans.length} orphaned permissions in DB (not in code). Deleting...`);
        const orphanSlugs = orphans.map(p => p.slug);
        await prisma.permission.deleteMany({
            where: { slug: { in: orphanSlugs } }
        });
        console.log(`🗑️ Deleted orphaned permissions: ${orphanSlugs.join(', ')}`);
    } else {
        console.log('✅ No permission drift detected.');
    }

    // 3. Seed Roles
    console.log('👑 Seeding Roles...');
    const ownerRoleName = 'Owner';
    let ownerRole = await prisma.role.findFirst({
        where: { name: ownerRoleName, tenantId: null }
    });

    if (!ownerRole) {
        ownerRole = await prisma.role.create({
            data: {
                name: ownerRoleName,
                description: 'System Owner (Full Access)',
                isSystem: true,
                tenantId: null
            }
        });
    }
    console.log(`✅ Owner Role ID: ${ownerRole.id}`);

    // 4. Assign All Permissions to Owner
    console.log('🔗 Assigning permissions to Owner...');
    const rolePermissionsData = allSlugs.map(slug => ({
        roleId: ownerRole.id,
        permissionId: permissionMap.get(slug)!
    }));

    // Use createMany (skipDuplicates supported in recent Prisma versions for some DBs, else use loop if paranoid)
    // Postgres supports createMany.
    await prisma.rolePermission.createMany({
        data: rolePermissionsData,
        skipDuplicates: true
    });
    console.log('✅ Permissions assigned to Owner.');

    // 5. Seed Menus
    console.log('Navigation: Seeding Menus...');

    const platformSidebar = await prisma.menu.create({
        data: { name: 'Platform Sidebar', slug: 'platform_sidebar' }
    });

    async function seedMenuItems(items: any[], parentId: string | null = null, menuId: string) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Resolve permission ID if present
            let permId: string | null = null;
            if (item.permission) {
                const foundId = permissionMap.get(item.permission);
                if (foundId) {
                    permId = foundId;
                } else {
                    console.warn(`⚠️ Warning: Permission '${item.permission}' for menu '${item.label}' not found in DB.`);
                }
            }

            const createdItem = await prisma.menuItem.create({
                data: {
                    menuId: menuId,
                    parentId: parentId,
                    title: item.label,
                    icon: item.icon,
                    path: item.path,
                    order: i,
                    permissionId: permId
                }
            });

            if (item.children && item.children.length > 0) {
                await seedMenuItems(item.children, createdItem.id, menuId);
            }
        }
    }

    await seedMenuItems(ADMIN_MENU_TREE, null, platformSidebar.id);
    console.log('✅ Menu tree seeded.');


    // 6. Fix User Access
    console.log('🔧 Fixing User Access...');
    const ownerUsers = await prisma.user.findMany({ where: { isOwner: true } });

    for (const u of ownerUsers) {
        console.log(`... Updating user ${u.email} to have Owner role`);

        // Update legacy roleId (REMOVED: Field no longer exists in Schema)
        /*
        await prisma.user.update({
            where: { id: u.id },
            data: { roleId: ownerRole.id }
        });
        */

        // Add to UserRole table if not exists
        // Check first
        const existingAssignment = await prisma.userRole.findFirst({
            where: {
                userId: u.id,
                roleId: ownerRole.id
            }
        });

        if (!existingAssignment) {
            await prisma.userRole.create({
                data: {
                    userId: u.id,
                    roleId: ownerRole.id,
                    tenantId: u.tenantId // Scope to their tenant or null for system? 
                    // Usually Owner is cross-tenant but if scoped to a tenant, keep it.
                }
            });
        }
    }
    console.log(`✅ Updated ${ownerUsers.length} owner users.`);

    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
