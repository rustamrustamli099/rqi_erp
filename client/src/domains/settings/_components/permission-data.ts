
import { type PermissionNode } from "./PermissionTreeEditor"

// NOTE: These IDs must match what the backend expects.
// Based on server/src/common/constants/perms.ts
// Structure: section -> subsection -> action
// Current implementation convention: Use PermissionSlugs constant where possible, but here we strictly follow server keys.
// Example: admin_panel_permissions.dashboard.perms['read'] -> "admin_panel_permissions.dashboard.read" ? 
// OR is the backend using a simpler slug? 
// Usually typically "dashboard:read" or "admin:dashboard:read".
// Given existing code uses "PermissionSlugs.PLATFORM...", let's try to maintain that convention if it aligns.
// However, the user said "create based on perms.ts".
// I will use readable IDs derived from the object path for now to ensure coverage.

export const permissionsStructure: PermissionNode[] = [
    {
        id: "admin_panel",
        label: "Admin Paneli",
        scope: "SYSTEM",
        children: [
            {
                id: "admin.dashboard", // Mapped from admin_panel_permissions.dashboard
                label: "Dashboard",
                children: [
                    { id: "admin.dashboard.read", label: "Read" }
                ]
            },
            {
                id: "admin.tenants", // admin_panel_permissions.tenants
                label: "Tenantlar",
                children: [
                    { id: "admin.tenants.read", label: "Read" },
                    { id: "admin.tenants.create", label: "Create" },
                    { id: "admin.tenants.update", label: "Update" },
                    { id: "admin.tenants.delete", label: "Delete", isDangerous: true },
                    { id: "admin.tenants.export_to_excel", label: "Export to Excel" },
                    { id: "admin.tenants.tenant_users", label: "Tenant Users" },
                    { id: "admin.tenants.reset_password", label: "Reset Password", isDangerous: true },
                    { id: "admin.tenants.2fa_app_cancel", label: "Cancel 2FA" },
                    { id: "admin.tenants.2fa_app_enable", label: "Enable 2FA" },
                    { id: "admin.tenants.2fa_app_generate", label: "Generate 2FA" },
                    { id: "admin.tenants.impersonate", label: "Impersonate", isDangerous: true },
                    { id: "admin.tenants.modules", label: "Modules" },
                    { id: "admin.tenants.storage_limit", label: "Storage Limit" },
                    { id: "admin.tenants.billing_history", label: "Billing History" },
                    { id: "admin.tenants.limitations", label: "Limitations" },
                    { id: "admin.tenants.sign_contract", label: "Sign Contract" },
                    { id: "admin.tenants.terminate_contract", label: "Terminate Contract", isDangerous: true },
                    { id: "admin.tenants.suspend", label: "Suspend", isDangerous: true },
                ]
            },
            {
                id: "admin.branches",
                label: "Filiallar",
                children: [
                    { id: "admin.branches.read", label: "Read" },
                    { id: "admin.branches.create", label: "Create" },
                    { id: "admin.branches.update", label: "Update" },
                    { id: "admin.branches.delete", label: "Delete", isDangerous: true },
                    { id: "admin.branches.export_to_excel", label: "Export to Excel" },
                    { id: "admin.branches.read_details", label: "Read Details" },
                    { id: "admin.branches.change_status", label: "Change Status" },
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
                            { id: "admin.users.users.read", label: "Read" },
                            { id: "admin.users.users.create", label: "Create" },
                            { id: "admin.users.users.update", label: "Update" },
                            { id: "admin.users.users.delete", label: "Delete", isDangerous: true },
                            { id: "admin.users.users.export_to_excel", label: "Export to Excel" },
                            { id: "admin.users.users.change_status", label: "Change Status" },
                            { id: "admin.users.users.connect_to_employee", label: "Connect to Employee" },
                        ]
                    },
                    {
                        id: "admin.users.curators",
                        label: "Kuratorlar",
                        children: [
                            { id: "admin.users.curators.read", label: "Read" },
                            { id: "admin.users.curators.create", label: "Create" },
                            { id: "admin.users.curators.update", label: "Update" },
                            { id: "admin.users.curators.delete", label: "Delete", isDangerous: true },
                            { id: "admin.users.curators.export_to_excel", label: "Export to Excel" },
                            { id: "admin.users.curators.change_status", label: "Change Status" },
                            { id: "admin.users.curators.copy_id", label: "Copy ID" },
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
                            { id: "admin.billing.market_place.read", label: "Read" },
                            { id: "admin.billing.market_place.create", label: "Create" },
                            { id: "admin.billing.market_place.update", label: "Update" },
                            { id: "admin.billing.market_place.delete", label: "Delete", isDangerous: true },
                            { id: "admin.billing.market_place.export_to_excel", label: "Export" },
                            { id: "admin.billing.market_place.change_status", label: "Change Status" },
                        ]
                    },
                    {
                        id: "admin.billing.compact_packages",
                        label: "Compact Packages",
                        children: [
                            { id: "admin.billing.compact_packages.read", label: "Read" },
                            { id: "admin.billing.compact_packages.create", label: "Create" },
                            { id: "admin.billing.compact_packages.update", label: "Update" },
                            { id: "admin.billing.compact_packages.delete", label: "Delete", isDangerous: true },
                            { id: "admin.billing.compact_packages.export_to_excel", label: "Export" },
                            { id: "admin.billing.compact_packages.change_status", label: "Change Status" },
                        ]
                    },
                    {
                        id: "admin.billing.plans",
                        label: "Plans",
                        children: [
                            { id: "admin.billing.plans.read", label: "Read" },
                            { id: "admin.billing.plans.create", label: "Create" },
                            { id: "admin.billing.plans.update", label: "Update" },
                            { id: "admin.billing.plans.delete", label: "Delete", isDangerous: true },
                            { id: "admin.billing.plans.export_to_excel", label: "Export" },
                            { id: "admin.billing.plans.change_status", label: "Change Status" },
                        ]
                    },
                    {
                        id: "admin.billing.invoices",
                        label: "Invoices",
                        children: [
                            { id: "admin.billing.invoices.read", label: "Read" },
                            { id: "admin.billing.invoices.download_pdf", label: "Download PDF" },
                            { id: "admin.billing.invoices.send_email", label: "Send Email" },
                        ]
                    },
                    {
                        id: "admin.billing.licenses",
                        label: "Licenses",
                        children: [
                            { id: "admin.billing.licenses.read", label: "Read" },
                            { id: "admin.billing.licenses.audit_logs", label: "Audit Logs" },
                            { id: "admin.billing.licenses.change_plan", label: "Change Plan", isDangerous: true },
                        ]
                    },
                ]
            },
            {
                id: "admin.approvals",
                label: "Təsdiqləmələr (Approvals)",
                children: [
                    { id: "admin.approvals.read", label: "Read" },
                    { id: "admin.approvals.forward", label: "Forward" },
                    { id: "admin.approvals.approve", label: "Approve" },
                    { id: "admin.approvals.reject", label: "Reject" },
                    { id: "admin.approvals.export_to_excel", label: "Export" },
                ]
            },
            {
                id: "admin.file_manager",
                label: "Fayl Meneceri",
                children: [
                    { id: "admin.file_manager.read", label: "Read" },
                    { id: "admin.file_manager.create_folder", label: "Create Folder" },
                    { id: "admin.file_manager.dovload_file", label: "Download File" },
                    { id: "admin.file_manager.rename_folder", label: "Rename Folder" },
                    { id: "admin.file_manager.move_folder", label: "Move Folder" },
                    { id: "admin.file_manager.share_folder", label: "Share Folder" },
                    { id: "admin.file_manager.permissions_configuration", label: "Permissions Config", isDangerous: true },
                    { id: "admin.file_manager.delete_folder", label: "Delete Folder", isDangerous: true },
                    { id: "admin.file_manager.rename_file", label: "Rename File" },
                    { id: "admin.file_manager.move_file", label: "Move File" },
                    { id: "admin.file_manager.copy_file", label: "Copy File" },
                    { id: "admin.file_manager.share_file", label: "Share File" },
                    { id: "admin.file_manager.delete_file", label: "Delete File", isDangerous: true },
                    { id: "admin.file_manager.version", label: "Version Control" },
                ]
            },
            {
                id: "admin.system_guide",
                label: "Sistem Bələdçisi",
                children: [
                    { id: "admin.system_guide.read", label: "Read" },
                    { id: "admin.system_guide.create", label: "Create" },
                    { id: "admin.system_guide.update", label: "Update" },
                    { id: "admin.system_guide.delete", label: "Delete", isDangerous: true },
                    { id: "admin.system_guide.share", label: "Share" },
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
                            {
                                id: "admin.settings.general.company_profile",
                                label: "Company Profile",
                                children: [
                                    { id: "admin.settings.general.company_profile.read", label: "Read" },
                                    { id: "admin.settings.general.company_profile.create", label: "Create" },
                                    { id: "admin.settings.general.company_profile.update", label: "Update" }
                                ]
                            },
                            {
                                id: "admin.settings.general.notification_engine",
                                label: "Notification Engine",
                                children: [
                                    { id: "admin.settings.general.notification_engine.read", label: "Read" },
                                    { id: "admin.settings.general.notification_engine.create", label: "Create" },
                                    { id: "admin.settings.general.notification_engine.update", label: "Update" },
                                    { id: "admin.settings.general.notification_engine.delete", label: "Delete", isDangerous: true },
                                    { id: "admin.settings.general.notification_engine.export_to_excel", label: "Export" },
                                    { id: "admin.settings.general.notification_engine.change_status", label: "Change Status" },
                                    { id: "admin.settings.general.notification_engine.copy_json", label: "Copy JSON" },
                                ]
                            }
                        ]
                    },
                    {
                        id: "admin.settings.communication",
                        label: "Kommunikasiya",
                        children: [
                            {
                                id: "admin.settings.communication.smtp_email",
                                label: "SMTP Email",
                                children: [
                                    { id: "admin.settings.communication.smtp_email.read", label: "Read" },
                                    { id: "admin.settings.communication.smtp_email.create", label: "Create" },
                                    { id: "admin.settings.communication.smtp_email.update", label: "Update" },
                                    { id: "admin.settings.communication.smtp_email.delete", label: "Delete", isDangerous: true },
                                    { id: "admin.settings.communication.smtp_email.test_connection", label: "Test Connection" },
                                ]
                            },
                            {
                                id: "admin.settings.communication.smtp_sms",
                                label: "SMTP SMS",
                                children: [
                                    { id: "admin.settings.communication.smtp_sms.read", label: "Read" },
                                    { id: "admin.settings.communication.smtp_sms.create", label: "Create" },
                                    { id: "admin.settings.communication.smtp_sms.update", label: "Update" },
                                    { id: "admin.settings.communication.smtp_sms.delete", label: "Delete", isDangerous: true },
                                    { id: "admin.settings.communication.smtp_sms.test_connection", label: "Test Connection" },
                                    { id: "admin.settings.communication.smtp_sms.change_status", label: "Change Status" },
                                ]
                            }
                        ]
                    },
                    {
                        id: "admin.settings.security",
                        label: "Təhlükəsizlik",
                        children: [
                            {
                                id: "admin.settings.security.security_policy",
                                label: "Security Policy",
                                children: [
                                    {
                                        id: "admin.settings.security.security_policy.password_policy",
                                        label: "Password Policy",
                                        children: [
                                            { id: "admin.settings.security.security_policy.password_policy.read", label: "Read" },
                                            { id: "admin.settings.security.security_policy.password_policy.create", label: "Create" },
                                            { id: "admin.settings.security.security_policy.password_policy.update", label: "Update" },
                                        ]
                                    },
                                    {
                                        id: "admin.settings.security.security_policy.global_policy",
                                        label: "Global Policy",
                                        children: [
                                            { id: "admin.settings.security.security_policy.global_policy.read", label: "Read" },
                                            { id: "admin.settings.security.security_policy.global_policy.create", label: "Create" },
                                            { id: "admin.settings.security.security_policy.global_policy.update", label: "Update" },
                                            { id: "admin.settings.security.security_policy.global_policy.delete", label: "Delete", isDangerous: true },
                                        ]
                                    }
                                ]
                            },
                            {
                                id: "admin.settings.security.sso_oauth",
                                label: "SSO & OAuth",
                                children: [
                                    { id: "admin.settings.security.sso_oauth.read", label: "Read" },
                                    { id: "admin.settings.security.sso_oauth.create", label: "Create" },
                                    { id: "admin.settings.security.sso_oauth.update", label: "Update" },
                                    { id: "admin.settings.security.sso_oauth.delete", label: "Delete", isDangerous: true },
                                    { id: "admin.settings.security.sso_oauth.change_status", label: "Change Status" },
                                ]
                            },
                            {
                                id: "admin.settings.security.user_rights",
                                label: "İstifadəçi Hüquqları",
                                children: [
                                    {
                                        id: "admin.settings.security.user_rights.role",
                                        label: "Rollar",
                                        children: [
                                            { id: "admin.settings.security.user_rights.role.read", label: "Read" },
                                            { id: "admin.settings.security.user_rights.role.create", label: "Create" },
                                            { id: "admin.settings.security.user_rights.role.update", label: "Update" },
                                            { id: "admin.settings.security.user_rights.role.delete", label: "Delete", isDangerous: true },
                                            { id: "admin.settings.security.user_rights.role.export_to_excel", label: "Export" },
                                        ]
                                    },
                                    {
                                        id: "admin.settings.security.user_rights.permission",
                                        label: "İcazələr",
                                        children: [
                                            { id: "admin.settings.security.user_rights.permission.read", label: "Read" },
                                            { id: "admin.settings.security.user_rights.permission.create", label: "Create" },
                                            { id: "admin.settings.security.user_rights.permission.update", label: "Update" },
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: "admin.settings.system_configs",
                        label: "Sistem Konfiqurasiyaları",
                        children: [
                            {
                                id: "admin.settings.system_configs.billing",
                                label: "Billing Configurations",
                                children: [
                                    { id: "admin.settings.system_configs.billing.price_rules.read", label: "Price Rules: Read" },
                                    { id: "admin.settings.system_configs.billing.price_rules.update", label: "Price Rules: Update" },
                                    { id: "admin.settings.system_configs.billing.limits_quotas.read", label: "Limits: Read" },
                                    { id: "admin.settings.system_configs.billing.limits_quotas.update", label: "Limits: Update" },
                                    { id: "admin.settings.system_configs.billing.currency_tax.read", label: "Currency & Tax: Read" },
                                    { id: "admin.settings.system_configs.billing.currency_tax.update", label: "Currency & Tax: Update" },
                                ]
                            },
                            {
                                id: "admin.settings.system_configs.dictionary",
                                label: "Soraqçalar (Dictionary)",
                                children: [
                                    {
                                        id: "admin.settings.system_configs.dictionary.sectors",
                                        label: "Sectors",
                                        children: [
                                            { id: "admin.settings.system_configs.dictionary.sectors.read", label: "Read" },
                                            { id: "admin.settings.system_configs.dictionary.sectors.create", label: "Create" },
                                            { id: "admin.settings.system_configs.dictionary.sectors.update", label: "Update" },
                                            { id: "admin.settings.system_configs.dictionary.sectors.delete", label: "Delete", isDangerous: true },
                                        ]
                                    },
                                    {
                                        id: "admin.settings.system_configs.dictionary.units",
                                        label: "Units",
                                        children: [
                                            { id: "admin.settings.system_configs.dictionary.units.read", label: "Read" },
                                            { id: "admin.settings.system_configs.dictionary.units.create", label: "Create" },
                                            { id: "admin.settings.system_configs.dictionary.units.update", label: "Update" },
                                            { id: "admin.settings.system_configs.dictionary.units.delete", label: "Delete", isDangerous: true },
                                        ]
                                    },
                                    {
                                        id: "admin.settings.system_configs.dictionary.currencies",
                                        label: "Currencies",
                                        children: [
                                            { id: "admin.settings.system_configs.dictionary.currencies.read", label: "Read" },
                                            { id: "admin.settings.system_configs.dictionary.currencies.create", label: "Create" },
                                            { id: "admin.settings.system_configs.dictionary.currencies.update", label: "Update" },
                                            { id: "admin.settings.system_configs.dictionary.currencies.delete", label: "Delete", isDangerous: true },
                                        ]
                                    },
                                    {
                                        id: "admin.settings.system_configs.dictionary.addresses",
                                        label: "Addresses",
                                        children: [
                                            { id: "admin.settings.system_configs.dictionary.addresses.country.read", label: "Country: Read" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.country.create", label: "Country: Create" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.country.update", label: "Country: Update" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.country.delete", label: "Country: Delete", isDangerous: true },

                                            { id: "admin.settings.system_configs.dictionary.addresses.city.read", label: "City: Read" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.city.create", label: "City: Create" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.city.update", label: "City: Update" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.city.delete", label: "City: Delete", isDangerous: true },

                                            { id: "admin.settings.system_configs.dictionary.addresses.district.read", label: "District: Read" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.district.create", label: "District: Create" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.district.update", label: "District: Update" },
                                            { id: "admin.settings.system_configs.dictionary.addresses.district.delete", label: "District: Delete", isDangerous: true },
                                        ]
                                    },
                                    {
                                        id: "admin.settings.system_configs.dictionary.time_zones",
                                        label: "Time Zones",
                                        children: [
                                            { id: "admin.settings.system_configs.dictionary.time_zones.read", label: "Read" },
                                            { id: "admin.settings.system_configs.dictionary.time_zones.create", label: "Create" },
                                            { id: "admin.settings.system_configs.dictionary.time_zones.update", label: "Update" },
                                            { id: "admin.settings.system_configs.dictionary.time_zones.delete", label: "Delete", isDangerous: true },
                                            { id: "admin.settings.system_configs.dictionary.time_zones.set_default", label: "Set Default" },
                                        ]
                                    },
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
                    {
                        id: "system_console.dashboard",
                        label: "Dashboard",
                        children: [
                            { id: "system_console.dashboard.read", label: "Read" },
                            { id: "system_console.dashboard.change_technical_mode", label: "Technical Mode", isDangerous: true },
                            { id: "system_console.dashboard.end_all_sessions", label: "End All Sessions", isDangerous: true },
                            { id: "system_console.dashboard.clear_cache", label: "Clear Cache", isDangerous: true },
                        ]
                    },
                    {
                        id: "system_console.monitoring",
                        label: "Monitoring",
                        children: [
                            { id: "system_console.monitoring.dashboard.read", label: "Dashboard" },
                            { id: "system_console.monitoring.system_logs.read", label: "Logs: Read" },
                            { id: "system_console.monitoring.system_logs.clear", label: "Logs: Clear", isDangerous: true },
                        ]
                    },
                    {
                        id: "system_console.feature_flags",
                        label: "Feature Flags",
                        children: [
                            { id: "system_console.feature_flags.read", label: "Read" },
                            { id: "system_console.feature_flags.create", label: "Create" },
                            { id: "system_console.feature_flags.update", label: "Update" },
                            { id: "system_console.feature_flags.delete", label: "Delete", isDangerous: true },
                            { id: "system_console.feature_flags.change_status", label: "Change Status" },
                        ]
                    },
                    {
                        id: "system_console.tools",
                        label: "Tools",
                        children: [
                            { id: "system_console.tools.read", label: "Read" },
                            { id: "system_console.tools.clear_cache", label: "Clear Cache", isDangerous: true },
                            { id: "system_console.tools.change_maintenance_mode", label: "Maintenance Mode", isDangerous: true },
                        ]
                    }
                ]
            },
            {
                id: "developer_hub",
                label: "Developer Hub",
                scope: "SYSTEM",
                children: [
                    {
                        id: "developer_hub.api",
                        label: "API Reference",
                        children: [
                            { id: "developer_hub.api.read", label: "Read" },
                            { id: "developer_hub.api.open_swagger", label: "Open Swagger" },
                        ]
                    },
                    {
                        id: "developer_hub.webhooks",
                        label: "Webhooks",
                        children: [
                            { id: "developer_hub.webhooks.read", label: "Read" },
                            { id: "developer_hub.webhooks.send_test", label: "Send Test Payload" },
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
