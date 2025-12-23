
// --- SYSTEM (Admin Panel) ---
const SYSTEM_SLUGS = {
    DASHBOARD: {
        VIEW: 'system.dashboard.view',
        READ: 'system.dashboard.read',
    },
    TENANTS: {
        VIEW: 'system.tenants.view',
        READ: 'system.tenants.read',
        CREATE: 'system.tenants.create',
        UPDATE: 'system.tenants.update',
        DELETE: 'system.tenants.delete',
        IMPERSONATE: 'system.tenants.impersonate',
        MANAGE: 'system.tenants.manage_subscription',
    },
    BRANCHES: {
        VIEW: 'system.branches.view',
        READ: 'system.branches.read',
        CREATE: 'system.branches.create',
        UPDATE: 'system.branches.update',
        DELETE: 'system.branches.delete',
    },
    USERS: {
        VIEW: 'system.users.users.view',
        READ: 'system.users.users.read',
        CREATE: 'system.users.users.create',
        UPDATE: 'system.users.users.update',
        DELETE: 'system.users.users.delete',
        INVITE: 'system.users.users.invite',
        CONNECT_TO_EMPLOYEE: 'system.users.users.connect_to_employee',
    },
    CURATORS: {
        VIEW: 'system.users.curators.view',
        READ: 'system.users.curators.read',
        CREATE: 'system.users.curators.create',
        UPDATE: 'system.users.curators.update',
        DELETE: 'system.users.curators.delete',
    },
    ROLES: {
        VIEW: 'system.settings.security.user_rights.role.view',
        READ: 'system.settings.security.user_rights.role.read',
        CREATE: 'system.settings.security.user_rights.role.create',
        UPDATE: 'system.settings.security.user_rights.role.update',
        DELETE: 'system.settings.security.user_rights.role.delete',
    },
    AUDIT: {
        VIEW: 'system.audit_logs.view',
        READ: 'system.audit_logs.read',
        EXPORT: 'system.audit_logs.export',
    },
    SETTINGS: {
        VIEW: 'system.settings.view',
        READ: 'system.settings.read',
        UPDATE: 'system.settings.update',
        GENERAL: {
            VIEW: 'system.settings.general.view',
            READ: 'system.settings.general.read',
            UPDATE: 'system.settings.general.update',
        },
        NOTIFICATIONS: {
            VIEW: 'system.settings.general.notification_engine.view',
            READ: 'system.settings.general.notification_engine.read',
        },
        COMMUNICATION: {
            VIEW: 'system.settings.communication.view',
            READ: 'system.settings.communication.read',
            MANAGE: 'system.settings.communication.update',
        },
        SECURITY: {
            VIEW: 'system.settings.security.view',
            READ: 'system.settings.security.read',
            MANAGE: 'system.settings.security.update',
        },
        CONFIG: {
            VIEW: 'system.settings.system_configurations.view',
            READ: 'system.settings.system_configurations.read',
            MANAGE: 'system.settings.system_configurations.update',
            BILLING: {
                VIEW: 'system.settings.system_configurations.billing_configurations.price_rules.view',
            },
            DICTIONARIES: {
                VIEW: 'system.settings.system_configurations.dictionary.view',
                READ: 'system.settings.system_configurations.dictionary.read',
                SECTORS: {
                    VIEW: 'system.settings.system_configurations.dictionary.sectors.view',
                    READ: 'system.settings.system_configurations.dictionary.sectors.read'
                },
                UNITS: {
                    VIEW: 'system.settings.system_configurations.dictionary.units.view',
                    READ: 'system.settings.system_configurations.dictionary.units.read'
                },
                CURRENCIES: {
                    VIEW: 'system.settings.system_configurations.dictionary.currencies.view',
                    READ: 'system.settings.system_configurations.dictionary.currencies.read'
                },
                TIME_ZONES: {
                    VIEW: 'system.settings.system_configurations.dictionary.time_zones.view',
                    READ: 'system.settings.system_configurations.dictionary.time_zones.read'
                },
                ADDRESSES: {
                    VIEW: 'system.settings.system_configurations.dictionary.addresses.view',
                    READ: 'system.settings.system_configurations.dictionary.addresses.read',
                    COUNTRY: {
                        VIEW: 'system.settings.system_configurations.dictionary.addresses.country.view',
                        READ: 'system.settings.system_configurations.dictionary.addresses.country.read'
                    },
                    CITY: {
                        VIEW: 'system.settings.system_configurations.dictionary.addresses.city.view',
                        READ: 'system.settings.system_configurations.dictionary.addresses.city.read'
                    },
                    DISTRICT: {
                        VIEW: 'system.settings.system_configurations.dictionary.addresses.district.view',
                        READ: 'system.settings.system_configurations.dictionary.addresses.district.read'
                    }
                }
            },
            TEMPLATES: {
                VIEW: 'system.settings.system_configurations.document_templates.view',
                READ: 'system.settings.system_configurations.document_templates.read'
            },
            WORKFLOW: {
                VIEW: 'system.settings.system_configurations.workflow.configuration.view',
                READ: 'system.settings.system_configurations.workflow.configuration.read'
            }
        }, // End CONFIG
    }, // End SETTINGS
    BILLING: {
        VIEW: 'system.billing.view',
        READ: 'system.billing.read',
        MARKETPLACE: {
            VIEW: 'system.billing.market_place.view',
            READ: 'system.billing.market_place.read',
            MANAGE: 'system.billing.market_place.create'
        },
        PACKAGES: {
            VIEW: 'system.billing.compact_packages.view',
            READ: 'system.billing.compact_packages.read',
            MANAGE: 'system.billing.compact_packages.create'
        },
        PLANS: {
            VIEW: 'system.billing.plans.view',
            READ: 'system.billing.plans.read',
            MANAGE: 'system.billing.plans.create'
        },
        INVOICES: {
            VIEW: 'system.billing.invoices.view',
            READ: 'system.billing.invoices.read',
            APPROVE: 'system.billing.invoices.approve'
        },
        LICENSES: {
            VIEW: 'system.billing.licenses.view',
            READ: 'system.billing.licenses.read',
            MANAGE: 'system.billing.licenses.change_plan'
        }
    },
    CONSOLE: {
        VIEW: 'system.system_console.view',
        READ: 'system.system_console.read',
        DASHBOARD: {
            READ: 'system.system_console.dashboard.read',
        },
        MONITORING: {
            READ: 'system.system_console.monitoring.dashboard.read',
        },
        AUDIT: {
            READ: 'system.system_console.audit_compliance.read',
            MANAGE: 'system.system_console.audit_compliance.export_to_excel',
        },
        SCHEDULER: {
            READ: 'system.system_console.job_scheduler.read',
            EXECUTE: 'system.system_console.job_scheduler.execute',
        },
        RETENTION: {
            READ: 'system.system_console.data_retention.read',
            MANAGE: 'system.system_console.data_retention.manage',
        },
        FEATURES: {
            READ: 'system.system_console.feature_flags.read',
            MANAGE: 'system.system_console.feature_flags.manage',
        },
        POLICY: {
            READ: 'system.system_console.policy_security.read',
        },
        FEEDBACK: {
            READ: 'system.system_console.feedback.read',
        },
        TOOLS: {
            READ: 'system.system_console.tools.read',
            EXECUTE: 'system.system_console.tools.execute',
        }
    },
    DEVELOPER: {
        VIEW: 'system.developer_hub.view',
        READ: 'system.developer_hub.read',
        API: {
            READ: 'system.developer_hub.api_reference.read',
        },
        SDK: {
            READ: 'system.developer_hub.sdk.read',
        },
        WEBHOOKS: {
            READ: 'system.developer_hub.webhooks.read',
            MANAGE: 'system.developer_hub.webhooks.send_test_payload',
        },
        PERM_MAP: {
            READ: 'system.developer_hub.permission_map.read',
        }
    },
    FILES: {
        VIEW: 'system.file_manager.view',
        READ: 'system.file_manager.read',
        UPLOAD: 'system.file_manager.upload',
        DELETE: 'system.file_manager.delete_file',
    },
    GUIDE: {
        VIEW: 'system.system_guide.view',
        READ: 'system.system_guide.read',
        EDIT: 'system.system_guide.edit',
        MANAGE: 'system.system_guide.create',
    },
    APPROVALS: {
        VIEW: 'system.approvals.view',
        READ: 'system.approvals.read',
        APPROVE: 'system.approvals.approve',
    },
    COMPLIANCE: {
        VIEW: 'system.settings.security.user_rights.compliance.view',
        READ: 'system.settings.security.user_rights.compliance.read',
        DOWNLOAD_REPORT: 'system.settings.security.user_rights.compliance.download_report',
    }
} as const;

