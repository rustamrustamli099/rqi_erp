import { PermissionRegistry } from './permissions';

export const RolePresets = {
    SYSTEM: {
        SUPER_ADMIN: {
            name: 'System Super Admin',
            description: 'Full system access with impersonation capabilities',
            permissions: Object.values(PermissionRegistry).flatMap(group => Object.values(group)), // ALL permissions
        },
        SUPPORT: {
            name: 'System Support',
            description: 'Read-only access to system consoles and tenant debug capabilities',
            permissions: [
                PermissionRegistry.DASHBOARD.VIEW,
                PermissionRegistry.TENANTS.VIEW,
                PermissionRegistry.BRANCHES.VIEW,
                PermissionRegistry.USERS.USERS_VIEW,
                PermissionRegistry.USERS.CURATORS_VIEW,
                PermissionRegistry.SYSTEM_CONSOLE.DASHBOARD_VIEW,
                PermissionRegistry.SYSTEM_CONSOLE.MONITORING_VIEW,
                PermissionRegistry.SYSTEM_CONSOLE.AUDIT_COMPLIANCE_VIEW,
                PermissionRegistry.SYSTEM_CONSOLE.FEEDBACK_VIEW,
                // Can impersonate to debug
                PermissionRegistry.SYSTEM_CONSOLE.USERS_IMPERSONATE,
            ],
        },
        AUDITOR: {
            name: 'System Auditor',
            description: 'Strictly for compliance & audit log review',
            permissions: [
                PermissionRegistry.SYSTEM_CONSOLE.AUDIT_COMPLIANCE_VIEW,
                PermissionRegistry.SYSTEM_CONSOLE.DATA_RETENTION_VIEW,
                PermissionRegistry.SETTINGS.USER_RIGHTS_VIEW,
            ],
        },
        DEVELOPER: {
            name: 'System Developer',
            description: 'Access to Developer Hub and Technical Monitoring',
            permissions: [
                ...Object.values(PermissionRegistry.DEVELOPER_HUB),
                PermissionRegistry.SYSTEM_CONSOLE.MONITORING_VIEW,
                PermissionRegistry.SYSTEM_CONSOLE.FEATURE_FLAGS_VIEW,
                PermissionRegistry.SYSTEM_CONSOLE.FEATURE_FLAGS_MANAGE,
                PermissionRegistry.SYSTEM_CONSOLE.TOOLS_VIEW,
                PermissionRegistry.SYSTEM_CONSOLE.TOOLS_EXECUTE,
            ],
        },
    },
    TENANT: {
        OWNER: {
            name: 'Tenant Owner',
            description: 'Full access to tenant resources',
            permissions: [
                // ALL Tenant-scoped permissions (exclude System Console)
                ...Object.values(PermissionRegistry.DASHBOARD),
                ...Object.values(PermissionRegistry.BRANCHES),
                ...Object.values(PermissionRegistry.USERS),
                ...Object.values(PermissionRegistry.BILLING),
                ...Object.values(PermissionRegistry.APPROVALS),
                ...Object.values(PermissionRegistry.FILE_MANAGER),
                ...Object.values(PermissionRegistry.SETTINGS),
                ...Object.values(PermissionRegistry.SYSTEM_GUIDE),
            ],
        },
        ADMIN: {
            name: 'Tenant Admin',
            description: 'Operational management excluding sensitive billing/security',
            permissions: [
                PermissionRegistry.DASHBOARD.VIEW,
                ...Object.values(PermissionRegistry.BRANCHES),
                ...Object.values(PermissionRegistry.USERS),
                // Limited Billing
                PermissionRegistry.BILLING.INVOICES_VIEW,
                PermissionRegistry.BILLING.SUBSCRIPTIONS_VIEW,
                PermissionRegistry.BILLING.PLANS_VIEW,
                // Full Settings except Security Policy
                ...Object.values(PermissionRegistry.SETTINGS).filter(p => !p.startsWith('settings.security.')),
                PermissionRegistry.SETTINGS.USER_RIGHTS_VIEW, // View only
            ],
        },
        MANAGER: {
            name: 'Tenant Manager',
            description: 'Day-to-day operations (Branches, Users)',
            permissions: [
                PermissionRegistry.DASHBOARD.VIEW,
                PermissionRegistry.BRANCHES.VIEW,
                PermissionRegistry.BRANCHES.UPDATE,
                PermissionRegistry.USERS.USERS_VIEW,
                PermissionRegistry.USERS.USERS_CREATE,
                PermissionRegistry.USERS.USERS_UPDATE,
                PermissionRegistry.APPROVALS.VIEW,
                PermissionRegistry.APPROVALS.APPROVE,
            ],
        },
        FINANCE: {
            name: 'Tenant Finance',
            description: 'Billing, Invoices, and Subscription management',
            permissions: [
                PermissionRegistry.DASHBOARD.VIEW,
                ...Object.values(PermissionRegistry.BILLING),
                PermissionRegistry.SETTINGS.BILLING_CONFIG_VIEW,
                PermissionRegistry.SETTINGS.BILLING_CONFIG_MANAGE,
            ],
        },
        HR: {
            name: 'Tenant HR',
            description: 'User management and company profile',
            permissions: [
                PermissionRegistry.DASHBOARD.VIEW,
                ...Object.values(PermissionRegistry.USERS),
                PermissionRegistry.SETTINGS.COMPANY_PROFILE_VIEW,
                PermissionRegistry.SETTINGS.COMPANY_PROFILE_UPDATE,
            ],
        },
        VIEWER: {
            name: 'Tenant Viewer',
            description: 'Read-only access to basic resources',
            permissions: [
                PermissionRegistry.DASHBOARD.VIEW,
                PermissionRegistry.BRANCHES.VIEW,
                PermissionRegistry.USERS.USERS_VIEW,
                PermissionRegistry.SYSTEM_GUIDE.VIEW,
            ],
        },
    },
};
