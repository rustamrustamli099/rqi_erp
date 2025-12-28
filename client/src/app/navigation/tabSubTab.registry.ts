/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TAB/SUBTAB FROZEN REGISTRY — Single Source of Truth
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-Grade navigation registry. Drives:
 * - Sidebar visibility
 * - Default redirects (getFirstAllowedRoute)
 * - ProtectedRoute checks
 * - Preview Engine ("user nə görəcək?")
 * 
 * FROZEN: Changes require architecture approval!
 * ═══════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// TYPES
// =============================================================================

export interface SubTabConfig {
    key: string;
    label: string;
    requiredAnyOf: string[];  // ANY grants entry
}

export interface TabConfig {
    key: string;
    label: string;
    requiredAnyOf: string[];  // ANY grants entry
    subTabs?: SubTabConfig[];
}

export interface PageConfig {
    pageKey: string;
    basePath: string;
    icon: string;
    label: string;
    labelAz: string;
    tabs: TabConfig[];  // Ordered by priority
}

export interface TabSubTabRegistry {
    admin: PageConfig[];
    tenant: PageConfig[];
}

// =============================================================================
// PERMISSION NORMALIZATION
// =============================================================================

/**
 * SAP-GRADE: If user has write/manage action, READ is implied
 * This ensures entry to list pages when user has create/update/delete
 */
export function normalizePermissions(permissions: string[]): string[] {
    const normalized = new Set(permissions);

    permissions.forEach(perm => {
        // Extract base and action
        const parts = perm.split('.');
        const action = parts[parts.length - 1];
        const base = parts.slice(0, -1).join('.');

        // If write action exists, add read
        if (['create', 'update', 'delete', 'manage', 'approve', 'export'].includes(action)) {
            normalized.add(`${base}.read`);
        }
    });

    return Array.from(normalized);
}

// =============================================================================
// ADMIN PANEL REGISTRY
// =============================================================================

