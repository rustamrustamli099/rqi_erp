
export const PermissionSlugs = {
    // --- PLATFORM (System) ---
    PLATFORM: {
        DASHBOARD: {
            VIEW: 'platform.dashboard.view',
            READ: 'platform.dashboard.read',
        },
        TENANTS: {
            VIEW: 'platform.tenants.view',
            READ: 'platform.tenants.read',
            CREATE: 'platform.tenants.create',
            UPDATE: 'platform.tenants.update',
            DELETE: 'platform.tenants.delete',
            IMPERSONATE: 'platform.tenants.impersonate',
            MANAGE: 'platform.tenants.manage_subscription',
        },
        BRANCHES: {
            VIEW: 'platform.branches.view',
            READ: 'platform.branches.read',
            CREATE: 'platform.branches.create',
            UPDATE: 'platform.branches.update',
            DELETE: 'platform.branches.delete',
        },
        USERS: {
            VIEW: 'platform.users.users.view',
            READ: 'platform.users.users.read',
            CREATE: 'platform.users.users.create',
            UPDATE: 'platform.users.users.update',
            DELETE: 'platform.users.users.delete',
            INVITE: 'platform.users.users.invite',
        },
        CURATORS: {
            VIEW: 'platform.users.curators.view',
            READ: 'platform.users.curators.read',
            CREATE: 'platform.users.curators.create',
            UPDATE: 'platform.users.curators.update',
            DELETE: 'platform.users.curators.delete',
        },
        ROLES: {
            VIEW: 'platform.settings.security.user_rights.role.view',
            READ: 'platform.settings.security.user_rights.role.read',
            CREATE: 'platform.settings.security.user_rights.role.create',
            UPDATE: 'platform.settings.security.user_rights.role.update',
            DELETE: 'platform.settings.security.user_rights.role.delete',
        },
        AUDIT: {
            VIEW: 'platform.audit_logs.view',
            READ: 'platform.audit_logs.read',
            EXPORT: 'platform.audit_logs.export',
        },
        SETTINGS: {
            VIEW: 'platform.settings.view',
            READ: 'platform.settings.read',
            UPDATE: 'platform.settings.update',
            GENERAL: {
                VIEW: 'platform.settings.general.view',
                READ: 'platform.settings.general.read',
                UPDATE: 'platform.settings.general.update',
            },
            NOTIFICATIONS: {
                VIEW: 'platform.settings.general.notification_engine.view',
                READ: 'platform.settings.general.notification_engine.read',
            },
            COMMUNICATION: {
                VIEW: 'platform.settings.communication.view',
                READ: 'platform.settings.communication.read',
                MANAGE: 'platform.settings.communication.update',
            },
            SECURITY: {
                VIEW: 'platform.settings.security.view',
                READ: 'platform.settings.security.read',
                MANAGE: 'platform.settings.security.update',
            },
            CONFIG: {
                VIEW: 'platform.settings.system_configurations.view',
                READ: 'platform.settings.system_configurations.read',
                MANAGE: 'platform.settings.system_configurations.update',
                BILLING: {
                    VIEW: 'platform.settings.system_configurations.billing_configurations.price_rules.view',
                },
                DICTIONARIES: {
                    VIEW: 'platform.settings.system_configurations.dictionary.view',
                    READ: 'platform.settings.system_configurations.dictionary.read',
                    SECTORS: {
                        VIEW: 'platform.settings.system_configurations.dictionary.sectors.view',
                        READ: 'platform.settings.system_configurations.dictionary.sectors.read'
                    },
                    UNITS: {
                        VIEW: 'platform.settings.system_configurations.dictionary.units.view',
                        READ: 'platform.settings.system_configurations.dictionary.units.read'
                    },
                    CURRENCIES: {
                        VIEW: 'platform.settings.system_configurations.dictionary.currencies.view',
                        READ: 'platform.settings.system_configurations.dictionary.currencies.read'
                    },
                    TIME_ZONES: {
                        VIEW: 'platform.settings.system_configurations.dictionary.time_zones.view',
                        READ: 'platform.settings.system_configurations.dictionary.time_zones.read'
                    },
                    ADDRESSES: {
                        VIEW: 'platform.settings.system_configurations.dictionary.addresses.view', // Consolidated view for parent
                        READ: 'platform.settings.system_configurations.dictionary.addresses.read',
                        COUNTRY: {
                            VIEW: 'platform.settings.system_configurations.dictionary.addresses.country.view',
                            READ: 'platform.settings.system_configurations.dictionary.addresses.country.read'
                        },
                        CITY: {
                            VIEW: 'platform.settings.system_configurations.dictionary.addresses.city.view',
                            READ: 'platform.settings.system_configurations.dictionary.addresses.city.read'
                        },
                        DISTRICT: {
                            VIEW: 'platform.settings.system_configurations.dictionary.addresses.district.view',
                            READ: 'platform.settings.system_configurations.dictionary.addresses.district.read'
                        }
                    }
                },
                TEMPLATES: {
                    VIEW: 'platform.settings.system_configurations.document_templates.view',
                    READ: 'platform.settings.system_configurations.document_templates.read'
                },
                WORKFLOW: {
                    VIEW: 'platform.settings.system_configurations.workflow.configuration.view',
                    READ: 'platform.settings.system_configurations.workflow.configuration.read'
                }
            }, // End CONFIG
        }, // End SETTINGS
        BILLING: {
            VIEW: 'platform.billing.view',
            READ: 'platform.billing.read',
            MARKETPLACE: {
                VIEW: 'platform.billing.market_place.view',
                READ: 'platform.billing.market_place.read',
                MANAGE: 'platform.billing.market_place.create'
            },
            PACKAGES: {
                VIEW: 'platform.billing.compact_packages.view',
                READ: 'platform.billing.compact_packages.read',
                MANAGE: 'platform.billing.compact_packages.create'
            },
            PLANS: {
                VIEW: 'platform.billing.plans.view',
                READ: 'platform.billing.plans.read',
                MANAGE: 'platform.billing.plans.create'
            },
            INVOICES: {
                VIEW: 'platform.billing.invoices.view',
                READ: 'platform.billing.invoices.read',
                APPROVE: 'platform.billing.invoices.approve'
            },
            LICENSES: {
                VIEW: 'platform.billing.licenses.view',
                READ: 'platform.billing.licenses.read',
                MANAGE: 'platform.billing.licenses.change_plan'
            }
        },
        CONSOLE: {
            VIEW: 'platform.system_console.view',
            READ: 'platform.system_console.read',
            DASHBOARD: {
                READ: 'platform.system_console.dashboard.read',
            },
            MONITORING: {
                READ: 'platform.system_console.monitoring.dashboard.read',
            },
            AUDIT: {
                READ: 'platform.system_console.audit_compliance.read',
                MANAGE: 'platform.system_console.audit_compliance.export_to_excel',
            },
            SCHEDULER: {
                READ: 'platform.system_console.job_scheduler.read',
                EXECUTE: 'platform.system_console.job_scheduler.execute',
            },
            RETENTION: {
                READ: 'platform.system_console.data_retention.read',
                MANAGE: 'platform.system_console.data_retention.manage',
            },
            FEATURES: {
                READ: 'platform.system_console.feature_flags.read',
                MANAGE: 'platform.system_console.feature_flags.manage',
            },
            POLICY: {
                READ: 'platform.system_console.policy_security.read',
            },
            FEEDBACK: {
                READ: 'platform.system_console.feedback.read',
            },
            TOOLS: {
                READ: 'platform.system_console.tools.read',
                EXECUTE: 'platform.system_console.tools.execute',
            }
        },
        DEVELOPER: {
            VIEW: 'platform.developer_hub.view',
            READ: 'platform.developer_hub.read',
            API: {
                READ: 'platform.developer_hub.api_reference.read',
            },
            SDK: {
                READ: 'platform.developer_hub.sdk.read',
            },
            WEBHOOKS: {
                READ: 'platform.developer_hub.webhooks.read',
                MANAGE: 'platform.developer_hub.webhooks.send_test_payload',
            },
            PERM_MAP: {
                READ: 'platform.developer_hub.permission_map.read',
            }
        },
        FILES: {
            VIEW: 'platform.file_manager.view',
            READ: 'platform.file_manager.read',
            UPLOAD: 'platform.file_manager.upload',
            DELETE: 'platform.file_manager.delete_file',
        },
        GUIDE: {
            VIEW: 'platform.system_guide.view',
            READ: 'platform.system_guide.read',
            EDIT: 'platform.system_guide.edit',
            MANAGE: 'platform.system_guide.create',
        },
        APPROVALS: {
            VIEW: 'platform.approvals.view',
            READ: 'platform.approvals.read',
            APPROVE: 'platform.approvals.approve',
        },
        COMPLIANCE: {
            VIEW: 'platform.settings.security.user_rights.compliance.view',
            READ: 'platform.settings.security.user_rights.compliance.read',
            DOWNLOAD_REPORT: 'platform.settings.security.user_rights.compliance.download_report',
        }
    }, // End PLATFORM

    // --- TENANT (Client) ---
    TENANT: {
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
    },

    // --- ROLES & PERMISSIONS ---
    IAM: {
        ROLE: {
            SUBMIT: 'platform.user_rights.role.submit',
            APPROVE: 'platform.user_rights.role.approve',
            REJECT: 'platform.user_rights.role.reject'
        }
    }
} as const;

// Helper to check if a permission string matches a canonical slug pattern
export const isCanonical = (slug: string) => /^(platform|tenant)\./.test(slug);

// MAPPING: Legacy Backend Slug -> Canonical Frontend Slug
export const LEGACY_TO_CANONICAL_MAP: Record<string, string> = {
    // Tenants
    'tenants.view': PermissionSlugs.PLATFORM.TENANTS.VIEW,
    'tenants.create': PermissionSlugs.PLATFORM.TENANTS.CREATE,

    // Add other mappings as needed but favor direct use of new slugs
};
