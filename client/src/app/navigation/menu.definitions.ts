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
    requiredPermissions: ['platform.dashboard.view']
},
{
    id: 'tenants',
    label: 'Tenantlar', // Tenants
    path: '/admin/tenants',
    icon: Building2,
    requiredPermissions: ['platform.tenants.view']
},
{
    id: 'branches',
    label: 'Filiallar', // Branches
    path: '/admin/branches',
    icon: GitBranch,
    requiredPermissions: ['platform.branches.view']
},
{
    id: 'users',
    label: 'İstifadəçilər', // Users
    path: '/admin/users',
    icon: Users,
    // requiredPermissions: ['platform.users.users.view'],
    children: [{
        id: 'users.all',
        label: 'İstifadəçilər',
        path: '/admin/users?tab=users',
        requiredPermissions: ['platform.users.users.view']
    },
    {
        id: 'users.curators',
        label: 'Kuratorlar',
        path: '/admin/users?tab=curators',
        requiredPermissions: ['platform.users.curators.view']
    }
    ]
},
{
    id: 'billing',
    label: 'Bilinq və Maliyyə', // Billing
    // path: '/admin/billing', // Removed for Container Mode
    icon: CreditCard,
    // requiredPermissions: ['platform.billing.view'], // Removed for Bottom-Up Logic
    children: [{
        id: 'billing.marketplace',
        label: 'Marketplace',
        path: '/admin/billing?tab=marketplace',
        requiredPermissions: ['platform.billing.view']
    },
    {
        id: 'billing.packages',
        label: 'Komponent Paketlər',
        path: '/admin/billing?tab=packages',
        requiredPermissions: ['platform.billing.view']
    },
    {
        id: 'billing.plans',
        label: 'Planlar',
        path: '/admin/billing?tab=subscriptions',
        requiredPermissions: ['platform.billing.plans.read']
    },
    {
        id: 'billing.invoices',
        label: 'Fakturalar',
        path: '/admin/billing?tab=invoices',
        requiredPermissions: ['platform.billing.invoices.read']
    },
    {
        id: 'billing.licenses',
        label: 'Lisenziyalar',
        path: '/admin/billing?tab=licenses',
        requiredPermissions: ['platform.billing.licenses.read']
    }
    ]
},
{
    id: 'approvals',
    label: 'Təsdiqləmələr', // Approvals
    path: '/admin/approvals',
    icon: CheckSquare,
    requiredPermissions: ['platform.approvals.view']
},
{
    id: 'files',
    label: 'Fayl Meneceri', // File Manager
    path: '/admin/files',
    icon: Folder,
    requiredPermissions: ['platform.file_manager.view']
},
{
    id: 'guide',
    label: 'Sistem Bələdçisi', // System Guide
    path: '/admin/guide',
    icon: BookOpen,
    requiredPermissions: ['platform.system_guide.view']
},
{
    id: 'settings',
    label: 'Tənzimləmələr', // Settings group
    // path: '/admin/settings', // Removed for Container Mode
    icon: Settings,
    // requiredPermissions: ['platform.settings.view'], // Removed for Bottom-Up Logic
    children: [{
        id: 'settings.general',
        label: 'Ümumi',
        path: '/admin/settings?tab=general',
        requiredPermissions: ['platform.settings.general.view']
    },
    {
        id: 'settings.notifications',
        label: 'Bildiriş Qaydaları',
        path: '/admin/settings?tab=notifications',
        requiredPermissions: ['platform.settings.general.notification_engine.view']
    },
    {
        id: 'settings.communication',
        label: 'Kommunikasiya',
        path: '/admin/settings?tab=smtp',
        requiredPermissions: ['platform.settings.communication.view']
    },
    {
        id: 'settings.security',
        label: 'Təhlükəsizlik',
        path: '/admin/settings?tab=security',
        requiredPermissions: ['platform.settings.security.view']
    },
    {
        id: 'settings.config',
        label: 'Konfiqurasiyalar',
        path: '/admin/settings?tab=config',
        requiredPermissions: ['platform.settings.system_configurations.view'],
        children: [{
            id: 'config.billing',
            label: 'Bilinq Ayarları',
            path: '/admin/settings?tab=billing_config',
            requiredPermissions: ['platform.settings.system_configurations.billing_configurations.price_rules.view']
        },
        {
            id: 'config.dictionaries',
            label: 'Soraqçalar',
            requiredPermissions: ['platform.settings.system_configurations.dictionary.view'],
            children: [{
                id: 'dict.sectors',
                label: 'Sektorlar',
                path: '/admin/settings?tab=dictionaries&entity=sectors',
                requiredPermissions: ['platform.settings.system_configurations.dictionary.sectors.view']
            },
            {
                id: 'dict.units',
                label: 'Ölçü Vahidləri',
                path: '/admin/settings?tab=dictionaries&entity=units',
                requiredPermissions: ['platform.settings.system_configurations.dictionary.units.view']
            },
            {
                id: 'dict.currencies',
                label: 'Valyutalar',
                path: '/admin/settings?tab=dictionaries&entity=currencies',
                requiredPermissions: ['platform.settings.system_configurations.dictionary.currencies.view']
            },
            {
                id: 'dict.timezones',
                label: 'Saat Qurşaqları',
                path: '/admin/settings?tab=dictionaries&entity=time_zones',
                requiredPermissions: ['platform.settings.system_configurations.dictionary.time_zones.view']
            },
            {
                id: 'config.addresses',
                label: 'Ünvanlar',
                requiredPermissions: ['platform.settings.system_configurations.dictionary.addresses.view'],
                children: [{
                    id: 'addr.country',
                    label: 'Ölkələr',
                    path: '/admin/settings?tab=dictionaries&entity=country',
                    requiredPermissions: ['platform.settings.system_configurations.dictionary.addresses.country.view']
                },
                {
                    id: 'addr.city',
                    label: 'Şəhərlər',
                    path: '/admin/settings?tab=dictionaries&entity=city',
                    requiredPermissions: ['platform.settings.system_configurations.dictionary.addresses.city.view']
                },
                {
                    id: 'addr.district',
                    label: 'Rayonlar',
                    path: '/admin/settings?tab=dictionaries&entity=district',
                    requiredPermissions: ['platform.settings.system_configurations.dictionary.addresses.district.view']
                }
                ]
            }
            ]
        },
        {
            id: 'config.templates',
            label: 'Sənəd Şablonları',
            path: '/admin/settings?tab=templates',
            requiredPermissions: ['platform.settings.system_configurations.document_templates.view']
        },
        {
            id: 'config.workflow',
            label: 'Workflow',
            path: '/admin/settings?tab=workflow',
            requiredPermissions: ['platform.settings.system_configurations.workflow.configuration.view']
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
    // requiredPermissions: ['platform.system_console.view'], // Removed for Bottom-Up Logic
    children: [{
        id: 'console.dashboard',
        label: 'Dashboard',
        path: '/admin/console?tab=dashboard',
        requiredPermissions: ['platform.system_console.dashboard.read']
    },
    {
        id: 'console.monitoring',
        label: 'Monitoring',
        path: '/admin/console?tab=monitoring',
        requiredPermissions: ['platform.system_console.monitoring.dashboard.read']
    },
    {
        id: 'console.audit',
        label: 'Audit & Compliance',
        path: '/admin/console?tab=audit',
        requiredPermissions: ['platform.system_console.audit_compliance.read']
    },
    {
        id: 'console.scheduler',
        label: 'Job Scheduler',
        path: '/admin/console?tab=scheduler',
        requiredPermissions: ['platform.system_console.job_scheduler.read']
    },
    {
        id: 'console.retention',
        label: 'Data Retention',
        path: '/admin/console?tab=retention',
        requiredPermissions: ['platform.system_console.data_retention.read']
    },
    {
        id: 'console.features',
        label: 'Feature Flags',
        path: '/admin/console?tab=features',
        requiredPermissions: ['platform.system_console.feature_flags.read']
    },
    {
        id: 'console.policy',
        label: 'Policy Security',
        path: '/admin/console?tab=policy',
        requiredPermissions: ['platform.system_console.policy_security.read']
    },
    {
        id: 'console.feedback',
        label: 'Feedback',
        path: '/admin/console?tab=feedback',
        requiredPermissions: ['platform.system_console.feedback.read']
    },
    {
        id: 'console.tools',
        label: 'Tools',
        path: '/admin/console?tab=tools',
        requiredPermissions: ['platform.system_console.tools.read']
    }
    ]
},
{
    id: 'developer',
    label: 'Developer Hub', // Developer Hub group
    path: '/admin/developer',
    icon: Code,
    // requiredPermissions: ['platform.developer_hub.view'],
    children: [{
        id: 'dev.api',
        label: 'API İstinadları',
        path: '/admin/dev/api',
        requiredPermissions: ['platform.developer_hub.api_reference.read']
    },
    {
        id: 'dev.sdk',
        label: 'SDK & Kitabxanalar',
        path: '/admin/dev/sdk',
        requiredPermissions: ['platform.developer_hub.sdk.read']
    },
    {
        id: 'dev.webhooks',
        label: 'Webhooks',
        path: '/admin/dev/webhooks',
        requiredPermissions: ['platform.developer_hub.webhooks.read']
    },
    {
        id: 'dev.perm_map',
        label: 'Permission Map',
        path: '/admin/dev/permissions',
        requiredPermissions: ['platform.developer_hub.permission_map.read']
    }
    ]
}
];

export const TENANT_MENU: MenuItem[] = [{
    id: 'dashboard',
    label: 'Panel', // Dashboard
    path: '/',
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