const ADMIN_PAGES: PageConfig[] = [
    {
        pageKey: 'admin.dashboard',
        basePath: '/admin/dashboard',
        icon: 'LayoutDashboard',
        label: 'Dashboard',
        labelAz: 'İdarə Paneli',
        tabs: [
            // Dashboard: DB has system.dashboard.read + fallback to common permissions
            { key: 'overview', label: 'Overview', requiredAnyOf: ['system.dashboard.read', 'system.tenants.read', 'system.users.users.read', 'system.users.curators.read'] }
        ]
    },
    {
        pageKey: 'admin.tenants',
        basePath: '/admin/tenants',
        icon: 'Building2',
        label: 'Tenants',
        labelAz: 'Tenantlar',
        tabs: [
            { key: 'list', label: 'Siyahı', requiredAnyOf: ['system.tenants.read'] }
        ]
    },
    {
        pageKey: 'admin.branches',
        basePath: '/admin/branches',
        icon: 'GitBranch',
        label: 'Branches',
        labelAz: 'Filiallar',
        tabs: [
            { key: 'list', label: 'Siyahı', requiredAnyOf: ['system.branches.read'] }
        ]
    },
    {
        pageKey: 'admin.users',
        basePath: '/admin/users',
        icon: 'Users',
        label: 'Users',
        labelAz: 'İstifadəçilər',
        tabs: [
            {
                key: 'users',
                label: 'İstifadəçilər',
                requiredAnyOf: ['system.users.users.read', 'system.users.read']
            },
            {
                key: 'curators',
                label: 'Kuratorlar',
                requiredAnyOf: ['system.users.curators.read']
            }
        ]
    },
    {
        pageKey: 'admin.billing',
        basePath: '/admin/billing',
        icon: 'CreditCard',
        label: 'Billing',
        labelAz: 'Bilinq',
        tabs: [
            { key: 'marketplace', label: 'Marketplace', requiredAnyOf: ['system.billing.market_place.read'] },
            { key: 'packages', label: 'Kompakt Paketlər', requiredAnyOf: ['system.billing.compact_packages.read'] },
            { key: 'subscriptions', label: 'Abunəlik Planları', requiredAnyOf: ['system.billing.plans.read'] },
            { key: 'invoices', label: 'Fakturalar', requiredAnyOf: ['system.billing.invoices.read'] },
            { key: 'licenses', label: 'Lisenziyalar', requiredAnyOf: ['system.billing.licenses.read'] }
        ]
    },
    {
        pageKey: 'admin.approvals',
        basePath: '/admin/approvals',
        icon: 'CheckSquare',
        label: 'Approvals',
        labelAz: 'Təsdiqləmələr',
        tabs: [
            { key: 'inbox', label: 'Inbox', requiredAnyOf: ['system.approvals.read', 'system.approvals.inbox.view'] },
            { key: 'history', label: 'Tarixçə', requiredAnyOf: ['system.approvals.read'] }
        ]
    },
    {
        pageKey: 'admin.files',
        basePath: '/admin/files',
        icon: 'Folder',
        label: 'File Manager',
        labelAz: 'Fayl Meneceri',
        tabs: [
            { key: 'files', label: 'Fayllar', requiredAnyOf: ['system.file_manager.read'] }
        ]
    },
    {
        pageKey: 'admin.guide',
        basePath: '/admin/guide',
        icon: 'BookOpen',
        label: 'System Guide',
        labelAz: 'Sistem Bələdçisi',
        tabs: [
            { key: 'guide', label: 'Bələdçi', requiredAnyOf: ['system.system_guide.read'] }
        ]
    },
    {
        pageKey: 'admin.settings',
        basePath: '/admin/settings',
        icon: 'Settings',
        label: 'Settings',
        labelAz: 'Tənzimləmələr',
        tabs: [
            {
                key: 'general',
                label: 'Şirkət Profili',
                requiredAnyOf: ['system.settings.general.company_profile.read']
            },
            {
                key: 'notifications',
                label: 'Bildiriş Qaydaları',
                requiredAnyOf: ['system.settings.general.notification_engine.read']
            },
            {
                key: 'smtp',
                label: 'SMTP Email',
                requiredAnyOf: ['system.settings.communication.smtp_email.read']
            },
            {
                key: 'sms',
                label: 'SMS Gateway',
                requiredAnyOf: ['system.settings.communication.smtp_sms.read']
            },
            {
                key: 'security',
                label: 'Təhlükəsizlik Siyasəti',
                requiredAnyOf: ['system.settings.security.security_policy.global_policy.read']
            },
            {
                key: 'sso',
                label: 'SSO & OAuth',
                requiredAnyOf: ['system.settings.security.sso_OAuth.read']
            },
            {
                key: 'roles',
                label: 'İstifadəçi Hüquqları',
                requiredAnyOf: ['system.settings.security.user_rights.role.read']
            },
            {
                key: 'dictionaries',
                label: 'Soraqçalar',
                requiredAnyOf: ['system.settings.system_configurations.dictionary.read'],
                subTabs: [
                    { key: 'currency', label: 'Valyuta', requiredAnyOf: ['system.settings.system_configurations.dictionary.currency.read'] },
                    { key: 'tax', label: 'Vergi', requiredAnyOf: ['system.settings.system_configurations.dictionary.tax.read'] },
                    { key: 'country', label: 'Ölkə', requiredAnyOf: ['system.settings.system_configurations.dictionary.country.read'] }
                ]
            },
            {
                key: 'templates',
                label: 'Sənəd Şablonları',
                requiredAnyOf: ['system.settings.system_configurations.document_templates.read']
            },
            {
                key: 'workflow',
                label: 'Workflow',
                requiredAnyOf: ['system.settings.system_configurations.workflow.configuration.read']
            }
        ]
    },
    {
        pageKey: 'admin.console',
        basePath: '/admin/console',
        icon: 'Terminal',
        label: 'System Console',
        labelAz: 'Sistem Konsolu',
        tabs: [
            { key: 'dashboard', label: 'Dashboard', requiredAnyOf: ['system.system_console.dashboard.read'] },
            { key: 'monitoring', label: 'Monitoring', requiredAnyOf: ['system.system_console.monitoring.dashboard.read'] },
            { key: 'audit', label: 'Audit & Compliance', requiredAnyOf: ['system.system_console.audit_compliance.read'] },
            { key: 'jobs', label: 'Job Scheduler', requiredAnyOf: ['system.system_console.job_scheduler.read'] },
            { key: 'retention', label: 'Data Retention', requiredAnyOf: ['system.system_console.data_retention.read'] },
            { key: 'features', label: 'Feature Flags', requiredAnyOf: ['system.system_console.feature_flags.read'] },
            { key: 'policy', label: 'Policy Security', requiredAnyOf: ['system.system_console.policy_security.read'] },
            { key: 'feedback', label: 'Feedback', requiredAnyOf: ['system.system_console.feedback.read'] },
            { key: 'tools', label: 'Tools', requiredAnyOf: ['system.system_console.tools.read'] }
        ]
    },
    {
        pageKey: 'admin.developer',
        basePath: '/admin/developer',
        icon: 'Code',
        label: 'Developer Hub',
        labelAz: 'Developer Hub',
        tabs: [
            { key: 'api', label: 'API Reference', requiredAnyOf: ['system.developer_hub.api_reference.read'] },
            { key: 'sdks', label: 'SDKs', requiredAnyOf: ['system.developer_hub.sdk.read'] },
            { key: 'webhooks', label: 'Webhooks', requiredAnyOf: ['system.developer_hub.webhooks.read'] },
            { key: 'permissions', label: 'Permission Map', requiredAnyOf: ['system.developer_hub.permission_map.read'] }
        ]
    }
];

