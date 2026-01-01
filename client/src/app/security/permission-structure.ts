
// UI Hierarchy for Permission Editor & Matrix
// This file defines HOW permissions are grouped and displayed in the frontend.
// It is NOT the security source of truth (that is the Backend DB).

// 1. Raw Hierarchy Data (Formerly raw-permissions.ts)
// Synced from server structure
export const ADMIN_PERMISSION_HIERARCHY = {
    dashboard: {
        perms: ['read']
    },
    tenants: {
        perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'impersonate', 'manage_users', 'manage_security', 'manage_billing', 'manage_features', 'manage_contract', 'view_audit']
    },
    branches: { perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'read_details', "change_status"] },
    users: {
        users: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status', 'connect_to_employee', 'invite', 'impersonate', 'send_invite', 'manage_restrictions']
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
            perms: ['read', 'approve']
        },
        licenses: {
            perms: ['read', 'change_plan']
        },
    },
    approvals: {
        perms: ['read', 'forward', 'approve', 'reject', 'export_to_excel']
    },
    file_manager: {
        perms: ['read', 'create_folder', 'upload', 'delete_file', 'rename_folder', 'move_folder', 'share_folder', 'permissions_configuration', 'delete_folder', 'rename_file', 'move_file', 'copy_file', 'share_file', 'version']
    },
    system_guide: {
        perms: ['read', 'create', 'update', 'delete', 'share', 'edit', 'publish']
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
                // SAP-GRADE: These must match tabSubTab.registry.ts subTab keys
                password: {
                    perms: ['read', 'update']
                },
                login: {
                    perms: ['read', 'update']
                },
                session: {
                    perms: ['read', 'update']
                },
                restrictions: {
                    perms: ['read', 'create', 'update', 'delete']
                },
            },
            sso_OAuth: {
                perms: ['read', 'create', 'update', 'delete', 'change_status']
            },
            user_rights: {
                roles: {
                    perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'select_permissions', 'submit', 'approve', 'reject']
                },
                matrix_view: {
                    perms: ['read', 'update']
                },
                compliance: {
                    perms: ['read', 'download_report', 'generate_evidence', 'download_json_soc2', 'download_json_iso']
                }
            },
        },
        system_configurations: {
            billing_configurations: {
                pricing: {
                    perms: ['read', 'create', 'update']
                },
                limits: {
                    perms: ['read', 'create', 'update']
                },
                overuse: {
                    perms: ['read', 'create', 'update']
                },
                grace: {
                    perms: ['read', 'create', 'update']
                },
                grace_requirements: {
                    perms: ['read', 'create', 'update']
                },
                currency_tax: {
                    perms: ['read', 'create', 'update']
                },
                invoice: {
                    perms: ['read', 'create', 'update']
                },
                events: {
                    perms: ['read', 'create', 'update']
                },
                security: {
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
                    perms: ['read_country', "create_country", "update_country", "delete_country", "read_city", "create_city", "update_city", "delete_city", "read_district", "create_district", "update_district", "delete_district"],
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
            perms: ['read', 'execute_now', 'details', 'logs', 'execute']
        },
        data_retention: {
            perms: ['read', 'create', 'simulate', 'delete', 'update', 'manage']
        },
        feature_flags: {
            perms: ['read', 'create', 'update', 'delete', 'change_status', 'manage', 'toggle']
        },
        policy_security: {
            perms: ['read', 'create', 'update', 'delete', 'change_status', 'simulate', 'manage']
        },
        feedback: {
            perms: ['read', 'read_details', 'is_done', 'cancel']
        },
        tools: {
            perms: ['read', 'clear_cache', 'change_maintenance_mode', 'execute']
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

export const TENANT_PERMISSION_HIERARCHY = {
    dashboard: {
        perms: ['read']
    },
    users: {
        perms: ['read', 'create', 'update']
    },
    roles: {
        perms: ['read', 'create', 'update', 'delete']
    },
    permission_matrix: {
        perms: ['read', 'update']
    },
    settings: {
        perms: ['read', 'update']
    },
    billing: {
        perms: ['read', 'pay_invoice']
    },
    reports: {
        perms: ['read', 'export']
    }
};

// 2. Logic (Formerly permission-data.ts)
export interface PermissionNode {
    id: string;
    label: string;
    scope: 'SYSTEM' | 'TENANT' | 'COMMON';
    children: PermissionNode[]; // Recursive
    isDangerous?: boolean;
}

// Translation Map
const LABEL_MAP: Record<string, string> = {
    // Top Level
    admin_panel: "Admin Paneli",
    // Modules
    dashboard: "Dashboard",
    tenants: "Tenantlar",
    branches: "Filiallar",
    users: "İstifadəçilər",
    curators: "Kuratorlar",
    billing: "Bilinq və Maliyyə",
    approvals: "Təsdiqləmələr (Approvals)",
    file_manager: "Fayl Meneceri",
    system_guide: "Sistem Bələdçisi",
    settings: "Tənzimləmələr",
    system_console: "System Console",
    developer_hub: "Developer Hub",
    // Sub Modules
    general: "Ümumi",
    communication: "Kommunikasiya",
    security: "Təhlükəsizlik",
    system_configurations: "Sistem Konfiqurasiyaları",
    market_place: "Market Place",
    compact_packages: "Paketlər",
    plans: "Planlar",
    invoices: "Fakturalar",
    licenses: "Lisenziyalar",
    // Deep Subs
    notification_engine: "Bildiriş Mühərriki",
    smtp_email: "SMTP Email",
    smtp_sms: "SMTP SMS",
    security_policy: "Təhlükəsizlik Siyasəti",
    sso_OAuth: "SSO & OAuth",
    user_rights: "İstifadəçi Hüquqları",
    roles_permissions: "Rollar və İcazələr",
    compliance: "Uyğunluq (Compliance)",
    billing_configurations: "Bilinq Konfiqurasiyaları",
    dictionary: "Soraqçalar (Dictionaries)",
    document_templates: "Sənəd Şablonları",
    workflow: "İş Prosesləri (Workflow)",
    monitoring: "Monitoring",
    audit_compliance: "Audit & Compliance",
    job_scheduler: "Job Scheduler",
    data_retention: "Data Retention",
    feature_flags: "Feature Flags",
    policy_security: "Policy Security",
    feedback: "Feedback",
    tools: "Tools",
    api_reference: "API Referans",
    sdk: "SDK",
    webhooks: "Webhooks",
    permission_map: "Permission Map"
};

const formatLabel = (key: string): string => {
    if (LABEL_MAP[key]) return LABEL_MAP[key];

    // Basic humanization Fallback
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ACTION LABELS - Azerbaijani
const ACTION_LABEL_MAP: Record<string, string> = {
    // CRUD
    read: 'Oxu',
    create: 'Yarat',
    update: 'Redaktə Et',
    delete: 'Sil',
    // Export
    export_to_excel: 'Excel-ə İxrac',
    export: 'İxrac',
    download: 'Yüklə',
    download_pdf: 'PDF Yüklə',
    // Status
    change_status: 'Status Dəyiş',
    activate: 'Aktivləşdir',
    deactivate: 'Deaktivləşdir',
    suspend: 'Dayandır',
    // Users
    invite: 'Dəvət Et',
    send_invite: 'Dəvət Göndər',
    impersonate: 'Simulyasiya Et',
    manage_restrictions: 'Məhdudiyyətləri İdarə Et',
    connect_to_employee: 'İşçiyə Bağla',
    reset_password: 'Şifrəni Sıfırla',
    copy_id: 'ID Kopyala',
    // Approvals / Workflow
    approve: 'Təsdiqlə',
    reject: 'Rədd Et',
    forward: 'Yönləndir',
    delegate: 'Delege Et',
    escalate: 'Yüksəlt',
    cancel_process: 'Prosesi Ləğv Et',
    // Settings
    configurate: 'Konfiqurasiya Et',
    set_default: 'Öndəfinəm Təyin Et',
    // Console
    clear_cache: 'Keşi Təmizlə',
    end_all_sessions: 'Bütün Sessiyaları Bitir',
    change_technical_inspection_mode: 'Texniki Yoxlama Rejimi',
    // File Manager
    create_folder: 'Qovluq Yarat',
    upload: 'Yüklə',
    delete_file: 'Faylı Sil',
    rename_folder: 'Qovluğu Adlandır',
    move_folder: 'Qovluğu Köçür',
    share_folder: 'Qovluğu Paylaş',
    permissions_configuration: 'İcazə Konfiqurasiyası',
    delete_folder: 'Qovluğu Sil',
    rename_file: 'Faylı Adlandır',
    move_file: 'Faylı Köçür',
    copy_file: 'Faylı Kopyala',
    share_file: 'Faylı Paylaş',
    version: 'Versiya',
    // Billing
    pay_invoice: 'Fakturanı Ödə',
    send_email: 'Email Göndər',
    audit_logs: 'Audit Qeydləri',
    change_plan: 'Planı Dəyiş',
    billing_history: 'Ödəniş Tarixçəsi',
    limitations: 'Limitlər',
    sign_contract: 'Müqavilə İmzala',
    terminate_contract: 'Müqavilə Bitir',
    storage_limit: 'Yaddaş Limiti',
    modules: 'Modullar',
    tenant_users: 'Tenant İstifadəçiləri',
    '2fa_app_cancel': '2FA Ləğv Et',
    '2fa_app_enable': '2FA Aktiv Et',
    '2fa_app_generate': '2FA Generasiya Et',
    // Granular Management
    manage_users: 'İstifadəçiləri İdarə Et',
    manage_security: 'Təhlükəsizliyi İdarə Et',
    manage_billing: 'Bilinq və Tarixçə',
    manage_features: 'Modul və Limitlər',
    manage_contract: 'Müqavilə İdarəetməsi',
    view_audit: 'Audit Qeydləri',
    // System Guide
    share: 'Paylaş',
    edit: 'Redaktə Et',
    publish: 'Yayımla',
    // Monitoring
    refresh: 'Yenilə',
    read_details: 'Detalları Oxu',
    logs: 'Qeydlər',
    // Developer Hub
    send_test_payload: 'Test Göndər',
};

const formatAction = (action: string): string => {
    // Check ACTION_LABEL_MAP first for Azerbaijani labels
    if (ACTION_LABEL_MAP[action]) return ACTION_LABEL_MAP[action];

    // Fallback: "export_to_excel" -> "Export To Excel"
    return action
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Dangerous Actions
const isDangerous = (action: string) => {
    return ['delete', 'impersonate', 'manage', 'execute', 'suspend', 'terminate_contract', 'clear', 'toggle'].includes(action);
}

// Scope Definition
const SCOPE_MAP: Record<string, 'SYSTEM' | 'TENANT' | 'COMMON'> = {
    dashboard: 'COMMON',
    tenants: 'SYSTEM',
    branches: 'TENANT', // Tenants manage branches
    users: 'COMMON',
    curators: 'SYSTEM',
    billing: 'SYSTEM', // Platform billing management
    approvals: 'COMMON',
    file_manager: 'COMMON',
    system_guide: 'COMMON',
    settings: 'COMMON',
    system_console: 'SYSTEM',
    developer_hub: 'SYSTEM',
};

const getScope = (key: string, parentScope?: 'SYSTEM' | 'TENANT' | 'COMMON', prefix?: string): 'SYSTEM' | 'TENANT' | 'COMMON' => {
    // SAP-GRADE: Prefix is the SOURCE OF TRUTH for scope
    if (prefix?.startsWith('system')) return 'SYSTEM';
    if (prefix?.startsWith('tenant')) return 'TENANT';

    // Fallback to SCOPE_MAP for root nodes
    if (SCOPE_MAP[key]) return SCOPE_MAP[key];
    return parentScope || 'COMMON';
};

const buildNode = (key: string, obj: any, prefix: string, parentScope?: 'SYSTEM' | 'TENANT' | 'COMMON'): PermissionNode => {
    const currentSlug = prefix ? `${prefix}.${key}` : key;
    const label = formatLabel(key);
    const scope = getScope(key, parentScope, prefix);

    const subKeys = Object.keys(obj).filter(k => k !== 'perms');
    const hasPerms = Array.isArray(obj.perms) && obj.perms.length > 0;
    const hasSubs = subKeys.length > 0;

    // CASE 1: Group Node (Has Subs)
    if (hasSubs) {
        return {
            id: currentSlug,
            label: label,
            scope: scope,
            children: subKeys.map(subKey => buildNode(subKey, obj[subKey], currentSlug, scope))
        };
    }

    // CASE 2: Leaf Node (No Subs, Only Perms)
    if (hasPerms) {
        return {
            id: currentSlug,
            label: label,
            scope: scope,
            children: obj.perms.map((action: string) => ({
                id: `${currentSlug}.${action}`,
                label: formatAction(action),
                scope: scope, // Inherit scope for actions
                isDangerous: isDangerous(action)
            }))
        };
    }

    // Fallback
    return {
        id: currentSlug,
        label: label,
        scope: scope,
        children: []
    };
};

// Generate the Tree
// The 'system' prefix is assumed to be the root namespace.
const rawTree = Object.keys(ADMIN_PERMISSION_HIERARCHY).map(key =>
    buildNode(key, (ADMIN_PERMISSION_HIERARCHY as any)[key], "system")
);

const tenantTree = Object.keys(TENANT_PERMISSION_HIERARCHY).map(key =>
    buildNode(key, (TENANT_PERMISSION_HIERARCHY as any)[key], "tenant")
);

// Export flattened tree for better filtering
export const permissionsStructure: PermissionNode[] = [...rawTree, ...tenantTree];

// Lookup Helper
export const getPermissionLabel = (slug: string): string => {
    let label = slug;
    // Simple dynamic formatting logic
    const parts = slug.split('.');
    const action = parts.pop();
    if (action) return formatAction(action);
    return label;
}
