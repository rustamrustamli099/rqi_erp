
import type { PermissionNode } from "../_components/PermissionTreeEditor";
import { PermissionSlugs } from "@/app/security/permission-slugs";

// Helper for leaf
const leaf = (id: string, label: string, isDangerous = false): PermissionNode => ({
    id, label, isDangerous, children: []
});

// Helper for CRUD cluster
const crud = (idPrefix: string, label: string, options: { read?: string, create?: string, update?: string, delete?: string }): PermissionNode => {
    const children: PermissionNode[] = [];
    // if (options.view) children.push(leaf(options.view, "View")); // REMOVE VIEW per SAP rule? 
    // Wait, the slugs still exist in constants. If I want to show them in Editor, I must list them.
    // User Rule: "Remove view permissions safely". But if they exist in DB/Slugs, I should show them?
    // User said: "remove view permissions...". So I should probably NOT show View if I want to enforce it.
    // However, for compatibility, if the slug exists, I might list it but maybe deprecated?
    // Let's list READ as the primary View.

    if (options.read) children.push(leaf(options.read, "Read (Oxumaq)"));
    if (options.create) children.push(leaf(options.create, "Create (Yaratmaq)"));
    if (options.update) children.push(leaf(options.update, "Update (Düzəliş)"));
    if (options.delete) children.push(leaf(options.delete, "Delete (Silmək)", true));

    return {
        id: idPrefix,
        label,
        children
    };
};

export const PERMISSION_TREE_DATA: PermissionNode[] = [
    {
        id: 'system_root',
        label: 'System (Admin Panel)',
        scope: 'SYSTEM',
        children: [
            {
                id: 'dashboard_grp',
                label: 'Dashboard',
                children: [
                    leaf(PermissionSlugs.SYSTEM.DASHBOARD.READ, "Dashboard Access")
                ]
            },
            {
                id: 'tenants_grp',
                label: 'Tenant Management',
                children: [
                    ...crud('tenants', 'Tenants', {
                        read: PermissionSlugs.SYSTEM.TENANTS.READ,
                        create: PermissionSlugs.SYSTEM.TENANTS.CREATE,
                        update: PermissionSlugs.SYSTEM.TENANTS.UPDATE,
                        delete: PermissionSlugs.SYSTEM.TENANTS.DELETE
                    }).children!,
                    leaf(PermissionSlugs.SYSTEM.TENANTS.IMPERSONATE, "Impersonate (Giriş et)", true),
                    leaf(PermissionSlugs.SYSTEM.TENANTS.EXPORT, "Export to Excel"),
                    // Granular Management
                    leaf(PermissionSlugs.SYSTEM.TENANTS.MANAGE_USERS, "Manage Users"),
                    leaf(PermissionSlugs.SYSTEM.TENANTS.MANAGE_SECURITY, "Manage Security (2FA, Password)"),
                    leaf(PermissionSlugs.SYSTEM.TENANTS.MANAGE_BILLING, "Manage Billing & History"),
                    leaf(PermissionSlugs.SYSTEM.TENANTS.MANAGE_FEATURES, "Manage Features & Limits"),
                    leaf(PermissionSlugs.SYSTEM.TENANTS.MANAGE_CONTRACT, "Manage Contract (Suspend/Term)", true),
                    leaf(PermissionSlugs.SYSTEM.TENANTS.VIEW_AUDIT, "View Audit Logs")
                ]
            },
            {
                id: 'users_grp',
                label: 'Users & Identity',
                children: [
                    crud('users', 'Users List', {
                        read: PermissionSlugs.SYSTEM.USERS.READ,
                        create: PermissionSlugs.SYSTEM.USERS.CREATE,
                        update: PermissionSlugs.SYSTEM.USERS.UPDATE,
                        delete: PermissionSlugs.SYSTEM.USERS.DELETE
                    }),
                    crud('curators', 'Curators', {
                        read: PermissionSlugs.SYSTEM.CURATORS.READ,
                        create: PermissionSlugs.SYSTEM.CURATORS.CREATE,
                        update: PermissionSlugs.SYSTEM.CURATORS.UPDATE,
                        delete: PermissionSlugs.SYSTEM.CURATORS.DELETE
                    }),
                    crud('roles', 'Roles & Rights', {
                        read: PermissionSlugs.SYSTEM.USER_RIGHTS.ROLES.READ,
                        create: PermissionSlugs.SYSTEM.USER_RIGHTS.ROLES.CREATE,
                        update: PermissionSlugs.SYSTEM.USER_RIGHTS.ROLES.UPDATE,
                        delete: PermissionSlugs.SYSTEM.USER_RIGHTS.ROLES.DELETE
                    })
                ]
            },
            {
                id: 'billing_grp',
                label: 'Billing Engine',
                children: [
                    crud('marketplace', 'Marketplace', {
                        read: PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.READ,
                        create: PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.MANAGE
                    }),
                    crud('plans', 'Plans', {
                        read: PermissionSlugs.SYSTEM.BILLING.PLANS.READ,
                        create: PermissionSlugs.SYSTEM.BILLING.PLANS.MANAGE
                    }),
                    crud('invoices', 'Invoices', {
                        read: PermissionSlugs.SYSTEM.BILLING.INVOICES.READ,
                    }),
                    leaf(PermissionSlugs.SYSTEM.BILLING.INVOICES.APPROVE, "Approve Invoices", true)
                ]
            },
            {
                id: 'settings_grp',
                label: 'Settings & Config',
                children: [
                    {
                        id: 'general_grp',
                        label: 'General',
                        children: [
                            leaf(PermissionSlugs.SYSTEM.SETTINGS.GENERAL.READ, "General Settings Read"),
                            leaf(PermissionSlugs.SYSTEM.SETTINGS.GENERAL.UPDATE, "General Settings Update"),
                            leaf(PermissionSlugs.SYSTEM.SETTINGS.NOTIFICATIONS.READ, "Notifications Read")
                        ]
                    },
                    {
                        id: 'dictionaries_grp',
                        label: 'Dictionaries',
                        children: [
                            crud('sectors', 'Sectors', {
                                read: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.SECTORS.READ,
                            }),
                            // FLATTENED ADDRESSES
                            {
                                id: 'addresses_flat',
                                label: 'Addresses (Unit/Country/City)',
                                children: [
                                    leaf(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.READ_COUNTRY, "Read Country"),
                                    leaf(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.READ_CITY, "Read City"),
                                    leaf(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.READ_DISTRICT, "Read District")
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'console_grp',
                label: 'System Console',
                scope: 'SYSTEM',
                isDangerous: true,
                children: [
                    leaf(PermissionSlugs.SYSTEM.CONSOLE.DASHBOARD.READ, "Console Dashboard"),
                    leaf(PermissionSlugs.SYSTEM.CONSOLE.TOOLS.EXECUTE, "Execute Tools", true),
                    leaf(PermissionSlugs.SYSTEM.CONSOLE.SCHEDULER.EXECUTE, "Run Jobs", true)
                ]
            }
        ]
    }
];
