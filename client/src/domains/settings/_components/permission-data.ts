
import { type PermissionNode } from "./PermissionTreeEditor"
import { PermissionSlugs } from "@/app/security/permission-slugs"

// NOTE: These IDs must match what the backend expects AND what the Menu expects.
// We now use PermissionSlugs constants to ensure alignment with the Sidebar/Simulator.

export const permissionsStructure: PermissionNode[] = [
    {
        id: "admin_panel",
        label: "Admin Paneli",
        scope: "SYSTEM",
        children: [
            {
                id: "admin.dashboard", // Group ID
                label: "Dashboard",
                children: [
                    { id: PermissionSlugs.SYSTEM.DASHBOARD.VIEW, label: "View Dashboard" },
                    { id: PermissionSlugs.SYSTEM.DASHBOARD.READ, label: "Read Data" }
                ]
            },
            {
                id: "admin.tenants",
                label: "Tenantlar",
                children: [
                    { id: PermissionSlugs.SYSTEM.TENANTS.VIEW, label: "View List" },
                    { id: PermissionSlugs.SYSTEM.TENANTS.READ, label: "Read Details" },
                    { id: PermissionSlugs.SYSTEM.TENANTS.CREATE, label: "Create Tenant" },
                    { id: PermissionSlugs.SYSTEM.TENANTS.UPDATE, label: "Update Tenant" },
                    { id: PermissionSlugs.SYSTEM.TENANTS.DELETE, label: "Delete Tenant", isDangerous: true },
                    { id: PermissionSlugs.SYSTEM.TENANTS.IMPERSONATE, label: "Impersonate (Log in as)", isDangerous: true },
                    { id: PermissionSlugs.SYSTEM.TENANTS.MANAGE, label: "Manage Subscription" },
                ]
            },
            {
                id: "admin.branches",
                label: "Filiallar",
                children: [
                    { id: PermissionSlugs.SYSTEM.BRANCHES.VIEW, label: "View List" },
                    { id: PermissionSlugs.SYSTEM.BRANCHES.READ, label: "Read Details" },
                    { id: PermissionSlugs.SYSTEM.BRANCHES.CREATE, label: "Create Branch" },
                    { id: PermissionSlugs.SYSTEM.BRANCHES.UPDATE, label: "Update Branch" },
                    { id: PermissionSlugs.SYSTEM.BRANCHES.DELETE, label: "Delete Branch", isDangerous: true },
                ]
            },
            {
                id: "admin.users",
                label: "İstifadəçilər",
                children: [
                    {
                        id: "admin.users.users",
                        label: "İstifadəçilər",
                        children: [
                            { id: PermissionSlugs.SYSTEM.USERS.VIEW, label: "View List" },
                            { id: PermissionSlugs.SYSTEM.USERS.READ, label: "Read Profile" },
                            { id: PermissionSlugs.SYSTEM.USERS.CREATE, label: "Create User" },
                            { id: PermissionSlugs.SYSTEM.USERS.UPDATE, label: "Update User" },
                            { id: PermissionSlugs.SYSTEM.USERS.DELETE, label: "Delete User", isDangerous: true },
                            { id: PermissionSlugs.SYSTEM.USERS.INVITE, label: "Invite via Email" },
                            { id: PermissionSlugs.SYSTEM.USERS.CONNECT_TO_EMPLOYEE, label: "Connect to Employee Record" },
                        ]
                    },
                    {
                        id: "admin.users.curators",
                        label: "Kuratorlar",
                        children: [
                            { id: PermissionSlugs.SYSTEM.CURATORS.VIEW, label: "View List" },
                            { id: PermissionSlugs.SYSTEM.CURATORS.READ, label: "Read Profile" },
                            { id: PermissionSlugs.SYSTEM.CURATORS.CREATE, label: "Create Curator" },
                            { id: PermissionSlugs.SYSTEM.CURATORS.UPDATE, label: "Update Curator" },
                            { id: PermissionSlugs.SYSTEM.CURATORS.DELETE, label: "Delete Curator", isDangerous: true },
                        ]
                    }
                ]
            },
            {
                id: "admin.billing",
                label: "Bilinq və Maliyyə",
                children: [
                    {
                        id: "admin.billing.market_place",
                        label: "Market Place",
                        children: [
                            { id: PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.VIEW, label: "View Marketplace" },
                            { id: PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.READ, label: "Read Items" },
                            { id: PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.MANAGE, label: "Manage Items" },
                        ]
                    },
                    {
                        id: "admin.billing.compact_packages",
                        label: "Paketlər",
                        children: [
                            { id: PermissionSlugs.SYSTEM.BILLING.PACKAGES.VIEW, label: "View Packages" },
                            { id: PermissionSlugs.SYSTEM.BILLING.PACKAGES.READ, label: "Read Details" },
                            { id: PermissionSlugs.SYSTEM.BILLING.PACKAGES.MANAGE, label: "Manage Packages" },
                        ]
                    },
                    {
                        id: "admin.billing.plans",
                        label: "Planlar",
                        children: [
                            { id: PermissionSlugs.SYSTEM.BILLING.PLANS.VIEW, label: "View Plans" },
                            { id: PermissionSlugs.SYSTEM.BILLING.PLANS.READ, label: "Read Details" },
                            { id: PermissionSlugs.SYSTEM.BILLING.PLANS.MANAGE, label: "Manage Plans" },
                        ]
                    },
                    {
                        id: "admin.billing.invoices",
                        label: "Fakturalar",
                        children: [
                            { id: PermissionSlugs.SYSTEM.BILLING.INVOICES.VIEW, label: "View List" },
                            { id: PermissionSlugs.SYSTEM.BILLING.INVOICES.READ, label: "Read Details" },
                            { id: PermissionSlugs.SYSTEM.BILLING.INVOICES.APPROVE, label: "Approve Invoice" },
                        ]
                    },
                    {
                        id: "admin.billing.licenses",
                        label: "Lisenziyalar",
                        children: [
                            { id: PermissionSlugs.SYSTEM.BILLING.LICENSES.VIEW, label: "View List" },
                            { id: PermissionSlugs.SYSTEM.BILLING.LICENSES.READ, label: "Read Details" },
                            { id: PermissionSlugs.SYSTEM.BILLING.LICENSES.MANAGE, label: "Change Plan", isDangerous: true },
                        ]
                    },
                ]
            },
            {
                id: "admin.approvals",
                label: "Təsdiqləmələr (Approvals)",
                children: [
                    { id: PermissionSlugs.SYSTEM.APPROVALS.VIEW, label: "View List" },
                    { id: PermissionSlugs.SYSTEM.APPROVALS.READ, label: "Read Details" },
                    { id: PermissionSlugs.SYSTEM.APPROVALS.APPROVE, label: "Approve Request" },
                ]
            },
            {
                id: "admin.file_manager",
                label: "Fayl Meneceri",
                children: [
                    { id: PermissionSlugs.SYSTEM.FILES.VIEW, label: "View Files" },
                    { id: PermissionSlugs.SYSTEM.FILES.READ, label: "Read Files" },
                    { id: PermissionSlugs.SYSTEM.FILES.UPLOAD, label: "Upload File" },
                    { id: PermissionSlugs.SYSTEM.FILES.DELETE, label: "Delete File", isDangerous: true },
                ]
            },
            {
                id: "admin.system_guide",
                label: "Sistem Bələdçisi",
                children: [
                    { id: PermissionSlugs.SYSTEM.GUIDE.VIEW, label: "View Guide" },
                    { id: PermissionSlugs.SYSTEM.GUIDE.READ, label: "Read Content" },
                    { id: PermissionSlugs.SYSTEM.GUIDE.EDIT, label: "Edit Content" },
                    { id: PermissionSlugs.SYSTEM.GUIDE.MANAGE, label: "Create Content" },
                ]
            },
            {
                id: "admin.settings",
                label: "Tənzimləmələr",
                children: [
                    {
                        id: "admin.settings.general",
                        label: "Ümumi",
                        children: [
                            { id: PermissionSlugs.SYSTEM.SETTINGS.GENERAL.VIEW, label: "View General Settings" },
                            { id: PermissionSlugs.SYSTEM.SETTINGS.GENERAL.READ, label: "Read Settings" },
                            { id: PermissionSlugs.SYSTEM.SETTINGS.GENERAL.UPDATE, label: "Update Settings" },
                            {
                                id: "admin.settings.notifications",
                                label: "Bildiriş Mühərriki",
                                children: [
                                    { id: PermissionSlugs.SYSTEM.SETTINGS.NOTIFICATIONS.VIEW, label: "View Rules" },
                                    { id: PermissionSlugs.SYSTEM.SETTINGS.NOTIFICATIONS.READ, label: "Read Rules" },
                                ]
                            }
                        ]
                    },
                    {
                        id: "admin.settings.communication",
                        label: "Kommunikasiya",
                        children: [
                            { id: PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.VIEW, label: "View Settings" },
                            { id: PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ, label: "Read Settings" },
                            { id: PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.MANAGE, label: "Manage Settings" },
                        ]
                    },
                    {
                        id: "admin.settings.security",
                        label: "Təhlükəsizlik",
                        children: [
                            { id: PermissionSlugs.SYSTEM.SETTINGS.SECURITY.VIEW, label: "View Settings" },
                            { id: PermissionSlugs.SYSTEM.SETTINGS.SECURITY.READ, label: "Read Settings" },
                            { id: PermissionSlugs.SYSTEM.SETTINGS.SECURITY.MANAGE, label: "Manage Settings" },
                            {
                                id: "admin.settings.security.roles",
                                label: "Rolların İdarə Edilməsi",
                                children: [
                                    { id: PermissionSlugs.SYSTEM.ROLES.VIEW, label: "View Roles" },
                                    { id: PermissionSlugs.SYSTEM.ROLES.READ, label: "Read Role Details" },
                                    { id: PermissionSlugs.SYSTEM.ROLES.CREATE, label: "Create Role" },
                                    { id: PermissionSlugs.SYSTEM.ROLES.UPDATE, label: "Update Role" },
                                    { id: PermissionSlugs.SYSTEM.ROLES.DELETE, label: "Delete Role", isDangerous: true },
                                ]
                            }
                        ]
                    },
                    {
                        id: "admin.settings.system_configs",
                        label: "Sistem Konfiqurasiyaları",
                        children: [
                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.VIEW, label: "View Configs" },
                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.READ, label: "Read Configs" },
                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.MANAGE, label: "Update Configs" },
                            {
                                id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.VIEW,
                                label: "Soraqçalar (Dictionaries)",
                                children: [
                                    {
                                        id: "admin.config.dict.sectors",
                                        label: "Sektorlar",
                                        children: [
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.SECTORS.VIEW, label: "View List" },
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.SECTORS.READ, label: "Read Details" },
                                        ]
                                    },
                                    {
                                        id: "admin.config.dict.units",
                                        label: "Ölçü Vahidləri",
                                        children: [
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.UNITS.VIEW, label: "View List" },
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.UNITS.READ, label: "Read Details" },
                                        ]
                                    },
                                    {
                                        id: "admin.config.dict.currencies",
                                        label: "Valyutalar",
                                        children: [
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.CURRENCIES.VIEW, label: "View List" },
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.CURRENCIES.READ, label: "Read Details" },
                                        ]
                                    },
                                    {
                                        id: "admin.config.dict.timezones",
                                        label: "Saat Qurşaqları",
                                        children: [
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.TIME_ZONES.VIEW, label: "View List" },
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.TIME_ZONES.READ, label: "Read Details" },
                                        ]
                                    },
                                    {
                                        id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.VIEW,
                                        label: "Ünvanlar",
                                        children: [
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.VIEW, label: "View Addresses" },
                                            { id: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.ADDRESSES.READ, label: "Read Addresses" },
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: "system_console",
                label: "System Console",
                scope: "SYSTEM",
                children: [
                    { id: PermissionSlugs.SYSTEM.CONSOLE.VIEW, label: "Access Console" },
                    { id: PermissionSlugs.SYSTEM.CONSOLE.READ, label: "Read Console Data" },
                    {
                        id: "system.console.dashboard",
                        label: "Dashboard",
                        children: [
                            { id: PermissionSlugs.SYSTEM.CONSOLE.DASHBOARD.READ, label: "Read Dashboard" },
                        ]
                    },
                    {
                        id: "system.console.monitoring",
                        label: "Monitoring",
                        children: [
                            { id: PermissionSlugs.SYSTEM.CONSOLE.MONITORING.READ, label: "Read Monitoring" },
                        ]
                    },
                    {
                        id: "system.console.audit",
                        label: "Audit",
                        children: [
                            { id: PermissionSlugs.SYSTEM.CONSOLE.AUDIT.READ, label: "Read Audit Logs" },
                            { id: PermissionSlugs.SYSTEM.CONSOLE.AUDIT.MANAGE, label: "Export Audit Logs" },
                        ]
                    },
                    {
                        id: "system.console.features",
                        label: "Feature Flags",
                        children: [
                            { id: PermissionSlugs.SYSTEM.CONSOLE.FEATURES.READ, label: "Read Flags" },
                            { id: PermissionSlugs.SYSTEM.CONSOLE.FEATURES.MANAGE, label: "Manage Flags", isDangerous: true },
                        ]
                    },
                    {
                        id: "system.console.tools",
                        label: "Tools",
                        children: [
                            { id: PermissionSlugs.SYSTEM.CONSOLE.TOOLS.READ, label: "Access Tools" },
                            { id: PermissionSlugs.SYSTEM.CONSOLE.TOOLS.EXECUTE, label: "Execute Tools", isDangerous: true },
                        ]
                    }
                ]
            },
            {
                id: "developer_hub",
                label: "Developer Hub",
                scope: "SYSTEM",
                children: [
                    { id: PermissionSlugs.SYSTEM.DEVELOPER.VIEW, label: "Access Hub" },
                    { id: PermissionSlugs.SYSTEM.DEVELOPER.READ, label: "Read Hub" },
                    {
                        id: "dev.api",
                        label: "API & SDK",
                        children: [
                            { id: PermissionSlugs.SYSTEM.DEVELOPER.API.READ, label: "Read API Docs" },
                            { id: PermissionSlugs.SYSTEM.DEVELOPER.SDK.READ, label: "Read SDK Docs" },
                        ]
                    },
                    {
                        id: "dev.webhooks",
                        label: "Webhooks",
                        children: [
                            { id: PermissionSlugs.SYSTEM.DEVELOPER.WEBHOOKS.READ, label: "Read Webhooks" },
                            { id: PermissionSlugs.SYSTEM.DEVELOPER.WEBHOOKS.MANAGE, label: "Manage Webhooks" },
                        ]
                    }
                ]
            }
        ]
    }
]

// Helper to flatten tree for lookup
export const getPermissionLabel = (slug: string): string => {
    let label = slug;
    const find = (nodes: PermissionNode[]) => {
        for (const node of nodes) {
            if (node.id === slug) {
                label = node.label;
                return;
            }
            if (node.children) find(node.children);
        }
    }
    find(permissionsStructure);
    return label;
}
