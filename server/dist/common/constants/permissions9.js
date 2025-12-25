"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCOPES = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = {
    SYSTEM: {
        DASHBOARD: {
            VIEW: { slug: 'system:dashboard:view', description: 'Access system dashboard', scope: 'SYSTEM' },
        },
        TENANTS: {
            CREATE: { slug: 'system:tenants:create', description: 'Provision new tenant', scope: 'SYSTEM' },
            READ: { slug: 'system:tenants:read', description: 'Search/Filter tenants', scope: 'SYSTEM' },
            SUSPEND: { slug: 'system:tenants:suspend', description: 'Suspend tenant access', scope: 'SYSTEM' },
            DELETE: { slug: 'system:tenants:delete', description: 'Permanent deletion', scope: 'SYSTEM' },
            DOMAINS: {
                MANAGE: { slug: 'system:tenants:domains:manage', description: 'Map custom domains', scope: 'SYSTEM' },
            },
        },
        APPROVALS: {
            VIEW: { slug: 'system:approvals:view', description: 'View system approvals', scope: 'SYSTEM' },
        },
        BILLING: {
            VIEW: { slug: 'system:billing:read', description: 'Access billing system', scope: 'SYSTEM' },
            PACKAGES: {
                VIEW: { slug: 'system:packages:read', description: 'View service packages', scope: 'SYSTEM' },
                CREATE: { slug: 'system:packages:create', description: 'Create packages', scope: 'SYSTEM' },
                UPDATE: { slug: 'system:packages:update', description: 'Update packages', scope: 'SYSTEM' },
                DELETE: { slug: 'system:packages:delete', description: 'Delete packages', scope: 'SYSTEM' },
                MANAGE: { slug: 'system:packages:manage', description: 'Manage package details', scope: 'SYSTEM' },
            },
            SUBSCRIPTIONS: {
                VIEW: { slug: 'system:subscriptions:read', description: 'View active subscriptions', scope: 'SYSTEM' },
                MANAGE: { slug: 'system:subscriptions:manage', description: 'Manage billing cycles', scope: 'SYSTEM' },
            }
        },
        USERS: {
            VIEW: { slug: 'system:users:read', description: 'View system admins', scope: 'SYSTEM' },
            CREATE: { slug: 'system:users:create', description: 'Create system users', scope: 'SYSTEM' },
            UPDATE: { slug: 'system:users:update', description: 'Update system users', scope: 'SYSTEM' },
            DELETE: { slug: 'system:users:delete', description: 'Delete system users', scope: 'SYSTEM' },
            IMPERSONATE: { slug: 'system:users:impersonate', description: 'Impersonate other users', scope: 'SYSTEM' },
            MANAGE_ROLES: { slug: 'system:users:roles:assign', description: 'Assign roles to system admins', scope: 'SYSTEM' },
        },
        CONFIG: {
            ROLES: {
                VIEW: { slug: 'system:roles:read', description: 'View system roles', scope: 'SYSTEM' },
                MANAGE: { slug: 'system:roles:manage', description: 'Manage system roles', scope: 'SYSTEM' },
            },
            PERMISSIONS: {},
            DICTIONARIES: {
                CURRENCIES: { slug: 'system:dict:currencies:manage', description: 'Manage global currencies', scope: 'SYSTEM' },
                ADDRESSES: { slug: 'system:dict:addresses:manage', description: 'Manage countries/cities', scope: 'SYSTEM' },
                TIMEZONES: { slug: 'system:dict:timezones:manage', description: 'Manage timezones', scope: 'SYSTEM' },
                DOC_TEMPLATES: {
                    READ: { slug: 'system:dict:doc_templates:read', description: 'View document templates', scope: 'SYSTEM' },
                    MANAGE: { slug: 'system:dict:doc_templates:manage', description: 'Create/Edit document templates', scope: 'SYSTEM' },
                },
                APPROVAL_TEMPLATES: {
                    READ: { slug: 'system:dict:approval_templates:read', description: 'View approval workflows', scope: 'SYSTEM' },
                    MANAGE: { slug: 'system:dict:approval_templates:manage', description: 'Create/Edit approval workflows', scope: 'SYSTEM' },
                },
            },
            SECURITY: {
                AUDIT: { slug: 'system:security:audit:view', description: 'View global audit logs', scope: 'SYSTEM' },
                LIMITS: { slug: 'system:security:limits:manage', description: 'Manage system-wide limits', scope: 'SYSTEM' },
                POLICIES: { slug: 'system:security:policies:manage', description: 'Password & Session policies', scope: 'SYSTEM' },
                WAF: { slug: 'system:security:waf:view', description: 'View Firewall/WAF logs', scope: 'SYSTEM' },
            },
            MONITORING: {
                VIEW: { slug: 'system:monitoring:view', description: 'View system health & metrics', scope: 'SYSTEM' },
                LOGS: { slug: 'system:monitoring:logs:view', description: 'View server logs', scope: 'SYSTEM' },
            },
            BACKUPS: {
                VIEW: { slug: 'system:backups:view', description: 'View backup history', scope: 'SYSTEM' },
                CREATE: { slug: 'system:backups:create', description: 'Trigger manual backup', scope: 'SYSTEM' },
                RESTORE: { slug: 'system:backups:restore', description: 'Restore from backup', scope: 'SYSTEM' },
            },
            NOTIFICATIONS: {
                CHANNELS: { slug: 'system:notifications:channels:manage', description: 'Configure SMS/Email Gateways', scope: 'SYSTEM' },
                TEMPLATES: { slug: 'system:notifications:templates:manage', description: 'Edit notification templates', scope: 'SYSTEM' },
                BROADCAST: { slug: 'system:notifications:broadcast', description: 'Send global announcements', scope: 'SYSTEM' },
            },
            INTEGRATIONS: {
                PAYMENT: { slug: 'system:integrations:payment:manage', description: 'Manage Stripe/PayPal', scope: 'SYSTEM' },
                STORAGE: { slug: 'system:integrations:storage:manage', description: 'Manage S3/MinIO', scope: 'SYSTEM' },
            },
            APPROVALS: {
                VIEW: { slug: 'admin:approvals:read', description: 'View admin approvals', scope: 'SYSTEM' },
            }
        }
    },
    TENANT: {
        DASHBOARD: {
            VIEW: { slug: 'dashboard:view', description: 'Access main dashboard', scope: 'TENANT' },
        },
        USERS: {
            VIEW: { slug: 'users:read', description: 'View users list', scope: 'TENANT' },
            CREATE: { slug: 'users:create', description: 'Create new user', scope: 'TENANT' },
            UPDATE: { slug: 'users:update', description: 'Edit user details', scope: 'TENANT' },
            DELETE: { slug: 'users:delete', description: 'Delete user', scope: 'TENANT' },
            MANAGE_ROLES: { slug: 'users:roles:assign', description: 'Assign roles to users', scope: 'TENANT' },
        },
        CONFIG: {
            ROLES: {
                VIEW: { slug: 'config:roles:read', description: 'View roles', scope: 'TENANT' },
                CREATE: { slug: 'config:roles:create', description: 'Create new role', scope: 'TENANT' },
                UPDATE: { slug: 'config:roles:update', description: 'Edit role permissions', scope: 'TENANT' },
                DELETE: { slug: 'config:roles:delete', description: 'Delete role', scope: 'TENANT' },
            },
            DICTIONARIES: {
                CURRENCIES: { slug: 'config:dict:currencies:read', description: 'View available currencies', scope: 'TENANT' },
                DOC_TEMPLATES: {
                    READ: { slug: 'config:dict:doc_templates:read', description: 'View available templates', scope: 'TENANT' },
                    MANAGE: { slug: 'config:dict:doc_templates:manage', description: 'Customize templates', scope: 'TENANT' },
                },
                APPROVAL_TEMPLATES: {
                    READ: { slug: 'config:dict:approval_templates:read', description: 'View approval flows', scope: 'TENANT' },
                    MANAGE: { slug: 'config:dict:approval_templates:manage', description: 'Create custom approval flows', scope: 'TENANT' },
                },
            }
        }
    }
};
exports.SCOPES = ['SYSTEM', 'TENANT', 'BRANCH', 'CURATOR'];
//# sourceMappingURL=permissions9.js.map