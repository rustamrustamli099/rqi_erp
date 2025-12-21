export declare const PERMISSIONS: {
    SYSTEM: {
        DASHBOARD: {
            VIEW: {
                slug: string;
                description: string;
                scope: string;
            };
        };
        TENANTS: {
            CREATE: {
                slug: string;
                description: string;
                scope: string;
            };
            READ: {
                slug: string;
                description: string;
                scope: string;
            };
            SUSPEND: {
                slug: string;
                description: string;
                scope: string;
            };
            DELETE: {
                slug: string;
                description: string;
                scope: string;
            };
            DOMAINS: {
                MANAGE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
        };
        APPROVALS: {
            VIEW: {
                slug: string;
                description: string;
                scope: string;
            };
        };
        BILLING: {
            VIEW: {
                slug: string;
                description: string;
                scope: string;
            };
            PACKAGES: {
                VIEW: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                CREATE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                UPDATE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                DELETE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                MANAGE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
            SUBSCRIPTIONS: {
                VIEW: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                MANAGE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
        };
        USERS: {
            VIEW: {
                slug: string;
                description: string;
                scope: string;
            };
            CREATE: {
                slug: string;
                description: string;
                scope: string;
            };
            UPDATE: {
                slug: string;
                description: string;
                scope: string;
            };
            DELETE: {
                slug: string;
                description: string;
                scope: string;
            };
            IMPERSONATE: {
                slug: string;
                description: string;
                scope: string;
            };
            MANAGE_ROLES: {
                slug: string;
                description: string;
                scope: string;
            };
        };
        CONFIG: {
            ROLES: {
                VIEW: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                MANAGE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
            PERMISSIONS: {};
            DICTIONARIES: {
                CURRENCIES: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                ADDRESSES: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                TIMEZONES: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                DOC_TEMPLATES: {
                    READ: {
                        slug: string;
                        description: string;
                        scope: string;
                    };
                    MANAGE: {
                        slug: string;
                        description: string;
                        scope: string;
                    };
                };
                APPROVAL_TEMPLATES: {
                    READ: {
                        slug: string;
                        description: string;
                        scope: string;
                    };
                    MANAGE: {
                        slug: string;
                        description: string;
                        scope: string;
                    };
                };
            };
            SECURITY: {
                AUDIT: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                LIMITS: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                POLICIES: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                WAF: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
            MONITORING: {
                VIEW: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                LOGS: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
            BACKUPS: {
                VIEW: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                CREATE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                RESTORE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
            NOTIFICATIONS: {
                CHANNELS: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                TEMPLATES: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                BROADCAST: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
            INTEGRATIONS: {
                PAYMENT: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                STORAGE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
            APPROVALS: {
                VIEW: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
        };
    };
    TENANT: {
        DASHBOARD: {
            VIEW: {
                slug: string;
                description: string;
                scope: string;
            };
        };
        USERS: {
            VIEW: {
                slug: string;
                description: string;
                scope: string;
            };
            CREATE: {
                slug: string;
                description: string;
                scope: string;
            };
            UPDATE: {
                slug: string;
                description: string;
                scope: string;
            };
            DELETE: {
                slug: string;
                description: string;
                scope: string;
            };
            MANAGE_ROLES: {
                slug: string;
                description: string;
                scope: string;
            };
        };
        CONFIG: {
            ROLES: {
                VIEW: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                CREATE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                UPDATE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                DELETE: {
                    slug: string;
                    description: string;
                    scope: string;
                };
            };
            DICTIONARIES: {
                CURRENCIES: {
                    slug: string;
                    description: string;
                    scope: string;
                };
                DOC_TEMPLATES: {
                    READ: {
                        slug: string;
                        description: string;
                        scope: string;
                    };
                    MANAGE: {
                        slug: string;
                        description: string;
                        scope: string;
                    };
                };
                APPROVAL_TEMPLATES: {
                    READ: {
                        slug: string;
                        description: string;
                        scope: string;
                    };
                    MANAGE: {
                        slug: string;
                        description: string;
                        scope: string;
                    };
                };
            };
        };
    };
};
export declare const SCOPES: readonly ["SYSTEM", "TENANT", "BRANCH", "CURATOR"];
