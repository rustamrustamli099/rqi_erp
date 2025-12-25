/**
 * SAP-Grade RBAC Registry
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SINGLE SOURCE OF TRUTH for:
 * - Menu visibility
 * - Tab/SubTab permissions
 * - Route guards
 * - Permission Preview Engine
 * 
 * DİQQƏT: Bu fayl kilidlənib. Dəyişikliklər yalnız arxitektura təsdiqi ilə!
 * ═══════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// TYPES
// =============================================================================

export interface TabConfig {
    permission: string;
    label?: string;
}

export interface MenuConfig {
    path: string;
    permission: string;
    icon: string;
    label: string;
    labelAz?: string;
    defaultTab?: string;
    tabs?: Record<string, TabConfig>;
}

export interface RBACRegistry {
    admin: Record<string, MenuConfig>;
    tenant: Record<string, MenuConfig>;
}

// =============================================================================
// ADMIN (SYSTEM) REGISTRY
// =============================================================================

const ADMIN_REGISTRY: Record<string, MenuConfig> = {
    dashboard: {
        path: '/admin/dashboard',
        permission: 'system.dashboard.read',
        icon: 'LayoutDashboard',
        label: 'Dashboard',
        labelAz: 'İdarə etmə paneli'
    },
    tenants: {
        path: '/admin/tenants',
        permission: 'system.tenants.read',
        icon: 'Building2',
        label: 'Tenants',
        labelAz: 'Tenantlar'
    },
    branches: {
        path: '/admin/branches',
        permission: 'system.branches.read',
        icon: 'GitBranch',
        label: 'Branches',
        labelAz: 'Filiallar'
    },
    users: {
        path: '/admin/users',
        permission: 'system.users.read',
        icon: 'Users',
        label: 'Users',
        labelAz: 'İstifadəçilər',
        defaultTab: 'users',
        tabs: {
            users: { permission: 'system.users.users.read', label: 'İstifadəçilər' },
            curators: { permission: 'system.users.curators.read', label: 'Kuratorlar' }
        }
    },
    billing: {
        path: '/admin/billing',
        permission: 'system.billing.read',
        icon: 'CreditCard',
        label: 'Billing',
        labelAz: 'Bilinq',
        defaultTab: 'marketplace',
        tabs: {
            marketplace: { permission: 'system.billing.market_place.read', label: 'Marketplace' },
            packages: { permission: 'system.billing.compact_packages.read', label: 'Kompakt Paketlər' },
            subscriptions: { permission: 'system.billing.plans.read', label: 'Abunəlik Planları' },
            invoices: { permission: 'system.billing.invoices.read', label: 'Fakturalar' },
            licenses: { permission: 'system.billing.licenses.read', label: 'Lisenziyalar' }
        }
    },
    approvals: {
        path: '/admin/approvals',
        permission: 'system.approvals.read',
        icon: 'CheckSquare',
        label: 'Approvals',
        labelAz: 'Təsdiqləmələr'
    },
    files: {
        path: '/admin/files',
        permission: 'system.file_manager.read',
        icon: 'Folder',
        label: 'File Manager',
        labelAz: 'Fayl Meneceri'
    },
    guide: {
        path: '/admin/guide',
        permission: 'system.system_guide.read',
        icon: 'BookOpen',
        label: 'System Guide',
        labelAz: 'Sistem Bələdçisi'
    },
    settings: {
        path: '/admin/settings',
        permission: 'system.settings.read',
        icon: 'Settings',
        label: 'Settings',
        labelAz: 'Tənzimləmələr',
        defaultTab: 'general',
        tabs: {
            // Ümumi
            general: { permission: 'system.settings.general.company_profile.read', label: 'Şirkət Profili' },
            notifications: { permission: 'system.settings.general.notification_engine.read', label: 'Bildiriş Qaydaları' },
            // Kommunikasiya
            smtp: { permission: 'system.settings.communication.smtp_email.read', label: 'SMTP Email' },
            sms: { permission: 'system.settings.communication.smtp_sms.read', label: 'SMS Gateway' },
            // Təhlükəsizlik
            security: { permission: 'system.settings.security.security_policy.global_policy.read', label: 'Təhlükəsizlik Siyasəti' },
            sso: { permission: 'system.settings.security.sso_OAuth.read', label: 'SSO & OAuth' },
            roles: { permission: 'system.settings.security.user_rights.role.read', label: 'İstifadəçi Hüquqları' },
            // Sistem Konfiqurasiyası
            billing_config: { permission: 'system.settings.system_configurations.billing_configurations.price_rules.read', label: 'Billing Konfiqurasiyası' },
            dictionaries: { permission: 'system.settings.system_configurations.dictionary.read', label: 'Soraqçalar' },
            templates: { permission: 'system.settings.system_configurations.document_templates.read', label: 'Sənəd Şablonları' },
            workflow: { permission: 'system.settings.system_configurations.workflow.configuration.read', label: 'Workflow' }
        }
    },
    console: {
        path: '/admin/console',
        permission: 'system.system_console.read',
        icon: 'Terminal',
        label: 'System Console',
        labelAz: 'Sistem Konsolu',
        defaultTab: 'monitoring',
        tabs: {
            dashboard: { permission: 'system.system_console.dashboard.read', label: 'Dashboard' },
            monitoring: { permission: 'system.system_console.monitoring.dashboard.read', label: 'Monitoring' },
            audit: { permission: 'system.system_console.audit_compliance.read', label: 'Audit & Compliance' },
            jobs: { permission: 'system.system_console.job_scheduler.read', label: 'Job Scheduler' },
            retention: { permission: 'system.system_console.data_retention.read', label: 'Data Retention' },
            features: { permission: 'system.system_console.feature_flags.read', label: 'Feature Flags' },
            policy: { permission: 'system.system_console.policy_security.read', label: 'Policy Security' },
            feedback: { permission: 'system.system_console.feedback.read', label: 'Feedback' },
            tools: { permission: 'system.system_console.tools.read', label: 'Tools' }
        }
    },
    developer: {
        path: '/admin/developer',
        permission: 'system.developer_hub.read',
        icon: 'Code',
        label: 'Developer Hub',
        labelAz: 'Developer Hub',
        defaultTab: 'api',
        tabs: {
            api: { permission: 'system.developer_hub.api_reference.read', label: 'API Reference' },
            sdks: { permission: 'system.developer_hub.sdk.read', label: 'SDKs' },
            webhooks: { permission: 'system.developer_hub.webhooks.read', label: 'Webhooks' },
            permissions: { permission: 'system.developer_hub.permission_map.read', label: 'Permission Map' }
        }
    }
};

// =============================================================================
// TENANT REGISTRY
// =============================================================================

const TENANT_REGISTRY: Record<string, MenuConfig> = {
    dashboard: {
        path: '/dashboard',
        permission: 'tenant.dashboard.read',
        icon: 'LayoutDashboard',
        label: 'Dashboard',
        labelAz: 'Əsas Səhifə'
    },
    sales: {
        path: '/sales',
        permission: 'tenant.sales.read',
        icon: 'ShoppingCart',
        label: 'Sales',
        labelAz: 'Satışlar'
    },
    warehouse: {
        path: '/warehouse',
        permission: 'tenant.warehouse.read',
        icon: 'Package',
        label: 'Warehouse',
        labelAz: 'Anbar'
    },
    settings: {
        path: '/settings',
        permission: 'tenant.settings.read',
        icon: 'Settings',
        label: 'Settings',
        labelAz: 'Ayarlar'
    }
};

// =============================================================================
// EXPORT
// =============================================================================

export const RBAC_REGISTRY: RBACRegistry = {
    admin: ADMIN_REGISTRY,
    tenant: TENANT_REGISTRY
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get menu config by path
 */
