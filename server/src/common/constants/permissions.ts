export const PERMISSIONS = {
    // Tenant Management (Global Admin only)
    TENANTS: {
        VIEW: 'tenants:read',
        CREATE: 'tenants:create',
        UPDATE: 'tenants:update',
        DELETE: 'tenants:delete',
        SUSPEND: 'tenants:suspend', // Suspend a tenant explicitly
        MANAGE_SUBSCRIPTION: 'tenants:billing', // Manage billing/plans
    },
    
    // User Management
    USERS: {
        VIEW: 'users:read',
        CREATE: 'users:create',
        UPDATE: 'users:update',
        DELETE: 'users:delete',
        RESET_PASSWORD: 'users:password:reset',
        MANAGE_ROLES: 'users:roles:assign',
    },

    // Role Management
    ROLES: {
        VIEW: 'roles:read',
        CREATE: 'roles:create',
        UPDATE: 'roles:update',
        DELETE: 'roles:delete',
    },

    // System Settings
    SYSTEM: {
        VIEW_LOGS: 'system:logs:view',
        MANAGE_SETTINGS: 'system:settings:manage', // General settings
        MANAGE_INTEGRATIONS: 'system:integrations:manage', // SMS/SMTP
    },

    // Dashboard
    DASHBOARD: {
        VIEW_GLOBAL: 'dashboard:global:view', // Owner view
        VIEW_TENANT: 'dashboard:tenant:view', // Standard tenant view
    }
};

export const SCOPES = ['SYSTEM', 'TENANT', 'BRANCH', 'CURATOR'] as const;
