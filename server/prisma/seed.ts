
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =================================================================================================
// DATA DEFINITIONS (Inlined to avoid import issues)
// =================================================================================================

const platform_permissions = {
    dashboard: { perms: ['view'] },
    tenants: { perms: ['read', 'create', 'update', 'delete'] },
    branches: { perms: ['read', 'create', 'update', 'delete'] },
    users: {
        users: { perms: ['read', 'create', 'update', 'delete'] },
        curators: { perms: ['read', 'create', 'update', 'delete'] },
    },
    billing: {
        perms: ['read'],
        marketplace: { perms: ['read', 'manage'] },
        packages: { perms: ['read', 'manage'] },
        plans: { perms: ['read', 'manage'] },
        invoices: { perms: ['read', 'approve'] },
        licenses: { perms: ['read', 'manage'] },
    },
    approvals: { perms: ['view', 'approve'] },
    files: { perms: ['read', 'upload', 'delete'] },
    guide: { perms: ['read', 'manage'] },
    settings: {
        perms: ['read'],
        general: { perms: ['read', 'update'] },
        communication: { perms: ['read', 'manage'] },
        security: { perms: ['read', 'manage'] },
        config: { perms: ['read', 'manage'] },
    },
    console: {
        perms: ['read'],
        dashboard: { perms: ['read'] },
        audit: { perms: ['read', 'manage'] },
        scheduler: { perms: ['read', 'execute'] },
        retention: { perms: ['read', 'manage'] },
        features: { perms: ['read', 'manage'] },
        tools: { perms: ['read', 'execute'] },
    },
    dev: {
        perms: ['read'],
        api: { perms: ['read'] },
        sdk: { perms: ['read'] },
        webhooks: { perms: ['read', 'manage'] },
    },
};

