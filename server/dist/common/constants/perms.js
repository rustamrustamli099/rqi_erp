"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin_panel_permissions = void 0;
exports.admin_panel_permissions = {
    dashboard: {
        perms: ['read']
    },
    tenants: {
        perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'tenant_users', 'reset_password', '2fa_app_cancel', '2fa_app_enable', '2fa_app_generate', 'impersonate', 'modules', 'storage_limit', 'billing_history', 'limitations', 'sign_contract', 'terminate_contract', 'suspend']
    },
    branches: { perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'read_details', "change_status"] },
    users: {
        users: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', "change_status", 'connect_to_employee']
        },
        curators: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', "change_status", 'copy_id']
        },
    },
    billing: {
        market_place: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        compact_packages: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        plans: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        invoices: {
            perms: ['read', 'download_pdf', "send_email"]
        },
        licenses: {
            perms: ['read', 'audit_logs', 'change_plan']
        },
    },
    approvals: {
        perms: ['read', 'forward', 'approve', 'reject', 'export_to_excel']
    },
    file_manager: {
        perms: ['read', 'create_folder', 'dovload_file', 'rename_folder', 'move_folder', 'share_folder', 'permissions_configuration', 'delete_folder', 'rename_file', 'move_file', 'copy_file', 'share_file', 'delete_file', 'version']
    },
    system_guide: {
        perms: ['read', 'create', 'update', 'delete', 'share']
    },
    settings: {
        general: {
            company_profile: {
                perms: ['read', 'create', 'update']
            },
            notification_engine: {
                perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status', 'copy_json']
            },
        },
        communication: {
            smtp_email: {
                perms: ['read', 'create', 'update', 'delete', 'test_connection']
            },
            smtp_sms: {
                perms: ['read', 'create', 'update', 'delete', 'test_connection', 'change_status']
            },
        },
        security: {
            security_policy: {
                password_policy: {
                    perms: ['read', 'create', 'update']
                },
                access_policy: {
                    perms: ['read', 'create', 'update']
                },
                session_policy: {
                    perms: ['read', 'create', 'update']
                },
                global_policy: {
                    perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
                },
            },
            sso_OAuth: {
                perms: ['read', 'create', 'update', 'delete', 'change_status']
            },
            user_rights: {
                role: {
                    perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'select_permissions']
                },
                permission: {
                    perms: ['read', 'create', 'update']
                },
            },
        },
        system_configurations: {
            billing_configurations: {
                price_rules: {
                    perms: ['read', 'create', 'update']
                },
                limits_quotas: {
                    perms: ['read', 'create', 'update']
                },
                limit_overshoot: {
                    perms: ['read', 'create', 'update']
                },
                grace_period: {
                    perms: ['read', 'create', 'update']
                },
                grace_requirements: {
                    perms: ['read', 'create', 'update']
                },
                currency_tax: {
                    perms: ['read', 'create', 'update']
                },
                invoice_rules: {
                    perms: ['read', 'create', 'update']
                },
                events: {
                    perms: ['read', 'create', 'update']
                },
                login_and_security: {
                    perms: ['read', 'create', 'update']
                },
            },
            dictionary: {
                sectors: {
                    perms: ['read', 'create', 'update', 'delete']
                },
                units: {
                    perms: ['read', 'create', 'update', 'delete']
                },
                currencies: {
                    perms: ['read', 'create', 'update', 'delete']
                },
                addresses: {
                    country: { perms: ['read', 'create', 'update', 'delete'] },
                    city: { perms: ['read', 'create', 'update', 'delete'] },
                    district: { perms: ['read', 'create', 'update', 'delete'] },
                },
                time_zones: { perms: ['read', 'create', 'update', 'delete', 'set_default'] },
            },
            document_templates: {
                perms: ['read', 'configurate', 'update', 'set_default', 'download', 'delete', 'export_to_excel', 'create']
            },
            workflow: {
                configuration: {
                    perms: ['read', 'create', 'update']
                },
                control: {
                    perms: ['read', 'refresh', 'read_details', 'logs', 'approve', 'reject', 'delegate', 'escalate', 'cancel_process']
                },
            },
        },
    },
    system_console: {
        dashboard: {
            perms: ['read', 'change_technical_inspection_mode', 'end_all_sessions', 'clear_cache']
        },
        monitoring: {
            dashboard: {
                perms: ['read']
            },
            alert_rules: {
                perms: ['read', 'create', 'update', 'delete']
            },
            anomaly_detection: {
                perms: ['read', 'configure']
            },
            system_logs: {
                perms: ['read', 'clear', 'export_to_excel']
            },
        },
        audit_compliance: { perms: ['read', 'export_to_excel', 'read_details'] },
        job_scheduler: {
            perms: ['read', 'execute_now', 'details', 'logs']
        },
        data_retention: {
            perms: ['read', 'create', 'simulate', 'delete', 'update']
        },
        feature_flags: {
            perms: ['read', 'create', 'update', 'delete', 'change_status']
        },
        policy_security: {
            perms: ['read', 'create', 'update', 'delete', 'change_status', 'simulate']
        },
        feedback: {
            perms: ['read', 'read_details', 'is_done', 'cancel']
        },
        tools: {
            perms: ['read', 'clear_cache', 'change_maintenance_mode']
        },
    },
    developer_hub: {
        api_reference: {
            perms: ['read', 'open_rest_api_docs', 'open_graphQL_api_docs']
        },
        sdk: {
            perms: ['read', 'download']
        },
        webhooks: {
            perms: ['read', 'send_test_payload']
        },
        permission_map: {
            perms: ['read']
        },
    },
};
//# sourceMappingURL=perms.js.map