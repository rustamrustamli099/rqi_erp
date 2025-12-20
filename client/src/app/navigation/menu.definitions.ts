import { type LucideIcon, LayoutDashboard, Building2, GitBranch, Users, CreditCard, CheckSquare, Folder, BookOpen, Settings, Terminal, Code, Home, UserCog } from 'lucide-react';
import { PermissionSlugs } from '@/app/security/permission-slugs';

export interface MenuItem {
    id: string;
    label: string;
    path?: string;
    icon?: LucideIcon | string;
    requiredPermissions?: string[]; // Empty means public/accessible to all authenticated in that scope
    children?: MenuItem[];
}

export const PLATFORM_MENU: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'İdarə etmə paneli', // Dashboard
        path: '/admin/dashboard',
        icon: LayoutDashboard,
        requiredPermissions: [PermissionSlugs.PLATFORM.DASHBOARD.VIEW]
    },
    {
        id: 'tenants',
        label: 'Tenantlar', // Tenants
        path: '/admin/tenants',
        icon: Building2,
        requiredPermissions: [PermissionSlugs.PLATFORM.TENANTS.READ]
    },
    {
        id: 'branches',
        label: 'Filiallar', // Branches
        path: '/admin/branches',
        icon: GitBranch,
        requiredPermissions: [PermissionSlugs.PLATFORM.BRANCHES.READ]
    },
    {
        id: 'users',
        label: 'İstifadəçilər', // Users
        path: '/admin/users',
        icon: Users,
        requiredPermissions: [PermissionSlugs.PLATFORM.USERS.READ],
        children: [
            {
                id: 'users.all',
                label: 'İstifadəçilər',
                path: '/admin/users?tab=users',
                requiredPermissions: [PermissionSlugs.PLATFORM.USERS.READ]
            },
            {
                id: 'users.curators',
                label: 'Kuratorlar',
                path: '/admin/users?tab=curators',
                requiredPermissions: [PermissionSlugs.PLATFORM.CURATORS.READ]
            }
        ]
    },
    {
        id: 'billing',
        label: 'Bilinq və Maliyyə', // Billing
        path: '/admin/billing',
        icon: CreditCard,
        requiredPermissions: [PermissionSlugs.PLATFORM.BILLING.READ],
        children: [
            {
                id: 'billing.marketplace',
                label: 'Marketplace',
                path: '/admin/billing?tab=marketplace',
                requiredPermissions: [PermissionSlugs.PLATFORM.BILLING.MARKETPLACE.READ]
            },
            {
                id: 'billing.packages',
                label: 'Komponent Paketlər',
                path: '/admin/billing?tab=packages',
                requiredPermissions: [PermissionSlugs.PLATFORM.BILLING.PACKAGES.READ]
            },
            {
                id: 'billing.plans',
                label: 'Planlar',
                path: '/admin/billing?tab=subscriptions',
                requiredPermissions: [PermissionSlugs.PLATFORM.BILLING.PLANS.READ]
            },
            {
                id: 'billing.invoices',
                label: 'Fakturalar',
                path: '/admin/billing?tab=invoices',
                requiredPermissions: [PermissionSlugs.PLATFORM.BILLING.INVOICES.READ]
            },
            {
                id: 'billing.licenses',
                label: 'Lisenziyalar',
                path: '/admin/billing?tab=licenses',
                requiredPermissions: [PermissionSlugs.PLATFORM.BILLING.LICENSES.READ]
            }
        ]
    },
    {
        id: 'approvals',
        label: 'Təsdiqləmələr', // Approvals
        path: '/admin/approvals',
        icon: CheckSquare,
        requiredPermissions: [PermissionSlugs.PLATFORM.APPROVALS.VIEW]
    },
    {
        id: 'files',
        label: 'Fayl Meneceri', // File Manager
        path: '/admin/files',
        icon: Folder,
        requiredPermissions: [PermissionSlugs.PLATFORM.FILES.READ]
    },
    {
        id: 'guide',
        label: 'Sistem Bələdçisi', // System Guide
        path: '/admin/guide',
        icon: BookOpen,
        requiredPermissions: [PermissionSlugs.PLATFORM.GUIDE.READ]
    },
    {
        id: 'settings',
        label: 'Tənzimləmələr', // Settings group
        path: '/admin/settings',
        icon: Settings,
        requiredPermissions: [PermissionSlugs.PLATFORM.SETTINGS.READ],
        children: [
            {
                id: 'settings.general',
                label: 'Ümumi',
                path: '/admin/settings?tab=general',
                requiredPermissions: [PermissionSlugs.PLATFORM.SETTINGS.GENERAL.READ]
            },
            {
                id: 'settings.notifications',
                label: 'Bildiriş Qaydaları',
                path: '/admin/settings?tab=notifications',
                requiredPermissions: [PermissionSlugs.PLATFORM.SETTINGS.GENERAL.READ]
            },
            {
                id: 'settings.communication',
                label: 'Kommunikasiya', // Maps to SMTP/SMS usually? SettingsPage says 'smtp', 'sms'
                path: '/admin/settings?tab=smtp', // Assuming communication maps to SMTP for now or general comms
                requiredPermissions: [PermissionSlugs.PLATFORM.SETTINGS.COMMUNICATION.READ]
            },
            {
                id: 'settings.security',
                label: 'Təhlükəsizlik',
                path: '/admin/settings?tab=security',
                requiredPermissions: [PermissionSlugs.PLATFORM.SETTINGS.SECURITY.READ]
            },
            {
                id: 'settings.config',
                label: 'Konfiqurasiyalar',
                path: '/admin/settings?tab=config',
                requiredPermissions: [PermissionSlugs.PLATFORM.SETTINGS.CONFIG.READ]
            }
        ]
    },
    {
        id: 'console',
        label: 'Sistem Konsolu', // System Console group
        path: '/admin/console',
        icon: Terminal,
        requiredPermissions: [PermissionSlugs.PLATFORM.CONSOLE.READ],
        children: [
            {
                id: 'console.dashboard',
                label: 'Monitorinq',
                path: '/admin/console?tab=dashboard',
                requiredPermissions: [PermissionSlugs.PLATFORM.CONSOLE.DASHBOARD.READ]
            },
            {
                id: 'console.audit',
                label: 'Audit və Komplayns',
                path: '/admin/console?tab=audit',
                requiredPermissions: [PermissionSlugs.PLATFORM.CONSOLE.AUDIT.READ]
            },
            {
                id: 'console.scheduler',
                label: 'Tapşırıq Scheduleri',
                path: '/admin/console?tab=jobs',
                requiredPermissions: [PermissionSlugs.PLATFORM.CONSOLE.SCHEDULER.READ]
            },
            {
                id: 'console.retention',
                label: 'Data Saxlama Siyasəti',
                path: '/admin/console?tab=retention',
                requiredPermissions: [PermissionSlugs.PLATFORM.CONSOLE.RETENTION.READ]
            },
            {
                id: 'console.features',
                label: 'Feature Flags',
                path: '/admin/console?tab=features',
                requiredPermissions: [PermissionSlugs.PLATFORM.CONSOLE.FEATURES.READ]
            },
            {
                id: 'console.tools',
                label: 'Alətlər',
                path: '/admin/console?tab=tools',
                requiredPermissions: [PermissionSlugs.PLATFORM.CONSOLE.TOOLS.READ]
            }
        ]
    },
    {
        id: 'developer',
        label: 'Developer Hub', // Developer Hub group
        path: '/admin/developer',
        icon: Code,
        requiredPermissions: [PermissionSlugs.PLATFORM.DEVELOPER.READ],
        children: [
            {
                id: 'dev.api',
                label: 'API İstinadları',
                path: '/admin/dev/api',
                requiredPermissions: [PermissionSlugs.PLATFORM.DEVELOPER.API.READ]
            },
            {
                id: 'dev.sdk',
                label: 'SDK & Kitabxanalar',
                path: '/admin/dev/sdk',
                requiredPermissions: [PermissionSlugs.PLATFORM.DEVELOPER.SDK.READ]
            },
            {
                id: 'dev.webhooks',
                label: 'Webhooks',
                path: '/admin/dev/webhooks',
                requiredPermissions: [PermissionSlugs.PLATFORM.DEVELOPER.WEBHOOKS.READ]
            }
        ]
    }
];

export const TENANT_MENU: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Panel', // Dashboard
        path: '/',
        icon: Home,
        requiredPermissions: [PermissionSlugs.TENANT.DASHBOARD.VIEW]
    },
    {
        id: 'users',
        label: 'Əməkdaşlar', // Users
        path: '/users',
        icon: Users,
        requiredPermissions: [PermissionSlugs.TENANT.USERS.READ]
    },
    {
        id: 'settings',
        label: 'Tənzimləmələr', // Settings
        path: '/settings',
        icon: Settings,
        requiredPermissions: [PermissionSlugs.TENANT.SETTINGS.READ]
    }
];
