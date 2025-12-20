import { PermissionSlugs } from "@/app/security/permission-slugs"
import { type PermissionNode } from "./PermissionTreeEditor"

export const permissionsStructure: PermissionNode[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        children: [
            { id: PermissionSlugs.PLATFORM.DASHBOARD.VIEW, label: "View Dashboard" }
        ]
    },
    {
        id: "admin",
        label: "Admin Paneli",
        children: [
            {
                id: "admin.tenants",
                label: "Tenantlar",
                children: [
                    { id: PermissionSlugs.PLATFORM.TENANTS.READ, label: "Read" },
                    { id: PermissionSlugs.PLATFORM.TENANTS.CREATE, label: "Create" },
                    { id: PermissionSlugs.PLATFORM.TENANTS.UPDATE, label: "Update" },
                    { id: PermissionSlugs.PLATFORM.TENANTS.DELETE, label: "Delete", isDangerous: true },
                    { id: "admin.tenants.manage-scope", label: "Curator Təyini" }
                ]
            },
            {
                id: "admin.branches",
                label: "Filiallar",
                children: [
                    { id: PermissionSlugs.PLATFORM.BRANCHES.READ, label: "Read" },
                    { id: PermissionSlugs.PLATFORM.BRANCHES.CREATE, label: "Create" },
                    { id: PermissionSlugs.PLATFORM.BRANCHES.UPDATE, label: "Update" },
                    { id: PermissionSlugs.PLATFORM.BRANCHES.DELETE, label: "Delete", isDangerous: true },
                ]
            },
            {
                id: "admin.users",
                label: "İstifadəçilər",
                children: [
                    { id: PermissionSlugs.PLATFORM.USERS.READ, label: "Read" },
                    { id: PermissionSlugs.PLATFORM.USERS.CREATE, label: "Create" },
                    { id: PermissionSlugs.PLATFORM.USERS.UPDATE, label: "Update" },
                    { id: PermissionSlugs.PLATFORM.USERS.DELETE, label: "Delete", isDangerous: true },
                ]
            },
            {
                id: "admin.settings",
                label: "Tənzimləmələr",
                children: [
                    {
                        id: "settings.general",
                        label: "Ümumi",
                        children: [
                            { id: PermissionSlugs.PLATFORM.SETTINGS.GENERAL.READ, label: "Read" },
                            { id: PermissionSlugs.PLATFORM.SETTINGS.GENERAL.UPDATE, label: "Update" },
                        ]
                    },
                    {
                        id: "settings.security",
                        label: "Təhlükəsizlik",
                        children: [
                            { id: PermissionSlugs.PLATFORM.SETTINGS.SECURITY.READ, label: "Read" },
                            { id: PermissionSlugs.PLATFORM.SETTINGS.SECURITY.MANAGE, label: "Manage", isDangerous: true },
                        ]
                    },
                    {
                        id: "settings.roles",
                        label: "İstifadəçi hüquqları",
                        children: [
                            { id: "settings.roles.read", label: "Read Roles" },
                            { id: "settings.roles.manage", label: "Manage Roles", isDangerous: true },
                        ]
                    },
                ]
            },
            {
                id: "admin.console",
                label: "System Console",
                children: [
                    { id: PermissionSlugs.PLATFORM.CONSOLE.READ, label: "Access Console" },
                    { id: PermissionSlugs.PLATFORM.CONSOLE.AUDIT.READ, label: "View Audit Logs" },
                    { id: PermissionSlugs.PLATFORM.CONSOLE.FEATURES.MANAGE, label: "Manage Feature Flags", isDangerous: true },
                ]
            }
        ]
    },
    {
        id: "hr",
        label: "İnsan Resursları (HR)",
        children: [
            {
                id: "hr.employees",
                label: "İşçilər",
                children: [
                    { id: "hr.employees.view", label: "View" },
                    { id: "hr.employees.manage", label: "Manage" },
                ]
            },
            {
                id: "hr.payroll",
                label: "Maaşlar",
                children: [
                    { id: "hr.payroll.view", label: "View" },
                    { id: "hr.payroll.manage", label: "Manage", isDangerous: true },
                ]
            },
        ]
    },
    {
        id: "finance",
        label: "Maliyyə",
        children: [
            {
                id: "finance.invoices",
                label: "Fakturalar",
                children: [
                    { id: PermissionSlugs.PLATFORM.BILLING.INVOICES.READ, label: "View" },
                    { id: PermissionSlugs.PLATFORM.BILLING.INVOICES.APPROVE, label: "Approve" },
                ]
            },
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
