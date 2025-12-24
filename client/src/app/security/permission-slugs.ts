
// --- SYSTEM (Admin Panel) ---
const SYSTEM_SLUGS = {
    DASHBOARD: {
        READ: 'system.dashboard.read',
    },
    TENANTS: {
        READ: 'system.tenants.read',
        CREATE: 'system.tenants.create',
        UPDATE: 'system.tenants.update',
        DELETE: 'system.tenants.delete',
        IMPERSONATE: 'system.tenants.impersonate',
        MANAGE: 'system.tenants.manage_subscription',
    },
    BRANCHES: {
        READ: 'system.branches.read',
        CREATE: 'system.branches.create',
        UPDATE: 'system.branches.update',
        DELETE: 'system.branches.delete',
    },
    USERS: {
        READ: 'system.users.users.read',
        CREATE: 'system.users.users.create',
        UPDATE: 'system.users.users.update',
        DELETE: 'system.users.users.delete',
        INVITE: 'system.users.users.invite',
        CONNECT_TO_EMPLOYEE: 'system.users.users.connect_to_employee',
    },
    CURATORS: {
        READ: 'system.users.curators.read',
        CREATE: 'system.users.curators.create',
        UPDATE: 'system.users.curators.update',
        DELETE: 'system.users.curators.delete',
    },
    ROLES: {
        READ: 'system.settings.security.user_rights.role.read',
        CREATE: 'system.settings.security.user_rights.role.create',
        UPDATE: 'system.settings.security.user_rights.role.update',
        DELETE: 'system.settings.security.user_rights.role.delete',
    },
    AUDIT: {
        READ: 'system.audit_logs.read',
        EXPORT: 'system.audit_logs.export',
    },
    SETTINGS: {
        READ: 'system.settings.read',
        UPDATE: 'system.settings.update',
        GENERAL: {
            READ: 'system.settings.general.read',
            UPDATE: 'system.settings.general.update',
        },
        NOTIFICATIONS: {
            READ: 'system.settings.general.notification_engine.read',
        },
        COMMUNICATION: {
            READ: 'system.settings.communication.read',
            MANAGE: 'system.settings.communication.update',
        },
        SECURITY: {
            READ: 'system.settings.security.read',
            MANAGE: 'system.settings.security.update',
        },
        CONFIG: {
            READ: 'system.settings.system_configurations.read',
            MANAGE: 'system.settings.system_configurations.update',
            BILLING: {
                // VIEW removed
            },
            DICTIONARIES: {
                READ: 'system.settings.system_configurations.dictionary.read',
                SECTORS: {
                    READ: 'system.settings.system_configurations.dictionary.sectors.read'
                },
                UNITS: {
                    READ: 'system.settings.system_configurations.dictionary.units.read'
                },
                CURRENCIES: {
                    READ: 'system.settings.system_configurations.dictionary.currencies.read'
                },
                TIME_ZONES: {
                    READ: 'system.settings.system_configurations.dictionary.time_zones.read'
                },
                ADDRESSES: {
                    READ_COUNTRY: 'system.settings.system_configurations.dictionary.addresses.read_country',
                    READ_CITY: 'system.settings.system_configurations.dictionary.addresses.read_city',
                    READ_DISTRICT: 'system.settings.system_configurations.dictionary.addresses.read_district'
                }
            },
            TEMPLATES: {
                READ: 'system.settings.system_configurations.document_templates.read'
            },
            WORKFLOW: {
                READ: 'system.settings.system_configurations.workflow.configuration.read'
            }
        }, // End CONFIG
    }, // End SETTINGS
    BILLING: {
        READ: 'system.billing.read',
        MARKETPLACE: {
            READ: 'system.billing.market_place.read',
            MANAGE: 'system.billing.market_place.create'
        },
        PACKAGES: {
            READ: 'system.billing.compact_packages.read',
            MANAGE: 'system.billing.compact_packages.create'
        },
        PLANS: {
            READ: 'system.billing.plans.read',
            MANAGE: 'system.billing.plans.create'
        },
        INVOICES: {
            READ: 'system.billing.invoices.read',
            APPROVE: 'system.billing.invoices.approve'
        },
        LICENSES: {
            READ: 'system.billing.licenses.read',
            MANAGE: 'system.billing.licenses.change_plan'
        }
    },
    CONSOLE: {
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
        READ: 'system.file_manager.read',
        UPLOAD: 'system.file_manager.upload',
        DELETE: 'system.file_manager.delete_file',
    },
    GUIDE: {
        READ: 'system.system_guide.read',
        EDIT: 'system.system_guide.edit',
        MANAGE: 'system.system_guide.create',
    },
    APPROVALS: {
        READ: 'system.approvals.read',
        APPROVE: 'system.approvals.approve',
    },
    COMPLIANCE: {
        READ: 'system.settings.security.user_rights.compliance.read',
        DOWNLOAD_REPORT: 'system.settings.security.user_rights.compliance.download_report',
    }
} as const;

// --- TENANT (Client) ---
const TENANT_SLUGS = {
    DASHBOARD: {
        READ: 'tenant.dashboard.read',
    },
    USERS: {
        READ: 'tenant.users.read',
        CREATE: 'tenant.users.create',
        MANAGE: 'tenant.users.update'
    },
    ROLES: {
        READ: 'tenant.roles.read',
        CREATE: 'tenant.roles.create',
    },
    SETTINGS: {
        READ: 'tenant.settings.read',
        UPDATE: 'tenant.settings.update',
        MANAGE: 'tenant.settings.update'
    },
    BILLING: {
        READ: 'tenant.billing.read',
        PAY: 'tenant.billing.pay_invoice',
    },
    REPORTS: {
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

export const isCanonical = (slug: string) => /^(system|tenant|platform)\./.test(slug);

export const LEGACY_TO_CANONICAL_MAP: Record<string, string> = {
    // Tenants
    // 'tenants.view' legacy mapping removed as View is dead
    'tenants.create': PermissionSlugs.SYSTEM.TENANTS.CREATE,
};
