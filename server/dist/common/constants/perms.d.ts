export declare const admin_panel_permissions: {
    dashboard: {
        perms: string[];
    };
    tenants: {
        perms: string[];
    };
    branches: {
        perms: string[];
    };
    users: {
        users: {
            perms: string[];
        };
        curators: {
            perms: string[];
        };
    };
    billing: {
        market_place: {
            perms: string[];
        };
        compact_packages: {
            perms: string[];
        };
        plans: {
            perms: string[];
        };
        invoices: {
            perms: string[];
        };
        licenses: {
            perms: string[];
        };
    };
    approvals: {
        perms: string[];
    };
    file_manager: {
        perms: string[];
    };
    system_guide: {
        perms: string[];
    };
    settings: {
        general: {
            company_profile: {
                perms: string[];
            };
            notification_engine: {
                perms: string[];
            };
        };
        communication: {
            smtp_email: {
                perms: string[];
            };
            smtp_sms: {
                perms: string[];
            };
        };
        security: {
            security_policy: {
                password_policy: {
                    perms: string[];
                };
                access_policy: {
                    perms: string[];
                };
                session_policy: {
                    perms: string[];
                };
                global_policy: {
                    perms: string[];
                };
            };
            sso_OAuth: {
                perms: string[];
            };
            user_rights: {
                role: {
                    perms: string[];
                };
                permission: {
                    perms: string[];
                };
                permission_matrix: {
                    perms: string[];
                };
                compliance: {
                    perms: string[];
                };
            };
        };
        system_configurations: {
            billing_configurations: {
                price_rules: {
                    perms: string[];
                };
                limits_quotas: {
                    perms: string[];
                };
                limit_overshoot: {
                    perms: string[];
                };
                grace_period: {
                    perms: string[];
                };
                grace_requirements: {
                    perms: string[];
                };
                currency_tax: {
                    perms: string[];
                };
                invoice_rules: {
                    perms: string[];
                };
                events: {
                    perms: string[];
                };
                login_and_security: {
                    perms: string[];
                };
            };
            dictionary: {
                sectors: {
                    perms: string[];
                };
                units: {
                    perms: string[];
                };
                currencies: {
                    perms: string[];
                };
                addresses: {
                    perms: string[];
                    country: {
                        perms: string[];
                    };
                    city: {
                        perms: string[];
                    };
                    district: {
                        perms: string[];
                    };
                };
                time_zones: {
                    perms: string[];
                };
            };
            document_templates: {
                perms: string[];
            };
            workflow: {
                configuration: {
                    perms: string[];
                };
                control: {
                    perms: string[];
                };
            };
        };
    };
    system_console: {
        dashboard: {
            perms: string[];
        };
        monitoring: {
            dashboard: {
                perms: string[];
            };
            alert_rules: {
                perms: string[];
            };
            anomaly_detection: {
                perms: string[];
            };
            system_logs: {
                perms: string[];
            };
        };
        audit_compliance: {
            perms: string[];
        };
        job_scheduler: {
            perms: string[];
        };
        data_retention: {
            perms: string[];
        };
        feature_flags: {
            perms: string[];
        };
        policy_security: {
            perms: string[];
        };
        feedback: {
            perms: string[];
        };
        tools: {
            perms: string[];
        };
    };
    developer_hub: {
        api_reference: {
            perms: string[];
        };
        sdk: {
            perms: string[];
        };
        webhooks: {
            perms: string[];
        };
        permission_map: {
            perms: string[];
        };
    };
};
export declare const PERMISSIONS: any;