// --- TENANT (Client) ---
const TENANT_SLUGS = {
    DASHBOARD: {
        VIEW: 'tenant.dashboard.view',
        READ: 'tenant.dashboard.read',
    },
    USERS: {
        VIEW: 'tenant.users.view',
        READ: 'tenant.users.read',
        CREATE: 'tenant.users.create',
        MANAGE: 'tenant.users.update'
    },
    ROLES: {
        VIEW: 'tenant.roles.view',
        READ: 'tenant.roles.read',
        CREATE: 'tenant.roles.create',
    },
    SETTINGS: {
        VIEW: 'tenant.settings.view',
        READ: 'tenant.settings.read',
        UPDATE: 'tenant.settings.update',
        MANAGE: 'tenant.settings.update'
    },
    BILLING: {
        VIEW: 'tenant.billing.view',
        READ: 'tenant.billing.read',
        PAY: 'tenant.billing.pay_invoice',
    },
    REPORTS: {
        VIEW: 'tenant.reports.view',
        READ: 'tenant.reports.read',
        EXPORT: 'tenant.reports.export',
    }
} as const;

// --- IAM (Shared/System) ---
const IAM_SLUGS = {
    ROLE: {
        SUBMIT: 'system.user_rights.role.submit',
        APPROVE: 'system.user_rights.role.approve',
        REJECT: 'system.user_rights.role.reject'
    }
} as const;

export const PermissionSlugs = {
    SYSTEM: SYSTEM_SLUGS,
    TENANT: TENANT_SLUGS,
    IAM: IAM_SLUGS,

    // --- DEPRECATED ALIAS FOR BACKWARD COMPATIBILITY ---
    /** @deprecated Use SYSTEM instead. Migration Phase 31. */
    PLATFORM: SYSTEM_SLUGS
} as const;

// Helper to check if a permission string matches a canonical slug pattern
export const isCanonical = (slug: string) => /^(system|tenant|platform)\./.test(slug);

// MAPPING: Legacy Backend Slug -> Canonical Frontend Slug
// Includes mapping for pre-migration 'platform.*' slugs to 'system.*'
export const LEGACY_TO_CANONICAL_MAP: Record<string, string> = {
    // Tenants
    'tenants.view': PermissionSlugs.SYSTEM.TENANTS.VIEW,
    'tenants.create': PermissionSlugs.SYSTEM.TENANTS.CREATE,

    // Legacy Platform Mapping (Dynamic mapping preferred, but explicit helpers here)
    // NOTE: AuthContext should ideally handle dynamic 'platform.' -> 'system.' replacement.
};