// =============================================================================
// TENANT PANEL REGISTRY
// =============================================================================

const TENANT_PAGES: PageConfig[] = [
    {
        pageKey: 'tenant.dashboard',
        basePath: '/dashboard',
        icon: 'LayoutDashboard',
        label: 'Dashboard',
        labelAz: 'Əsas Səhifə',
        tabs: [
            { key: 'overview', label: 'Overview', requiredAnyOf: ['tenant.dashboard.read'] }
        ]
    },
    {
        pageKey: 'tenant.sales',
        basePath: '/sales',
        icon: 'ShoppingCart',
        label: 'Sales',
        labelAz: 'Satışlar',
        tabs: [
            { key: 'orders', label: 'Sifarişlər', requiredAnyOf: ['tenant.sales.read'] }
        ]
    },
    {
        pageKey: 'tenant.warehouse',
        basePath: '/warehouse',
        icon: 'Package',
        label: 'Warehouse',
        labelAz: 'Anbar',
        tabs: [
            { key: 'inventory', label: 'İnventar', requiredAnyOf: ['tenant.warehouse.read'] }
        ]
    },
    {
        pageKey: 'tenant.settings',
        basePath: '/settings',
        icon: 'Settings',
        label: 'Settings',
        labelAz: 'Ayarlar',
        tabs: [
            { key: 'general', label: 'Ümumi', requiredAnyOf: ['tenant.settings.read'] }
        ]
    }
];

// =============================================================================
// EXPORT
// =============================================================================

export const TAB_SUBTAB_REGISTRY: TabSubTabRegistry = {
    admin: ADMIN_PAGES,
    tenant: TENANT_PAGES
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if user can access ANY tab of a page
 * EXACT base match only - NO startsWith
 */
export function canAccessPage(
    pageKey: string,
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): boolean {
    const normalized = normalizePermissions(userPermissions);
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return false;

    return page.tabs.some(tab =>
        hasExactPermission(tab.requiredAnyOf, normalized)
    );
}

/**
 * Get first allowed tab for a page
 * EXACT base match only - NO startsWith
 */
export function getFirstAllowedTab(
    pageKey: string,
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): { tab: string; subTab?: string } | null {
    const normalized = normalizePermissions(userPermissions);
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return null;

    for (const tab of page.tabs) {
        if (hasExactPermission(tab.requiredAnyOf, normalized)) {
            // Check subTabs if exist
            if (tab.subTabs && tab.subTabs.length > 0) {
                for (const subTab of tab.subTabs) {
                    if (hasExactPermission(subTab.requiredAnyOf, normalized)) {
                        return { tab: tab.key, subTab: subTab.key };
                    }
                }
                // If no subTab accessible, still return tab
                return { tab: tab.key };
            }
            return { tab: tab.key };
        }
    }

    return null;
}

/**
 * EXACT permission check helper - NO startsWith
 */
function hasExactPermission(requiredAnyOf: string[], normalizedPerms: string[]): boolean {
    return requiredAnyOf.some(required => {
        const reqBase = required.replace(/\.(read|create|update|delete|approve|export)$/, '');
        return normalizedPerms.some(perm => {
            const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
            return permBase === reqBase;
        });
    });
}

/**
 * Build landing path for a page
 */
export function buildLandingPath(
    basePath: string,
    tabInfo: { tab: string; subTab?: string } | null
): string {
    if (!tabInfo) return basePath;

    let path = `${basePath}?tab=${tabInfo.tab}`;
    if (tabInfo.subTab) {
        path += `&subTab=${tabInfo.subTab}`;
    }
    return path;
}

/**
 * Get page config by path
 */
export function getPageByPath(
    path: string,
    context: 'admin' | 'tenant' = 'admin'
): PageConfig | undefined {
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    return pages.find(p => path.startsWith(p.basePath));
}

/**
 * Get page config by pageKey
 */
export function getPageByKey(
    pageKey: string,
    context: 'admin' | 'tenant' = 'admin'
): PageConfig | undefined {
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    return pages.find(p => p.pageKey === pageKey);
}
