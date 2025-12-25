
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

// --- SYSTEM ADMIN MENU ---
export const PLATFORM_MENU: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/admin/dashboard',
        route: '/admin/dashboard',
        requiredPermissions: ['system.dashboard.read'],
        permissionPrefixes: ['system.dashboard']
    },
    {
        id: 'tenants',
        label: 'Tenantlar',
        title: 'Tenants',
        icon: 'Building2',
        path: '/admin/tenants',
        route: '/admin/tenants',
        requiredPermissions: ['system.tenants.read'],
        permissionPrefixes: ['system.tenants']
    },
    {
        id: 'users',
        label: 'İstifadəçilər',
        title: 'Users',
        icon: 'Users',
        path: '/admin/users',
        route: '/admin/users', // Base route for sidebar matching
        tab: 'users_list',
        children: [
            {
                id: 'users_list',
                label: 'İstifadəçilər',
                title: 'Users List',
                path: '/admin/users',
                route: '/admin/users',
                requiredPermissions: ['system.users.users.read']
            },
            {
                id: 'curators',
                label: 'Kuratorlar',
                title: 'Curators',
                path: '/admin/curators',
                route: '/admin/curators',
                requiredPermissions: ['system.users.curators.read']
            }
        ]
    },
    {
        id: 'billing',
        label: 'Bilinq',
        title: 'Billing',
        icon: 'CreditCard',
        path: '/admin/billing',
        route: '/admin/billing',
        children: [
            { id: 'plans', label: 'Planlar', title: 'Plans', path: '/admin/billing/plans', route: '/admin/billing/plans', requiredPermissions: ['system.billing.plans.read'] },
            { id: 'invoices', label: 'Fakturalar', title: 'Invoices', path: '/admin/billing/invoices', route: '/admin/billing/invoices', requiredPermissions: ['system.billing.invoices.read'] },
        ]
    },
    {
        id: 'settings',
        label: 'Tənzimləmələr',
        title: 'Settings',
        icon: 'Settings',
        path: '/admin/settings',
        route: '/admin/settings',
        children: [
            { id: 'general', label: 'Ümumi', title: 'General', path: '/admin/settings/general', route: '/admin/settings/general', requiredPermissions: ['system.settings.general.read'] },
            { id: 'security', label: 'Təhlükəsizlik', title: 'Security', path: '/admin/settings/security', route: '/admin/settings/security', requiredPermissions: ['system.settings.security.read'] },
            { id: 'smtp', label: 'SMTP & SMS', title: 'Communication', path: '/admin/settings/communication', route: '/admin/settings/communication', requiredPermissions: ['system.settings.communication.smtp_email.read'] },
        ]
    },
    {
        id: 'system_console',
        label: 'Sistem Konsolu',
        title: 'System Console',
        icon: 'Terminal',
        path: '/admin/system-console',
        route: '/admin/system-console',
        children: [
            { id: 'monitoring', label: 'Monitorinq', path: '/admin/system-console/monitoring', route: '/admin/system-console/monitoring', requiredPermissions: ['system.system_console.monitoring.read'] },
            { id: 'audit', label: 'Audit', path: '/admin/system-console/audit', route: '/admin/system-console/audit', requiredPermissions: ['system.system_console.audit_compliance.read'] },
            { id: 'jobs', label: 'Job Scheduler', path: '/admin/system-console/jobs', route: '/admin/system-console/jobs', requiredPermissions: ['system.system_console.job_scheduler.read'] },
            { id: 'feature_flags', label: 'Feature Flags', path: '/admin/system-console/feature-flags', route: '/admin/system-console/feature-flags', requiredPermissions: ['system.system_console.feature_flags.read'] },
        ]
    }
];

// --- TENANT MENU ---
export const TENANT_MENU: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Əsas Səhifə',
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/dashboard',
        route: '/dashboard',
        requiredPermissions: ['tenant.dashboard.read']
    },
    {
        id: 'sales',
        label: 'Satışlar',
        title: 'Sales',
        icon: 'ShoppingCart',
        path: '/sales',
        route: '/sales',
        requiredPermissions: ['tenant.sales.read']
    },
    {
        id: 'warehouse',
        label: 'Anbar',
        title: 'Warehouse',
        icon: 'Package',
        path: '/warehouse',
        route: '/warehouse',
        requiredPermissions: ['tenant.warehouse.read']
    },
    {
        id: 'settings',
        label: 'Ayarlar',
        title: 'Settings',
        icon: 'Settings',
        path: '/settings',
        route: '/settings',
        requiredPermissions: ['tenant.settings.read']
    }
];

