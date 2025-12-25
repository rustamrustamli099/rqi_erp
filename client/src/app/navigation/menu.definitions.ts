// menu.definitions.ts (FINAL CANONICAL MODEL)

export interface MenuItem {
    id: string;
    label: string;
    title?: string; // Legacy Compat
    icon?: string;
    path?: string;
    route?: string; // Legacy Compat
    tab?: string;
    children?: MenuItem[];
    requiredPermissions?: string[]; // New Logic
    permissionPrefixes?: string[]; // Legacy Compat
}

export type AdminMenuItem = MenuItem; // Alias for backward compatibility

// --- SYSTEM ADMIN MENU (FLAT SIDEBAR) ---
export const PLATFORM_MENU: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/admin/dashboard',
        route: '/admin/dashboard',
        requiredPermissions: ['system.dashboard.access'],
        permissionPrefixes: ['system.dashboard']
    },
    {
        id: 'tenants',
        label: 'Tenantlar',
        title: 'Tenants',
        icon: 'Building2',
        path: '/admin/tenants',
        route: '/admin/tenants',
        requiredPermissions: ['system.tenants.access'],
        permissionPrefixes: ['system.tenants']
    },
    {
        id: 'users',
        label: 'İstifadəçilər',
        title: 'Users',
        icon: 'Users',
        path: '/admin/users',
        route: '/admin/users',
        tab: 'users_list', // Default Tab
        requiredPermissions: ['system.users.access'],
        permissionPrefixes: ['system.users']
    },
    {
        id: 'billing',
        label: 'Bilinq',
        title: 'Billing',
        icon: 'CreditCard',
        path: '/admin/billing',
        route: '/admin/billing',
        tab: 'plans', // Default Tab
        requiredPermissions: ['system.billing.access'],
        permissionPrefixes: ['system.billing']
    },
    {
        id: 'settings',
        label: 'Tənzimləmələr',
        title: 'Settings',
        icon: 'Settings',
        path: '/admin/settings',
        route: '/admin/settings',
        tab: 'general', // Default Tab
        requiredPermissions: ['system.settings.access'],
        permissionPrefixes: ['system.settings']
    },
    {
        id: 'system_console',
        label: 'Sistem Konsolu',
        title: 'System Console',
        icon: 'Terminal',
        path: '/admin/system-console',
        route: '/admin/system-console',
        tab: 'monitoring', // Default Tab
        requiredPermissions: ['system.system_console.access'],
        permissionPrefixes: ['system.system_console']
    }
];

// --- TENANT MENU ---
export const TENANT_MENU: MenuItem[] = [{
    id: 'dashboard',
    label: 'Əsas Səhifə',
    title: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    route: '/dashboard',
    requiredPermissions: ['tenant.dashboard.access']
},
{
    id: 'sales',
    label: 'Satışlar',
    title: 'Sales',
    icon: 'ShoppingCart',
    path: '/sales',
    route: '/sales',
    requiredPermissions: ['tenant.sales.access']
},
{
    id: 'warehouse',
    label: 'Anbar',
    title: 'Warehouse',
    icon: 'Package',
    path: '/warehouse',
    route: '/warehouse',
    requiredPermissions: ['tenant.warehouse.access']
},
{
    id: 'settings',
    label: 'Ayarlar',
    title: 'Settings',
    icon: 'Settings',
    path: '/settings',
    route: '/settings',
    requiredPermissions: ['tenant.settings.access']
}
];