import {
    type LucideIcon,
    LayoutDashboard,
    Building2,
    GitBranch,
    Users,
    CreditCard,
    CheckSquare,
    Folder,
    BookOpen,
    Settings,
    Terminal,
    Code,
    Home
} from 'lucide-react';
import {
    PermissionSlugs
} from '@/app/security/permission-slugs';

export interface MenuItem {
    id: string;
    label: string;
    path?: string;
    icon?: LucideIcon | string;
    requiredPermissions?: string[]; // Empty means public/accessible to all authenticated in that scope
    children?: MenuItem[];
}

export const PLATFORM_MENU: MenuItem[] = [{
    id: 'dashboard',
    label: 'İdarə etmə paneli', // Dashboard
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    requiredPermissions: [PermissionSlugs.SYSTEM.DASHBOARD.VIEW]
},
{
    id: 'tenants',
    label: 'Tenantlar', // Tenants
    path: '/admin/tenants',
    icon: Building2,
    requiredPermissions: [PermissionSlugs.SYSTEM.TENANTS.VIEW]
},
{
    id: 'branches',
    label: 'Filiallar', // Branches
    path: '/admin/branches',
    icon: GitBranch,
    requiredPermissions: [PermissionSlugs.SYSTEM.BRANCHES.VIEW]
},
{
    id: 'users',
    label: 'İstifadəçilər', // Users
    path: '/admin/users',
    icon: Users,
    // requiredPermissions: [PermissionSlugs.SYSTEM.USERS.VIEW],
    children: [{
        id: 'users.all',
        label: 'İstifadəçilər',
        path: '/admin/users?tab=users',
        requiredPermissions: [PermissionSlugs.SYSTEM.USERS.VIEW]
    },
    {
        id: 'users.curators',
        label: 'Kuratorlar',
        path: '/admin/users?tab=curators',
        requiredPermissions: [PermissionSlugs.SYSTEM.CURATORS.VIEW]
    }
    ]
},
{
    id: 'billing',
    label: 'Bilinq və Maliyyə', // Billing
    path: '/admin/billing?tab=marketplace',
    icon: CreditCard,
    // requiredPermissions: [PermissionSlugs.SYSTEM.BILLING.VIEW], // Removed for Bottom-Up Logic
    children: [{
        id: 'billing.marketplace',
        label: 'Marketplace',
        path: '/admin/billing?tab=marketplace',
        requiredPermissions: [PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.VIEW]
    },
    {
        id: 'billing.packages',
        label: 'Komponent Paketlər',
        path: '/admin/billing?tab=packages',
        requiredPermissions: [PermissionSlugs.SYSTEM.BILLING.PACKAGES.VIEW]
    },
    {
        id: 'billing.plans',
        label: 'Planlar',
        path: '/admin/billing?tab=subscriptions',
        requiredPermissions: [PermissionSlugs.SYSTEM.BILLING.PLANS.READ]
    },
    {
        id: 'billing.invoices',
        label: 'Fakturalar',
        path: '/admin/billing?tab=invoices',
        requiredPermissions: [PermissionSlugs.SYSTEM.BILLING.INVOICES.READ]
    },
    {
        id: 'billing.licenses',
        label: 'Lisenziyalar',
        path: '/admin/billing?tab=licenses',
        requiredPermissions: [PermissionSlugs.SYSTEM.BILLING.LICENSES.READ]
    }
    ]
},
{
    id: 'approvals',
    label: 'Təsdiqləmələr', // Approvals
    path: '/admin/approvals',
    icon: CheckSquare,
    requiredPermissions: [PermissionSlugs.SYSTEM.APPROVALS.VIEW]
},
{
    id: 'files',
    label: 'Fayl Meneceri', // File Manager
    path: '/admin/files',
    icon: Folder,
    requiredPermissions: [PermissionSlugs.SYSTEM.FILES.VIEW]
},
{
    id: 'guide',
    label: 'Sistem Bələdçisi', // System Guide
    path: '/admin/guide',
    icon: BookOpen,
    requiredPermissions: [PermissionSlugs.SYSTEM.GUIDE.VIEW]
},
{
    id: 'settings',
    label: 'Tənzimləmələr', // Settings group
    path: '/admin/settings?tab=general',
    icon: Settings,
    // requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.VIEW], // Removed for Bottom-Up Logic
    children: [{
        id: 'settings.general',
        label: 'Ümumi',
        path: '/admin/settings?tab=general',
        requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.GENERAL.VIEW]
    },
    {
        id: 'settings.notifications',
        label: 'Bildiriş Qaydaları',
        path: '/admin/settings?tab=notifications',
        requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.NOTIFICATIONS.VIEW]
    },
    {
        id: 'settings.communication',
        label: 'Kommunikasiya',
        path: '/admin/settings?tab=smtp',
        requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.VIEW]
    },
    {
        id: 'settings.security',
        label: 'Təhlükəsizlik',
        path: '/admin/settings?tab=security',
        requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.SECURITY.VIEW]
    },
    {
        id: 'settings.config',
        label: 'Konfiqurasiyalar',
        path: '/admin/settings?tab=config',
        requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.VIEW],
        children: [{
            id: 'config.billing',
            label: 'Bilinq Ayarları',
            path: '/admin/settings?tab=billing_config',
            requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.BILLING.VIEW]
        },
        {
            id: 'config.dictionaries',
            label: 'Soraqçalar',
            requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.VIEW],
            children: [{
                id: 'dict.sectors',
                label: 'Sektorlar',
                path: '/admin/settings?tab=dictionaries&entity=sectors',
                requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.SECTORS.VIEW]
            },
            {
                id: 'dict.units',
                label: 'Ölçü Vahidləri',
                path: '/admin/settings?tab=dictionaries&entity=units',
                requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.UNITS.VIEW]
            },
            {
                id: 'dict.currencies',
                label: 'Valyutalar',
                path: '/admin/settings?tab=dictionaries&entity=currencies',
                requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.CURRENCIES.VIEW]
            },
            {
                id: 'dict.timezones',
                label: 'Saat Qurşaqları',
                path: '/admin/settings?tab=dictionaries&entity=time_zones',
                requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.TIME_ZONES.VIEW]
            },
            {
                id: 'config.addresses',
                label: 'Ünvanlar',
                requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.VIEW],
                children: [{
                    id: 'addr.country',
                    label: 'Ölkələr',
                    path: '/admin/settings?tab=dictionaries&entity=country',
                    requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.COUNTRY.VIEW]
                },
                {
                    id: 'addr.city',
                    label: 'Şəhərlər',
                    path: '/admin/settings?tab=dictionaries&entity=city',
                    requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.CITY.VIEW]
                },
                {
                    id: 'addr.district',
                    label: 'Rayonlar',
                    path: '/admin/settings?tab=dictionaries&entity=district',
                    requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.DISTRICT.VIEW]
                }
                ]
            }
            ]
        },
        {
            id: 'config.templates',
            label: 'Sənəd Şablonları',
            path: '/admin/settings?tab=templates',
            requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.TEMPLATES.VIEW]
        },
        {
            id: 'config.workflow',
            label: 'Workflow',
            path: '/admin/settings?tab=workflow',
            requiredPermissions: [PermissionSlugs.SYSTEM.SETTINGS.CONFIG.WORKFLOW.VIEW]
        }
        ]
    }
    ]
},
{
    id: 'console',
    label: 'Sistem Konsolu',
    // path: '/admin/console', // Removed for Container Mode
    icon: Terminal,
    // requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.VIEW], // Removed for Bottom-Up Logic
    children: [{
        id: 'console.dashboard',
        label: 'Dashboard',
        path: '/admin/console?tab=dashboard',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.DASHBOARD.READ]
    },
    {
        id: 'console.monitoring',
        label: 'Monitoring',
        path: '/admin/console?tab=monitoring',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.MONITORING.READ]
    },
    {
        id: 'console.audit',
        label: 'Audit & Compliance',
        path: '/admin/console?tab=audit',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.AUDIT.READ]
    },
    {
        id: 'console.scheduler',
        label: 'Job Scheduler',
        path: '/admin/console?tab=scheduler',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.SCHEDULER.READ]
    },
    {
        id: 'console.retention',
        label: 'Data Retention',
        path: '/admin/console?tab=retention',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.RETENTION.READ]
    },
    {
        id: 'console.features',
        label: 'Feature Flags',
        path: '/admin/console?tab=features',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.FEATURES.READ]
    },
    {
        id: 'console.policy',
        label: 'Policy Security',
        path: '/admin/console?tab=policy',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.POLICY.READ]
    },
    {
        id: 'console.feedback',
        label: 'Feedback',
        path: '/admin/console?tab=feedback',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.FEEDBACK.READ]
    },
    {
        id: 'console.tools',
        label: 'Tools',
        path: '/admin/console?tab=tools',
        requiredPermissions: [PermissionSlugs.SYSTEM.CONSOLE.TOOLS.READ]
    }
    ]
},
{
    id: 'developer',
    label: 'Developer Hub', // Developer Hub group
    path: '/admin/developer?tab=api',
    icon: Code,
    // requiredPermissions: [PermissionSlugs.SYSTEM.DEVELOPER.VIEW],
    children: [{
        id: 'dev.api',
        label: 'API İstinadları',
        path: '/admin/developer?tab=api',
        requiredPermissions: [PermissionSlugs.SYSTEM.DEVELOPER.API.READ]
    },
    {
        id: 'dev.sdk',
        label: 'SDK & Kitabxanalar',
        path: '/admin/developer?tab=sdk',
        requiredPermissions: [PermissionSlugs.SYSTEM.DEVELOPER.SDK.READ]
    },
    {
        id: 'dev.webhooks',
        label: 'Webhooks',
        path: '/admin/developer?tab=webhooks',
        requiredPermissions: [PermissionSlugs.SYSTEM.DEVELOPER.WEBHOOKS.READ]
    },
    {
        id: 'dev.perm_map',
        label: 'Permission Map',
        path: '/admin/developer?tab=permissions',
        requiredPermissions: [PermissionSlugs.SYSTEM.DEVELOPER.PERM_MAP.READ]
    }
    ]
}
];

export const TENANT_MENU: MenuItem[] = [{
    id: 'dashboard',
    label: 'Panel', // Dashboard
    path: '/dashboard',
    icon: Home,
    requiredPermissions: ['tenant.dashboard.view']
},
{
    id: 'users',
    label: 'Əməkdaşlar', // Users
    path: '/users',
    icon: Users,
    requiredPermissions: ['tenant.users.read']
},
{
    id: 'settings',
    label: 'Tənzimləmələr', // Settings
    path: '/settings',
    icon: Settings,
    requiredPermissions: ['tenant.settings.read']
}
];