export const PermissionSlugs = {
    // PLATFORM SCOPE
    PLATFORM: {
        DASHBOARD: {
            VIEW: 'platform.dashboard.view',
        },
        TENANTS: {
            READ: 'platform.tenants.read',
            CREATE: 'platform.tenants.create',
            UPDATE: 'platform.tenants.update',
            DELETE: 'platform.tenants.delete',
        },
        BRANCHES: {
            READ: 'platform.branches.read',
            CREATE: 'platform.branches.create',
            UPDATE: 'platform.branches.update',
            DELETE: 'platform.branches.delete',
        },
        USERS: {
            READ: 'platform.users.users.read',
            CREATE: 'platform.users.users.create',
            UPDATE: 'platform.users.users.update',
            DELETE: 'platform.users.users.delete',
        },
        CURATORS: {
            READ: 'platform.users.curators.read',
            CREATE: 'platform.users.curators.create',
            UPDATE: 'platform.users.curators.update',
            DELETE: 'platform.users.curators.delete',
        },
        BILLING: {
            READ: 'platform.billing.read', // General access to billing module
            MARKETPLACE: {
                READ: 'platform.billing.marketplace.read',
                MANAGE: 'platform.billing.marketplace.manage',
            },
            PACKAGES: {
                READ: 'platform.billing.packages.read',
                MANAGE: 'platform.billing.packages.manage',
            },
            PLANS: {
                READ: 'platform.billing.plans.read',
                MANAGE: 'platform.billing.plans.manage',
            },
            INVOICES: {
                READ: 'platform.billing.invoices.read',
                APPROVE: 'platform.billing.invoices.approve',
            },
            LICENSES: {
                READ: 'platform.billing.licenses.read',
                MANAGE: 'platform.billing.licenses.manage',
            },
        },
        APPROVALS: {
            VIEW: 'platform.approvals.view',
            APPROVE: 'platform.approvals.approve',
        },
        FILES: {
            READ: 'platform.files.read',
            UPLOAD: 'platform.files.upload',
            DELETE: 'platform.files.delete',
        },
        GUIDE: {
            READ: 'platform.guide.read',
            MANAGE: 'platform.guide.manage',
        },
        SETTINGS: {
            READ: 'platform.settings.read',
            GENERAL: {
                READ: 'platform.settings.general.read',
                UPDATE: 'platform.settings.general.update',
            },
            COMMUNICATION: {
                READ: 'platform.settings.communication.read',
                MANAGE: 'platform.settings.communication.manage',
            },
            SECURITY: {
                READ: 'platform.settings.security.read',
                MANAGE: 'platform.settings.security.manage',
                USER_RIGHTS: {
                     COMPLIANCE: {
                        READ: 'platform.settings.security.user_rights.compliance.read',
                        DOWNLOAD_SOC2: 'platform.settings.security.user_rights.compliance.download_soc2',
                        DOWNLOAD_ISO: 'platform.settings.security.user_rights.compliance.download_iso',
                     }
                }
            },
            CONFIG: {
                READ: 'platform.settings.config.read',
                MANAGE: 'platform.settings.config.manage',
            },
        },
        CONSOLE: {
            READ: 'platform.console.read',
            DASHBOARD: {
                READ: 'platform.console.dashboard.read',
            },
            AUDIT: {
                READ: 'platform.console.audit.read',
                MANAGE: 'platform.console.audit.manage',
            },
            SCHEDULER: {
                READ: 'platform.console.scheduler.read',
                EXECUTE: 'platform.console.scheduler.execute',
            },
            RETENTION: {
                READ: 'platform.console.retention.read',
                MANAGE: 'platform.console.retention.manage',
            },
            FEATURES: {
                READ: 'platform.console.features.read',
                MANAGE: 'platform.console.features.manage',
            },
            TOOLS: {
                READ: 'platform.console.tools.read',
                EXECUTE: 'platform.console.tools.execute',
            },
        },
        DEVELOPER: {
            READ: 'platform.dev.read',
            API: {
                READ: 'platform.dev.api.read',
            },
            SDK: {
                READ: 'platform.dev.sdk.read',
            },
            WEBHOOKS: {
                READ: 'platform.dev.webhooks.read',
                MANAGE: 'platform.dev.webhooks.manage',
            }
        },

    // TENANT SCOPE
    TENANT: {
        DASHBOARD: {
            VIEW: 'tenant.dashboard.view',
        },
        USERS: {
            READ: 'tenant.users.read',
            MANAGE: 'tenant.users.manage',
        },
        SETTINGS: {
            READ: 'tenant.settings.read',
            MANAGE: 'tenant.settings.manage',
        }
    }
} as const ;

// Helper to check if a permission string matches a canonical slug pattern
export const isCanonical = (slug: string) => /^(platform|tenant)\./.test(slug);

// MAPPING: Legacy Backend Slug -> Canonical Frontend Slug
// This is critical until backend is fully migrated to use 'platform.' and 'tenant.' prefixes.
export const LEGACY_TO_CANONICAL_MAP: Record<string, string> = {
    // Dashboard
    'dashboard.view': PermissionSlugs.PLATFORM.DASHBOARD.VIEW,

    // Tenants
    'tenants.view': PermissionSlugs.PLATFORM.TENANTS.READ,
    'tenants.create': PermissionSlugs.PLATFORM.TENANTS.CREATE,
    'tenants.update': PermissionSlugs.PLATFORM.TENANTS.UPDATE,
    'tenants.delete': PermissionSlugs.PLATFORM.TENANTS.DELETE,

    // Branches
    'branches.view': PermissionSlugs.PLATFORM.BRANCHES.READ,
    'branches.create': PermissionSlugs.PLATFORM.BRANCHES.CREATE,
    'branches.update': PermissionSlugs.PLATFORM.BRANCHES.UPDATE,
    'branches.delete': PermissionSlugs.PLATFORM.BRANCHES.DELETE,

    // Users
    'users.users.view': PermissionSlugs.PLATFORM.USERS.READ,
    'users.users.create': PermissionSlugs.PLATFORM.USERS.CREATE,
    'users.users.update': PermissionSlugs.PLATFORM.USERS.UPDATE,
    'users.users.delete': PermissionSlugs.PLATFORM.USERS.DELETE,

    'users.curators.view': PermissionSlugs.PLATFORM.CURATORS.READ,
    'users.curators.create': PermissionSlugs.PLATFORM.CURATORS.CREATE,
    'users.curators.update': PermissionSlugs.PLATFORM.CURATORS.UPDATE,
    'users.curators.delete': PermissionSlugs.PLATFORM.CURATORS.DELETE,

    // Billing
    'billing.market_place.view': PermissionSlugs.PLATFORM.BILLING.MARKETPLACE.READ,
    'billing.market_place.manage': PermissionSlugs.PLATFORM.BILLING.MARKETPLACE.MANAGE,

    'billing.compact_packages.view': PermissionSlugs.PLATFORM.BILLING.PACKAGES.READ,
    'billing.compact_packages.manage': PermissionSlugs.PLATFORM.BILLING.PACKAGES.MANAGE,

    'billing.subscriptions.view': PermissionSlugs.PLATFORM.BILLING.PLANS.READ,
    'billing.subscriptions.create': PermissionSlugs.PLATFORM.BILLING.PLANS.MANAGE,
    'billing.subscriptions.update': PermissionSlugs.PLATFORM.BILLING.PLANS.MANAGE,
    'billing.subscriptions.delete': PermissionSlugs.PLATFORM.BILLING.PLANS.MANAGE,
    'billing.plans.view': PermissionSlugs.PLATFORM.BILLING.PLANS.READ,
    'billing.plans.manage': PermissionSlugs.PLATFORM.BILLING.PLANS.MANAGE,

    'billing.invoices.view': PermissionSlugs.PLATFORM.BILLING.INVOICES.READ,
    'billing.invoices.approve': PermissionSlugs.PLATFORM.BILLING.INVOICES.APPROVE,

    'billing.licenses.view': PermissionSlugs.PLATFORM.BILLING.LICENSES.READ,
    'billing.licenses.manage': PermissionSlugs.PLATFORM.BILLING.LICENSES.MANAGE,

    // Approvals
    'approvals.view': PermissionSlugs.PLATFORM.APPROVALS.VIEW,
    'approvals.approve': PermissionSlugs.PLATFORM.APPROVALS.APPROVE,

    // Files
    'file_manager.view': PermissionSlugs.PLATFORM.FILES.READ,
    'file_manager.upload': PermissionSlugs.PLATFORM.FILES.UPLOAD,
    'file_manager.delete': PermissionSlugs.PLATFORM.FILES.DELETE,

    // Guide
    'system_guide.view': PermissionSlugs.PLATFORM.GUIDE.READ,
    'system_guide.manage': PermissionSlugs.PLATFORM.GUIDE.MANAGE,

    // Settings
    'settings.general.company_profile.view': PermissionSlugs.PLATFORM.SETTINGS.GENERAL.READ,
    'settings.general.company_profile.update': PermissionSlugs.PLATFORM.SETTINGS.GENERAL.UPDATE,
    'settings.general.notification_engine.view': PermissionSlugs.PLATFORM.SETTINGS.GENERAL.READ,
    'settings.general.notification_engine.manage': PermissionSlugs.PLATFORM.SETTINGS.GENERAL.UPDATE,

    'settings.communication.smtp_email.view': PermissionSlugs.PLATFORM.SETTINGS.COMMUNICATION.READ,
    'settings.communication.smtp_email.manage': PermissionSlugs.PLATFORM.SETTINGS.COMMUNICATION.MANAGE,
    'settings.communication.smtp_sms.view': PermissionSlugs.PLATFORM.SETTINGS.COMMUNICATION.READ,
    'settings.communication.smtp_sms.manage': PermissionSlugs.PLATFORM.SETTINGS.COMMUNICATION.MANAGE,

    'settings.security.security_policy.view': PermissionSlugs.PLATFORM.SETTINGS.SECURITY.READ,
    'settings.security.security_policy.manage': PermissionSlugs.PLATFORM.SETTINGS.SECURITY.MANAGE,
    'settings.security.sso_oauth.view': PermissionSlugs.PLATFORM.SETTINGS.SECURITY.READ,
    'settings.security.sso_oauth.manage': PermissionSlugs.PLATFORM.SETTINGS.SECURITY.MANAGE,
    'settings.security.user_rights.view': PermissionSlugs.PLATFORM.SETTINGS.SECURITY.READ,
    'settings.security.user_rights.manage': PermissionSlugs.PLATFORM.SETTINGS.SECURITY.MANAGE,

    'settings.system_configurations.billing_configurations.view': PermissionSlugs.PLATFORM.SETTINGS.CONFIG.READ,
    'settings.system_configurations.billing_configurations.manage': PermissionSlugs.PLATFORM.SETTINGS.CONFIG.MANAGE,
    'settings.system_configurations.dictionary.view': PermissionSlugs.PLATFORM.SETTINGS.CONFIG.READ,
    'settings.system_configurations.dictionary.manage': PermissionSlugs.PLATFORM.SETTINGS.CONFIG.MANAGE,
    'settings.system_configurations.document_templates.view': PermissionSlugs.PLATFORM.SETTINGS.CONFIG.READ,
    'settings.system_configurations.document_templates.manage': PermissionSlugs.PLATFORM.SETTINGS.CONFIG.MANAGE,
    'settings.system_configurations.workflow.view': PermissionSlugs.PLATFORM.SETTINGS.CONFIG.READ,
    'settings.system_configurations.workflow.manage': PermissionSlugs.PLATFORM.SETTINGS.CONFIG.MANAGE,

    // Console
    'system_console.dashboard.view': PermissionSlugs.PLATFORM.CONSOLE.DASHBOARD.READ,
    'system_console.monitoring.view': PermissionSlugs.PLATFORM.CONSOLE.DASHBOARD.READ,
    'system_console.audit_compliance.view': PermissionSlugs.PLATFORM.CONSOLE.AUDIT.READ,
    'system_console.job_scheduler.view': PermissionSlugs.PLATFORM.CONSOLE.SCHEDULER.READ,
    'system_console.job_scheduler.execute': PermissionSlugs.PLATFORM.CONSOLE.SCHEDULER.EXECUTE,
    'system_console.data_retention.view': PermissionSlugs.PLATFORM.CONSOLE.RETENTION.READ,
    'system_console.data_retention.manage': PermissionSlugs.PLATFORM.CONSOLE.RETENTION.MANAGE,
    'system_console.feature_flags.view': PermissionSlugs.PLATFORM.CONSOLE.FEATURES.READ,
    'system_console.feature_flags.manage': PermissionSlugs.PLATFORM.CONSOLE.FEATURES.MANAGE,
    'system_console.policy_security.view': PermissionSlugs.PLATFORM.CONSOLE.AUDIT.READ,
    'system_console.policy_security.manage': PermissionSlugs.PLATFORM.CONSOLE.AUDIT.MANAGE,
    'system_console.tools.view': PermissionSlugs.PLATFORM.CONSOLE.TOOLS.READ,
    'system_console.tools.execute': PermissionSlugs.PLATFORM.CONSOLE.TOOLS.EXECUTE,

    // Developer
    'developer_hub.api_reference.view': PermissionSlugs.PLATFORM.DEVELOPER.API.READ,
    'developer_hub.sdk.view': PermissionSlugs.PLATFORM.DEVELOPER.SDK.READ,
    'developer_hub.webhooks.view': PermissionSlugs.PLATFORM.DEVELOPER.WEBHOOKS.READ,
    'developer_hub.webhooks.manage': PermissionSlugs.PLATFORM.DEVELOPER.WEBHOOKS.MANAGE,
    'developer_hub.permission_map.view': PermissionSlugs.PLATFORM.DEVELOPER.READ,
};
