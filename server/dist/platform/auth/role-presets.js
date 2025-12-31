"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePresets = void 0;
const permissions_1 = require("./permissions");
exports.RolePresets = {
    SYSTEM: {
        SUPER_ADMIN: {
            name: 'System Super Admin',
            description: 'Full system access with impersonation capabilities',
            permissions: Object.values(permissions_1.PermissionRegistry).flatMap(group => Object.values(group)),
        },
        SUPPORT: {
            name: 'System Support',
            description: 'Read-only access to system consoles and tenant debug capabilities',
            permissions: [
                permissions_1.PermissionRegistry.DASHBOARD.VIEW,
                permissions_1.PermissionRegistry.TENANTS.VIEW,
                permissions_1.PermissionRegistry.BRANCHES.VIEW,
                permissions_1.PermissionRegistry.USERS.USERS_VIEW,
                permissions_1.PermissionRegistry.USERS.CURATORS_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.DASHBOARD_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.MONITORING_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.AUDIT_COMPLIANCE_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.FEEDBACK_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.USERS_IMPERSONATE,
            ],
        },
        AUDITOR: {
            name: 'System Auditor',
            description: 'Strictly for compliance & audit log review',
            permissions: [
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.AUDIT_COMPLIANCE_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.DATA_RETENTION_VIEW,
                permissions_1.PermissionRegistry.SETTINGS.USER_RIGHTS_VIEW,
            ],
        },
        DEVELOPER: {
            name: 'System Developer',
            description: 'Access to Developer Hub and Technical Monitoring',
            permissions: [
                ...Object.values(permissions_1.PermissionRegistry.DEVELOPER_HUB),
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.MONITORING_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.FEATURE_FLAGS_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.FEATURE_FLAGS_MANAGE,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.TOOLS_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_CONSOLE.TOOLS_EXECUTE,
            ],
        },
    },
    TENANT: {
        OWNER: {
            name: 'Tenant Owner',
            description: 'Full access to tenant resources',
            permissions: [
                ...Object.values(permissions_1.PermissionRegistry.DASHBOARD),
                ...Object.values(permissions_1.PermissionRegistry.BRANCHES),
                ...Object.values(permissions_1.PermissionRegistry.USERS),
                ...Object.values(permissions_1.PermissionRegistry.BILLING),
                ...Object.values(permissions_1.PermissionRegistry.APPROVALS),
                ...Object.values(permissions_1.PermissionRegistry.FILE_MANAGER),
                ...Object.values(permissions_1.PermissionRegistry.SETTINGS),
                ...Object.values(permissions_1.PermissionRegistry.SYSTEM_GUIDE),
            ],
        },
        ADMIN: {
            name: 'Tenant Admin',
            description: 'Operational management excluding sensitive billing/security',
            permissions: [
                permissions_1.PermissionRegistry.DASHBOARD.VIEW,
                ...Object.values(permissions_1.PermissionRegistry.BRANCHES),
                ...Object.values(permissions_1.PermissionRegistry.USERS),
                permissions_1.PermissionRegistry.BILLING.INVOICES_VIEW,
                permissions_1.PermissionRegistry.BILLING.SUBSCRIPTIONS_VIEW,
                permissions_1.PermissionRegistry.BILLING.PLANS_VIEW,
                ...Object.values(permissions_1.PermissionRegistry.SETTINGS).filter(p => !p.startsWith('settings.security.')),
                permissions_1.PermissionRegistry.SETTINGS.USER_RIGHTS_VIEW,
            ],
        },
        MANAGER: {
            name: 'Tenant Manager',
            description: 'Day-to-day operations (Branches, Users)',
            permissions: [
                permissions_1.PermissionRegistry.DASHBOARD.VIEW,
                permissions_1.PermissionRegistry.BRANCHES.VIEW,
                permissions_1.PermissionRegistry.BRANCHES.UPDATE,
                permissions_1.PermissionRegistry.USERS.USERS_VIEW,
                permissions_1.PermissionRegistry.USERS.USERS_CREATE,
                permissions_1.PermissionRegistry.USERS.USERS_UPDATE,
                permissions_1.PermissionRegistry.APPROVALS.VIEW,
                permissions_1.PermissionRegistry.APPROVALS.APPROVE,
            ],
        },
        FINANCE: {
            name: 'Tenant Finance',
            description: 'Billing, Invoices, and Subscription management',
            permissions: [
                permissions_1.PermissionRegistry.DASHBOARD.VIEW,
                ...Object.values(permissions_1.PermissionRegistry.BILLING),
                permissions_1.PermissionRegistry.SETTINGS.BILLING_CONFIG_VIEW,
                permissions_1.PermissionRegistry.SETTINGS.BILLING_CONFIG_MANAGE,
            ],
        },
        HR: {
            name: 'Tenant HR',
            description: 'User management and company profile',
            permissions: [
                permissions_1.PermissionRegistry.DASHBOARD.VIEW,
                ...Object.values(permissions_1.PermissionRegistry.USERS),
                permissions_1.PermissionRegistry.SETTINGS.COMPANY_PROFILE_VIEW,
                permissions_1.PermissionRegistry.SETTINGS.COMPANY_PROFILE_UPDATE,
            ],
        },
        VIEWER: {
            name: 'Tenant Viewer',
            description: 'Read-only access to basic resources',
            permissions: [
                permissions_1.PermissionRegistry.DASHBOARD.VIEW,
                permissions_1.PermissionRegistry.BRANCHES.VIEW,
                permissions_1.PermissionRegistry.USERS.USERS_VIEW,
                permissions_1.PermissionRegistry.SYSTEM_GUIDE.VIEW,
            ],
        },
    },
};
//# sourceMappingURL=role-presets.js.map