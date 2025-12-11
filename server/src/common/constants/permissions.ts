export const PERMISSIONS = {
    // =============================================================================================
    // 🌍 SYSTEM ADMIN PANEL (Platform Owner)
    // =============================================================================================
    SYSTEM: {
        CONFIG: {
            GENERAL: {
                READ: { slug: 'system:config:general:read', description: 'View platform branding/meta info' },
                UPDATE: { slug: 'system:config:general:update', description: 'Update platform name, logo, favicon' },
            },
            SMTP: {
                MANAGE: { slug: 'system:config:smtp:manage', description: 'Configure default SMTP servers' },
            },
            SMS: {
                MANAGE: { slug: 'system:config:sms:manage', description: 'Configure SMS gateways' },
            },
        },
        SECURITY: {
            AUDIT: {
                VIEW: { slug: 'system:security:audit:view', description: 'View immutable system audit logs' },
            }
        },
        TENANTS: {
            CREATE: { slug: 'system:tenants:create', description: 'Provision new tenant' },
            READ: { slug: 'system:tenants:read', description: 'Search/Filter tenants' },
            SUSPEND: { slug: 'system:tenants:suspend', description: 'Suspend tenant access' },
            DELETE: { slug: 'system:tenants:delete', description: 'Permanent deletion' },
            DOMAINS: {
                MANAGE: { slug: 'system:tenants:domains:manage', description: 'Map custom domains' },
            },
        },
    },

    // =============================================================================================
    // 🏢 TENANT PANEL (Business Operations)
    // =============================================================================================
    TENANT: {
        DASHBOARD: {
            VIEW: { slug: 'dashboard:view', description: 'Access main dashboard' },
        },
        USERS: {
            VIEW: { slug: 'users:read', description: 'View users list' },
            CREATE: { slug: 'users:create', description: 'Create new user' },
            UPDATE: { slug: 'users:update', description: 'Edit user details' },
            DELETE: { slug: 'users:delete', description: 'Delete user' },
            MANAGE_ROLES: { slug: 'users:roles:assign', description: 'Assign roles to users' },
        },
        ROLES: {
            VIEW: { slug: 'roles:read', description: 'View roles' },
            CREATE: { slug: 'roles:create', description: 'Create new role' },
            UPDATE: { slug: 'roles:update', description: 'Edit role permissions' },
            DELETE: { slug: 'roles:delete', description: 'Delete role' },
        },
        BRANCHES: {
            VIEW: { slug: 'branches:read', description: 'View branches' },
            MANAGE: { slug: 'branches:manage', description: 'Create/Edit branches' },
        },
        FILES: {
            UPLOAD: { slug: 'files:upload', description: 'Upload files' },
        }
    }
};

export const SCOPES = ['SYSTEM', 'TENANT', 'BRANCH', 'CURATOR'] as const;