const ADMIN_MENU_TREE = [
    { id: 'dashboard', label: 'İdarə etmə paneli', icon: 'LayoutDashboard', path: '/admin/dashboard', permission: 'platform.dashboard.view' },
    { id: 'tenants', label: 'Tenantlar', icon: 'Building2', path: '/admin/tenants', permission: 'platform.tenants.read' },
    { id: 'branches', label: 'Filiallar', icon: 'GitBranch', path: '/admin/branches', permission: 'platform.branches.read' },
    {
        id: 'users_group', label: 'İstifadəçilər', icon: 'Users', children: [
            { id: 'users', label: 'İstifadəçilər', path: '/admin/users?tab=users', permission: 'platform.users.users.read' },
            { id: 'curators', label: 'Kuratorlar', path: '/admin/users?tab=curators', permission: 'platform.users.curators.read' }
        ]
    },
    {
        id: 'billing', label: 'Bilinq', icon: 'CreditCard', children: [
            { id: 'market_place', label: 'Marketplace', path: '/admin/billing?tab=market_place', permission: 'platform.billing.marketplace.read' },
            { id: 'compact_packages', label: 'Kompakt Paketlər', path: '/admin/billing?tab=packages', permission: 'platform.billing.packages.read' },
            { id: 'plans', label: 'Planlar', path: '/admin/billing?tab=plans', permission: 'platform.billing.plans.read' },
            { id: 'invoices', label: 'Fakturalar', path: '/admin/billing?tab=invoices', permission: 'platform.billing.invoices.read' },
            { id: 'licenses', label: 'Lisenziyalar', path: '/admin/billing?tab=licenses', permission: 'platform.billing.licenses.read' },
        ]
    },
    { id: 'approvals', label: 'Təsdiqləmələr', icon: 'CheckSquare', path: '/admin/approvals', permission: 'platform.approvals.view' },
    { id: 'files', label: 'Fayl Meneceri', icon: 'Folder', path: '/admin/files', permission: 'platform.files.read' },
    { id: 'guide', label: 'Sistem Bələdçisi', icon: 'BookOpen', path: '/admin/guide', permission: 'platform.guide.read' },
    {
        id: 'settings', label: 'Tənzimləmələr', icon: 'Settings', children: [
            {
                id: 'general', label: 'Ümumi', icon: 'Sliders', children: [
                    { id: 'company_profile', label: 'Şirkət Profili', path: '/admin/settings?tab=general', permission: 'platform.settings.general.read' },
                    { id: 'notification_engine', label: 'Bildiriş Mühərriki', path: '/admin/settings?tab=notifications', permission: 'platform.settings.general.read' },
                ]
            },
            {
                id: 'communication', label: 'Kommunikasiya', icon: 'MessageSquare', children: [
                    { id: 'smtp_email', label: 'SMTP Email', path: '/admin/settings?tab=smtp', permission: 'platform.settings.communication.read' },
                    { id: 'smtp_sms', label: 'SMS Gateway', path: '/admin/settings?tab=sms', permission: 'platform.settings.communication.read' },
                ]
            },
            {
                id: 'security', label: 'Təhlükəsizlik', icon: 'Shield', children: [
                    { id: 'policies', label: 'Siyasətlər', path: '/admin/settings?tab=security', permission: 'platform.settings.security.read' },
                    { id: 'sso', label: 'SSO & OAuth', path: '/admin/settings?tab=sso', permission: 'platform.settings.security.read' },
                    { id: 'rights', label: 'İstifadəçi Hüquqları', path: '/admin/settings?tab=roles', permission: 'platform.settings.security.read' },
                ]
            },
            {
                id: 'system_config', label: 'Sistem Konfiqurasiyası', icon: 'Database', children: [
                    { id: 'billing_config', label: 'Bilinq Ayarları', path: '/admin/settings?tab=billing_config', permission: 'platform.settings.config.read' },
                    {
                        id: 'dictionaries', label: 'Soraqçalar', icon: 'Book', children: [
                            { id: 'sectors', label: 'Sektorlar', path: '/admin/settings?tab=dictionaries&entity=sectors', permission: 'platform.settings.config.read' },
                            { id: 'units', label: 'Ölçü Vahidləri', path: '/admin/settings?tab=dictionaries&entity=units', permission: 'platform.settings.config.read' },
                            { id: 'currencies', label: 'Valyutalar', path: '/admin/settings?tab=dictionaries&entity=currencies', permission: 'platform.settings.config.read' },
                            { id: 'time_zones', label: 'Saat Qurşaqları', path: '/admin/settings?tab=dictionaries&entity=time_zones', permission: 'platform.settings.config.read' },
                            {
                                id: 'addresses', label: 'Ünvanlar', children: [
                                    { id: 'country', label: 'Ölkələr', path: '/admin/settings?tab=dictionaries&entity=country', permission: 'platform.settings.config.read' },
                                    { id: 'city', label: 'Şəhərlər', path: '/admin/settings?tab=dictionaries&entity=city', permission: 'platform.settings.config.read' },
                                    { id: 'district', label: 'Rayonlar', path: '/admin/settings?tab=dictionaries&entity=district', permission: 'platform.settings.config.read' },
                                ]
                            }
                        ]
                    },
                    { id: 'templates', label: 'Sənəd Şablonları', path: '/admin/settings?tab=templates', permission: 'platform.settings.config.read' },
                    { id: 'workflow', label: 'Workflow', path: '/admin/settings?tab=workflow', permission: 'platform.settings.config.read' },
                ]
            }
        ]
    },
    {
        id: 'system_console', label: 'Sistem Konsolu', icon: 'Terminal', children: [
            { id: 'console_dash', label: 'Dashboard', path: '/admin/console?tab=dashboard', permission: 'platform.console.dashboard.read' },
            { id: 'monitoring', label: 'Monitoring', path: '/admin/console?tab=monitoring', permission: 'platform.console.dashboard.read' },
            { id: 'audit', label: 'Audit & Compliance', path: '/admin/console?tab=audit', permission: 'platform.console.audit.read' },
            { id: 'scheduler', label: 'Job Scheduler', path: '/admin/console?tab=scheduler', permission: 'platform.console.scheduler.read' },
            { id: 'retention', label: 'Data Retention', path: '/admin/console?tab=retention', permission: 'platform.console.retention.read' },
            { id: 'feature_flags', label: 'Feature Flags', path: '/admin/console?tab=feature_flags', permission: 'platform.console.features.read' },
            { id: 'policy_security', label: 'Policy Security', path: '/admin/console?tab=policy', permission: 'platform.console.audit.read' },
            { id: 'feedback', label: 'Feedback', path: '/admin/console?tab=feedback', permission: 'platform.console.tools.read' },
            { id: 'tools', label: 'Tools', path: '/admin/console?tab=tools', permission: 'platform.console.tools.read' },
        ]
    },
    {
        id: 'developer_hub', label: 'Developer Hub', icon: 'Code', children: [
            { id: 'api', label: 'API Reference', path: '/admin/developer?tab=api', permission: 'platform.dev.api.read' },
            { id: 'sdk', label: 'SDKs', path: '/admin/developer?tab=sdk', permission: 'platform.dev.sdk.read' },
            { id: 'webhooks', label: 'Webhooks', path: '/admin/developer?tab=webhooks', permission: 'platform.dev.webhooks.read' },
            { id: 'perm_map', label: 'Permission Map', path: '/admin/developer?tab=permissions', permission: 'platform.dev.read' },
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
    const allSlugs = Array.from(new Set(flattenPermissions(platform_permissions)));
    const permissionMap = new Map<string, string>();

    for (const slug of allSlugs) {
        const parts = slug.split('.');
        const moduleName = parts.length > 1 ? parts[1] : 'CORE';
        const name = generateNameFromSlug(slug);

        const perm = await prisma.permission.upsert({
            where: { slug },
            update: {
                name: name,
                module: moduleName
            },
            create: {
                slug,
                name: name,
                description: `Permission for ${name}`,
                module: moduleName
            }
        });
        permissionMap.set(slug, perm.id);
    }
    console.log(`✅ Seeded ${allSlugs.length} permissions.`);

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
            let permId = null;
            if (item.permission) {
                permId = permissionMap.get(item.permission);
                if (!permId) console.warn(`⚠️ Warning: Permission '${item.permission}' for menu '${item.label}' not found in DB.`);
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

        // Update legacy roleId
        await prisma.user.update({
            where: { id: u.id },
            data: { roleId: ownerRole.id }
        });

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