export function getMenuConfigByPath(path: string): MenuConfig | undefined {
    // Check admin registry
    for (const config of Object.values(ADMIN_REGISTRY)) {
        if (path.startsWith(config.path)) {
            return config;
        }
    }
    // Check tenant registry
    for (const config of Object.values(TENANT_REGISTRY)) {
        if (path.startsWith(config.path)) {
            return config;
        }
    }
    return undefined;
}

/**
 * Get tab config by menu and tab ID
 */
export function getTabConfig(menuId: string, tabId: string, context: 'admin' | 'tenant' = 'admin'): TabConfig | undefined {
    const registry = context === 'admin' ? ADMIN_REGISTRY : TENANT_REGISTRY;
    const menu = registry[menuId];
    return menu?.tabs?.[tabId];
}

/**
 * Get default tab for a menu
 */
export function getDefaultTab(menuId: string, context: 'admin' | 'tenant' = 'admin'): string | undefined {
    const registry = context === 'admin' ? ADMIN_REGISTRY : TENANT_REGISTRY;
    return registry[menuId]?.defaultTab;
}

/**
 * Get all tab IDs for a menu
 */
export function getTabIds(menuId: string, context: 'admin' | 'tenant' = 'admin'): string[] {
    const registry = context === 'admin' ? ADMIN_REGISTRY : TENANT_REGISTRY;
    const menu = registry[menuId];
    return menu?.tabs ? Object.keys(menu.tabs) : [];
}
