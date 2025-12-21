"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TENANT_MENU_DEF = exports.PLATFORM_MENU_DEF = void 0;
exports.PLATFORM_MENU_DEF = [
    {
        id: 'dashboard',
        label: 'İdarə etmə paneli',
        path: '/admin/dashboard',
        requiredPermissions: ['admin.dashboard.read']
    },
    {
        id: 'tenants',
        label: 'Tenantlar',
        path: '/admin/tenants',
        requiredPermissions: ['admin.tenants.read']
    },
    {
        id: 'branches',
        label: 'Filiallar',
        path: '/admin/branches',
        requiredPermissions: ['admin.branches.read']
    },
    {
        id: 'users',
        label: 'İstifadəçilər',
        path: '/admin/users',
        requiredPermissions: ['admin.users.read'],
        children: [
            {
                id: 'users.all',
                label: 'İstifadəçilər',
                path: '/admin/users?tab=users',
                requiredPermissions: ['admin.users.read']
            },
            {
                id: 'users.curators',
                label: 'Kuratorlar',
                path: '/admin/users?tab=curators',
                requiredPermissions: ['admin.users.curators.read']
            }
        ]
    },
    {
        id: 'billing',
        label: 'Bilinq və Maliyyə',
        path: '/admin/billing',
        requiredPermissions: ['admin.billing.read'],
        children: [
            {
                id: 'billing.marketplace',
                label: 'Marketplace',
                path: '/admin/billing?tab=marketplace',
                requiredPermissions: ['admin.billing.market_place.read']
            },
            {
                id: 'billing.packages',
                label: 'Komponent Paketlər',
                path: '/admin/billing?tab=packages',
                requiredPermissions: ['admin.billing.compact_packages.read']
            },
            {
                id: 'billing.plans',
                label: 'Planlar',
                path: '/admin/billing?tab=subscriptions',
                requiredPermissions: ['admin.billing.plans.read']
            },
            {
                id: 'billing.invoices',
                label: 'Fakturalar',
                path: '/admin/billing?tab=invoices',
                requiredPermissions: ['admin.billing.invoices.read']
            },
            {
                id: 'billing.licenses',
                label: 'Lisenziyalar',
                path: '/admin/billing?tab=licenses',
                requiredPermissions: ['admin.billing.licenses.read']
            }
        ]
    },
    {
        id: 'approvals',
        label: 'Təsdiqləmələr',
        path: '/admin/approvals',
        requiredPermissions: ['admin.approvals.read']
    },
    {
        id: 'files',
        label: 'Fayl Meneceri',
        path: '/admin/files',
        requiredPermissions: ['admin.file_manager.read']
    },
    {
        id: 'guide',
        label: 'Sistem Bələdçisi',
        path: '/admin/guide',
        requiredPermissions: ['admin.system_guide.read']
    },
    {
        id: 'settings',
        label: 'Tənzimləmələr',
        path: '/admin/settings',
        requiredPermissions: ['admin.settings.read'],
        children: [
            {
                id: 'settings.general',
                label: 'Ümumi',
                path: '/admin/settings?tab=general',
                requiredPermissions: ['admin.settings.general.read']
            },
            {
                id: 'settings.notifications',
                label: 'Bildiriş Qaydaları',
                path: '/admin/settings?tab=notifications',
                requiredPermissions: ['admin.settings.general.notification_engine.read']
            },
            {
                id: 'settings.security',
                label: 'Təhlükəsizlik',
                path: '/admin/settings?tab=security',
                requiredPermissions: ['admin.settings.security.read']
            }
        ]
    },
    {
        id: 'console',
        label: 'Sistem Konsolu',
        path: '/admin/console',
        requiredPermissions: ['admin.system_console.read'],
        children: [
            {
                id: 'console.dashboard',
                label: 'Monitorinq',
                path: '/admin/console?tab=dashboard',
                requiredPermissions: ['admin.system_console.dashboard.read']
            },
            {
                id: 'console.audit',
                label: 'Audit və Komplayns',
                path: '/admin/console?tab=audit',
                requiredPermissions: ['admin.system_console.audit_compliance.read']
            },
            {
                id: 'console.scheduler',
                label: 'Tapşırıq Scheduleri',
                path: '/admin/console?tab=jobs',
                requiredPermissions: ['admin.system_console.job_scheduler.read']
            },
            {
                id: 'console.retention',
                label: 'Data Saxlama Siyasəti',
                path: '/admin/console?tab=retention',
                requiredPermissions: ['admin.system_console.data_retention.read']
            },
            {
                id: 'console.features',
                label: 'Feature Flags',
                path: '/admin/console?tab=features',
                requiredPermissions: ['admin.system_console.feature_flags.read']
            },
            {
                id: 'console.tools',
                label: 'Alətlər',
                path: '/admin/console?tab=tools',
                requiredPermissions: ['admin.system_console.tools.read']
            }
        ]
    },
    {
        id: 'developer',
        label: 'Developer Hub',
        path: '/admin/developer',
        requiredPermissions: ['admin.developer_hub.read'],
        children: [
            {
                id: 'dev.api',
                label: 'API İstinadları',
                path: '/admin/dev/api',
                requiredPermissions: ['admin.developer_hub.api_reference.read']
            },
            {
                id: 'dev.sdk',
                label: 'SDK & Kitabxanalar',
                path: '/admin/dev/sdk',
                requiredPermissions: ['admin.developer_hub.sdk.read']
            },
            {
                id: 'dev.webhooks',
                label: 'Webhooks',
                path: '/admin/dev/webhooks',
                requiredPermissions: ['admin.developer_hub.webhooks.read']
            }
        ]
    }
];
exports.TENANT_MENU_DEF = [
    {
        id: 'dashboard',
        label: 'Panel',
        path: '/',
        requiredPermissions: ['tenant.dashboard.view']
    },
    {
        id: 'users',
        label: 'Əməkdaşlar',
        path: '/users',
        requiredPermissions: ['tenant.users.read']
    },
    {
        id: 'settings',
        label: 'Tənzimləmələr',
        path: '/settings',
        requiredPermissions: ['tenant.settings.read']
    }
];
//# sourceMappingURL=menu.definitions.js.map