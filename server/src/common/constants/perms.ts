
// =================================================================================================
// PERMISSION DEFINITIONS (Source of Truth)
// =================================================================================================

export const admin_panel_permissions = {
    dashboard: {
        perms: ['view', 'read']
    },
    tenants: {
        perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', 'tenant_users', 'reset_password', '2fa_app_cancel', '2fa_app_enable', '2fa_app_generate', 'impersonate', 'modules', 'storage_limit', 'billing_history', 'limitations', 'sign_contract', 'terminate_contract', 'suspend']
    },
    branches: { perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', 'read_details', "change_status"] },
    users: {
        users: {
            perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', "change_status", 'connect_to_employee', 'invite']
        },
        curators: {
            perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', "change_status", 'copy_id']
        },
    },
    billing: {
        perms: ['view', 'read'],
        market_place: {
            perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        compact_packages: {
            perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        plans: {
            perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        invoices: {
            perms: ['view', 'read', 'download_pdf', "send_email", 'approve']
        },
        licenses: {
            perms: ['view', 'read', 'audit_logs', 'change_plan']
        },
    },
    approvals: {
        perms: ['view', 'read', 'forward', 'approve', 'reject', 'export_to_excel']
    },
    file_manager: {
        perms: ['view', 'read', 'create_folder', 'upload', 'delete_file', 'rename_folder', 'move_folder', 'share_folder', 'permissions_configuration', 'delete_folder', 'rename_file', 'move_file', 'copy_file', 'share_file', 'version']
    },
    system_guide: {
        perms: ['view', 'read', 'create', 'update', 'delete', 'share', 'edit', 'publish']
    },
    settings: {
        perms: ['view', 'read', 'update'],
        general: {
            perms: ['view', 'read', 'update'],
            company_profile: {
                perms: ['view', 'read', 'create', 'update']
            },
            notification_engine: {
                perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', 'change_status', 'copy_json']
            },
        },
        communication: {
            perms: ['view', 'read', 'update'],
            smtp_email: {
                perms: ['view', 'read', 'create', 'update', 'delete', 'test_connection']
            },
            smtp_sms: {
                perms: ['view', 'read', 'create', 'update', 'delete', 'test_connection', 'change_status']
            },
        },
        security: {
            perms: ['view', 'read', 'update'],
            security_policy: {
                password_policy: {
                    perms: ['view', 'read', 'create', 'update']
                },
                access_policy: {
                    perms: ['view', 'read', 'create', 'update']
                },
                session_policy: {
                    perms: ['view', 'read', 'create', 'update']
                },
                global_policy: {
                    perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
                },
            },
            sso_OAuth: {
                perms: ['view', 'read', 'create', 'update', 'delete', 'change_status']
            },
            user_rights: {
                role: {
                    perms: ['view', 'read', 'create', 'update', 'delete', 'export_to_excel', 'select_permissions', 'submit', 'approve', 'reject']
                },
                permission: {
                    perms: ['view', 'read', 'create', 'update']
                },
                permission_matrix: {
                    perms: ['view', 'read']
                },
                compliance: {
                    perms: ['view', 'read', 'download_report', 'generate_evidence', 'download_json_soc2', 'download_json_iso']
                }
            },
        },
        system_configurations: {
            perms: ['view', 'read', 'update'],
            billing_configurations: {
                perms: ['view', 'read'], // Container
                price_rules: {
                    perms: ['view', 'read', 'create', 'update']
                },
                limits_quotas: {
                    perms: ['view', 'read', 'create', 'update']
                },
                limit_overshoot: {
                    perms: ['view', 'read', 'create', 'update']
                },
                grace_period: {
                    perms: ['view', 'read', 'create', 'update']
                },
                grace_requirements: {
                    perms: ['view', 'read', 'create', 'update']
                },
                currency_tax: {
                    perms: ['view', 'read', 'create', 'update']
                },
                invoice_rules: {
                    perms: ['view', 'read', 'create', 'update']
                },
                events: {
                    perms: ['view', 'read', 'create', 'update']
                },
                login_and_security: {
                    perms: ['view', 'read', 'create', 'update']
                },
            },
            dictionary: {
                sectors: {
                    perms: ['view', 'read', 'create', 'update', 'delete']
                },
                units: {
                    perms: ['view', 'read', 'create', 'update', 'delete']
                },
                currencies: {
                    perms: ['view', 'read', 'create', 'update', 'delete']
                },
                addresses: {
                    country: { perms: ['view', 'read', 'create', 'update', 'delete'] },
                    city: { perms: ['view', 'read', 'create', 'update', 'delete'] },
                    district: { perms: ['view', 'read', 'create', 'update', 'delete'] },
                },
                time_zones: { perms: ['view', 'read', 'create', 'update', 'delete', 'set_default'] },
            },
            document_templates: {
                perms: ['view', 'read', 'configurate', 'update', 'set_default', 'download', 'delete', 'export_to_excel', 'create']
            },
            workflow: {
                configuration: {
                    perms: ['view', 'read', 'create', 'update']
                },
                control: {
                    perms: ['view', 'read', 'refresh', 'read_details', 'logs', 'approve', 'reject', 'delegate', 'escalate', 'cancel_process']
                },
            },
        },
    },
    system_console: {
        perms: ['view', 'read', 'manage'],
        dashboard: {
            perms: ['view', 'read', 'change_technical_inspection_mode', 'end_all_sessions', 'clear_cache']
        },
        monitoring: {
            dashboard: {
                perms: ['view', 'read']
            },
            alert_rules: {
                perms: ['view', 'read', 'create', 'update', 'delete']
            },
            anomaly_detection: {
                perms: ['view', 'read', 'configure']
            },
            system_logs: {
                perms: ['view', 'read', 'clear', 'export_to_excel']
            },
        },
        audit_compliance: { perms: ['view', 'read', 'export_to_excel', 'read_details'] },
        job_scheduler: {
            perms: ['view', 'read', 'execute_now', 'details', 'logs', 'execute']
        },
        data_retention: {
            perms: ['view', 'read', 'create', 'simulate', 'delete', 'update', 'manage']
        },
        feature_flags: {
            perms: ['view', 'read', 'create', 'update', 'delete', 'change_status', 'manage', 'toggle']
        },
        policy_security: {
            perms: ['view', 'read', 'create', 'update', 'delete', 'change_status', 'simulate', 'manage']
        },
        feedback: {
            perms: ['view', 'read', 'read_details', 'is_done', 'cancel']
        },
        tools: {
            perms: ['view', 'read', 'clear_cache', 'change_maintenance_mode', 'execute']
        },
    },
    developer_hub: {
        perms: ['view', 'read'],
        api_reference: {
            perms: ['view', 'read', 'open_rest_api_docs', 'open_graphQL_api_docs']
        },
        sdk: {
            perms: ['view', 'read', 'download']
        },
        webhooks: {
            perms: ['view', 'read', 'send_test_payload']
        },
        permission_map: {
            perms: ['view', 'read']
        },
    },
}

// =================================================================================================
// PERMISSION GENERATOR & CONSTANTS (Single Source of Truth)
// =================================================================================================

/**
 * flattens the nested permission object into a dot-notation map
 * Example: { dashboard: { perms: ['view'] } } -> { dashboard: { view: 'platform.dashboard.view' } }
 */
function generatePermissionMap(obj: any, prefix: string = 'platform'): any {
    const map: any = {};
    for (const key in obj) {
        if (key === 'perms' && Array.isArray(obj[key])) {
            // Leaf node with permissions array
            // keys: view -> value: prefix.view
            obj[key].forEach((action: string) => {
                map[action] = `${prefix}.${action}`;
            });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const nextPrefix = prefix ? `${prefix}.${key}` : key;
            map[key] = generatePermissionMap(obj[key], nextPrefix);
        }
    }

    // Add perms at current level if they exist (handling hybrid structure)
    if (obj.perms && Array.isArray(obj.perms)) {
        obj.perms.forEach((action: string) => {
            map[action] = `${prefix}.${action}`;
        });
    }

    return map;
}

export const PERMISSIONS = generatePermissionMap(admin_panel_permissions, 'platform');
