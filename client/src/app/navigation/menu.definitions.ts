
// menu.definitions.ts (FINAL CANONICAL MODEL)

export type AdminMenuItem = {
    id: string;
    title: string;
    icon: string;
    route: string; // always a real route
    tab?: string;
    permissionPrefixes: string[];
};

export const ADMIN_MENU: AdminMenuItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        route: '/admin/dashboard',
        permissionPrefixes: ['system.dashboard'],
    },

    {
        id: 'users',
        title: 'Users',
        icon: 'Users',
        route: '/admin/users',
        tab: 'users',
        permissionPrefixes: [
            'system.users.users',
            'system.users.curators',
        ],
    },

    {
        id: 'billing',
        title: 'Billing',
        icon: 'CreditCard',
        route: '/admin/billing',
        tab: 'plans',
        permissionPrefixes: [
            'system.billing.plans',
            'system.billing.invoices',
            'system.billing.subscriptions',
        ],
    },

    {
        id: 'settings',
        title: 'Settings',
        icon: 'Settings',
        route: '/admin/settings',
        tab: 'general',
        permissionPrefixes: [
            'system.settings.general',
            'system.settings.dictionary',
            'system.settings.system_configurations',
            'system.settings.security',
        ],
    },

    {
        id: 'system_console',
        title: 'System Console',
        icon: 'Shield',
        route: '/admin/system-console',
        tab: 'monitoring',
        permissionPrefixes: [
            'system.system_console.monitoring', // Aligned with backend structure
            'system.system_console.audit',
            'system.system_console.jobs',
        ],
    },

    {
        id: 'developer_hub',
        title: 'Developer Hub',
        icon: 'Code',
        route: '/admin/developer',
        tab: 'api',
        permissionPrefixes: [
            'system.developer_hub.api', // Aligned with backend structure (often api_reference)
            'system.developer_hub.sdk',
            'system.developer_hub.webhooks',
        ],
    },
];

export const PLATFORM_MENU = ADMIN_MENU;
export const TENANT_MENU: AdminMenuItem[] = []; // Placeholder for Tenant