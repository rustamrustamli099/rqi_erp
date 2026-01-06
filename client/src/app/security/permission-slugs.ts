
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
        EXPORT: 'system.tenants.export_to_excel',
        // Granular Actions
        MANAGE_USERS: 'system.tenants.manage_users',
        MANAGE_SECURITY: 'system.tenants.manage_security',
        MANAGE_BILLING: 'system.tenants.manage_billing',
        MANAGE_FEATURES: 'system.tenants.manage_features',
        MANAGE_CONTRACT: 'system.tenants.manage_contract',
        VIEW_AUDIT: 'system.tenants.view_audit',
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
    // User Rights - SEPARATED SubTabs
    USER_RIGHTS: {
        ROLES: {
            READ: 'system.settings.security.user_rights.roles.read',
            CREATE: 'system.settings.security.user_rights.roles.create',
            UPDATE: 'system.settings.security.user_rights.roles.update',
            DELETE: 'system.settings.security.user_rights.roles.delete',
        },
        MATRIX_VIEW: {
            READ: 'system.settings.security.user_rights.matrix_view.read',
            UPDATE: 'system.settings.security.user_rights.matrix_view.update',
        },
        COMPLIANCE: {
            READ: 'system.settings.security.user_rights.compliance.read',
            DOWNLOAD_REPORT: 'system.settings.security.user_rights.compliance.download_report',
        }
    },
    AUDIT: {
        READ: 'system.audit_logs.read',
        EXPORT: 'system.audit_logs.export',
    },
    SETTINGS: {
        READ: 'system.settings.read',
        UPDATE: 'system.settings.update',
        GENERAL: {
            COMPANY_PROFILE: {
                READ: 'system.settings.general.company_profile.read',
                UPDATE: 'system.settings.general.company_profile.update',
            },
            NOTIFICATION_ENGINE: {
                READ: 'system.settings.general.notification_engine.read',
                CREATE: 'system.settings.general.notification_engine.create',
                UPDATE: 'system.settings.general.notification_engine.update',
                DELETE: 'system.settings.general.notification_engine.delete',
                EXPORT: 'system.settings.general.notification_engine.export_to_excel',
                CHANGE_STATUS: 'system.settings.general.notification_engine.change_status',
                COPY_JSON: 'system.settings.general.notification_engine.copy_json',
            },
        },
        // Legacy/Direct mappings if needed, but structure should be primary
        NOTIFICATIONS: {
            READ: 'system.settings.general.notification_engine.read',
        },
        COMMUNICATION: {
            READ: 'system.settings.communication.read',
            // Detailed Objects
            SMTP_EMAIL: {
                READ: 'system.settings.communication.smtp_email.read',
                UPDATE: 'system.settings.communication.smtp_email.update',
                SEND_TEST: 'system.settings.communication.smtp_email.send_test',
                CHANGE_STATUS: 'system.settings.communication.smtp_email.change_status',
            },
            SMTP_SMS: {
                READ: 'system.settings.communication.smtp_sms.read',
                UPDATE: 'system.settings.communication.smtp_sms.update',
                SEND_TEST: 'system.settings.communication.smtp_sms.send_test',
                CHANGE_STATUS: 'system.settings.communication.smtp_sms.change_status',
            },
        },
        SECURITY: {
            READ: 'system.settings.security.read',
            MANAGE: 'system.settings.security.update',
            SECURITY_POLICY: {
                PASSWORD: {
                    READ: 'system.settings.security.security_policy.password.read',
                    UPDATE: 'system.settings.security.security_policy.password.update',
                },
                LOGIN: {
                    READ: 'system.settings.security.security_policy.login.read',
                    UPDATE: 'system.settings.security.security_policy.login.update',
                },
                SESSION: {
                    READ: 'system.settings.security.security_policy.session.read',
                    UPDATE: 'system.settings.security.security_policy.session.update',
                },
                RESTRICTIONS: {
                    READ: 'system.settings.security.security_policy.restrictions.read',
                    CREATE: 'system.settings.security.security_policy.restrictions.create',
                    UPDATE: 'system.settings.security.security_policy.restrictions.update',
                    DELETE: 'system.settings.security.security_policy.restrictions.delete',
                    CHANGE_STATUS: 'system.settings.security.security_policy.restrictions.change_status',
                    EXPORT_TO_EXCEL: 'system.settings.security.security_policy.restrictions.export_to_excel',
                }
            },
            SSO_OAUTH: {
                READ: 'system.settings.security.sso_oauth.read',
                CREATE: 'system.settings.security.sso_oauth.create',
                UPDATE: 'system.settings.security.sso_oauth.update',
                DELETE: 'system.settings.security.sso_oauth.delete',
                CHANGE_STATUS: 'system.settings.security.sso_oauth.change_status',
                TEST_CONNECTION: 'system.settings.security.sso_oauth.test_connection',
                EXPORT_TO_EXCEL: 'system.settings.security.sso_oauth.export_to_excel',
            }
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
            CREATE: 'system.billing.market_place.create',
            UPDATE: 'system.billing.market_place.update',
            DELETE: 'system.billing.market_place.delete',
            CHANGE_STATUS: 'system.billing.market_place.change_status',
            EXPORT: 'system.billing.market_place.export_to_excel'
        },
        PACKAGES: {
            READ: 'system.billing.compact_packages.read',
            CREATE: 'system.billing.compact_packages.create',
            UPDATE: 'system.billing.compact_packages.update',
            DELETE: 'system.billing.compact_packages.delete',
            CHANGE_STATUS: 'system.billing.compact_packages.change_status',
            EXPORT: 'system.billing.compact_packages.export_to_excel'
        },
        PLANS: {
            READ: 'system.billing.plans.read',
            CREATE: 'system.billing.plans.create',
            UPDATE: 'system.billing.plans.update',
            DELETE: 'system.billing.plans.delete',
            CHANGE_STATUS: 'system.billing.plans.change_status',
            EXPORT: 'system.billing.plans.export_to_excel'
        },
        INVOICES: {
            READ: 'system.billing.invoices.read',
            DOWNLOAD: 'system.billing.invoices.download',
            RESEND: 'system.billing.invoices.resend',
            VOID: 'system.billing.invoices.void',
            PAY: 'system.billing.invoices.pay',
            EXPORT_TO_EXCEL: 'system.billing.invoices.export_to_excel'
        },
        LICENSES: {
            READ: 'system.billing.licenses.read',
            CHANGE_PLAN: 'system.billing.licenses.change_plan',
            MANAGE_SEATS: 'system.billing.licenses.manage_seats',
            CANCEL: 'system.billing.licenses.cancel',
            VIEW_AUDIT: 'system.billing.licenses.view_audit'
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
        UPDATE: 'tenant.roles.update', // Match structure
        DELETE: 'tenant.roles.delete', // Match structure
    },
    PERMISSION_MATRIX: {
        READ: 'tenant.permission_matrix.read',
        UPDATE: 'tenant.permission_matrix.update'
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
        SUBMIT: 'system.user_rights.roles_permissions.submit',
        APPROVE: 'system.user_rights.roles_permissions.approve',
        REJECT: 'system.user_rights.roles_permissions.reject'
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
