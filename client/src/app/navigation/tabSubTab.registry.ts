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
// PERMISSION NORMALIZATION (EXACT, FROZEN)
// =============================================================================

/**
 * SAP-GRADE: NO inference, NO verb stripping.
 * Returns a deduped list of the original permissions only.
 */
export function normalizePermissions(permissions: string[]): string[] {
    return Array.from(new Set(permissions));
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
                key: 'billing_config',
                label: 'Billing Konfiqurasiyası',
                // SAP-GRADE: Parent is PERMISSIONLESS. Visibility from ANY child.
                requiredAnyOf: [],
                subTabs: [
                    { key: 'pricing', label: 'Qiymət Qaydaları', requiredAnyOf: ['system.settings.system_configurations.billing_configurations.pricing.read'] },
                    { key: 'limits', label: 'Limitlər və Kvotalar', requiredAnyOf: ['system.settings.system_configurations.billing_configurations.limits.read'] },
                    { key: 'overuse', label: 'Limit Aşıldıqda', requiredAnyOf: ['system.settings.system_configurations.billing_configurations.overuse.read'] },
                    { key: 'grace', label: 'Güzəşt Müddəti', requiredAnyOf: ['system.settings.system_configurations.billing_configurations.grace.read'] },
                    { key: 'currency', label: 'Valyuta və Vergi', requiredAnyOf: ['system.settings.system_configurations.billing_configurations.currency_tax.read'] },
                    { key: 'invoice', label: 'Faktura Qaydaları', requiredAnyOf: ['system.settings.system_configurations.billing_configurations.invoice.read'] },
                    { key: 'events', label: 'Hadisələr', requiredAnyOf: ['system.settings.system_configurations.billing_configurations.events.read'] },
                    { key: 'security', label: 'Giriş və Təhlükəsizlik', requiredAnyOf: ['system.settings.system_configurations.billing_configurations.security.read'] }
                ]
            },
            {
                key: 'dictionaries',
                label: 'Soraqçalar (Dictionaries)',
                // SAP-GRADE: Parent is PERMISSIONLESS. Visibility from ANY child.
                requiredAnyOf: [],
                subTabs: [
                    { key: 'sectors', label: 'Sektorlar', requiredAnyOf: ['system.settings.system_configurations.dictionary.sectors.read'] },
                    { key: 'units', label: 'Ölçü Vahidləri', requiredAnyOf: ['system.settings.system_configurations.dictionary.units.read'] },
                    { key: 'currencies', label: 'Valyutalar', requiredAnyOf: ['system.settings.system_configurations.dictionary.currencies.read'] },
                    { key: 'time_zones', label: 'Zaman Zonaları', requiredAnyOf: ['system.settings.system_configurations.dictionary.time_zones.read'] },
                    {
                        key: 'addresses', label: 'Ünvanlar', requiredAnyOf: [
                            'system.settings.system_configurations.dictionary.addresses.read_country',
                            'system.settings.system_configurations.dictionary.addresses.read_city',
                            'system.settings.system_configurations.dictionary.addresses.read_district'
                        ]
                    }
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
                // SAP-GRADE: Parent is PERMISSIONLESS. Visibility from ANY child.
                requiredAnyOf: [],
                subTabs: [
                    { key: 'config', label: 'Konfiqurasiya', requiredAnyOf: ['system.settings.system_configurations.workflow.configuration.read'] },
                    { key: 'monitor', label: 'Nəzarət', requiredAnyOf: ['system.settings.system_configurations.workflow.configuration.read'] }
                ]
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
            {
                key: 'monitoring',
                label: 'Monitoring',
                // SAP-GRADE: Parent is PERMISSIONLESS. Visibility from ANY child.
                requiredAnyOf: [],
                subTabs: [
                    { key: 'dashboard', label: 'Dashboard', requiredAnyOf: ['system.system_console.monitoring.dashboard.read'] },
                    { key: 'alerts', label: 'Alert Rules', requiredAnyOf: ['system.system_console.monitoring.alert_rules.read'] },
                    { key: 'anomalies', label: 'Anomalies', requiredAnyOf: ['system.system_console.monitoring.anomaly_detection.read'] },
                    { key: 'logs', label: 'System Logs', requiredAnyOf: ['system.system_console.monitoring.system_logs.read'] }
                ]
            },
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
 * SAP LAW: Tab visible if self.allowed OR ANY(subTab.allowed)
 */
export function canAccessPage(
    pageKey: string,
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): boolean {
    const permSet = new Set(userPermissions);
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return false;

    // SAP LAW: Page accessible if ANY tab is visible
    return page.tabs.some(tab => isTabAllowed(tab, permSet));
}

/**
 * SAP LAW: Tab allowed if self.allowed OR ANY(subTab.allowed)
 * ORDER-INDEPENDENT - checks ALL children
 */
function isTabAllowed(tab: TabConfig, permSet: Set<string>): boolean {
    // Self allowed?
    const selfAllowed = tab.requiredAnyOf.length > 0 &&
        tab.requiredAnyOf.some(req => permSet.has(req));

    if (selfAllowed) return true;

    // Any subTab allowed? (SAP: order-independent)
    if (tab.subTabs && tab.subTabs.length > 0) {
        return tab.subTabs.some(subTab =>
            subTab.requiredAnyOf.some(req => permSet.has(req))
        );
    }

    // Tab with empty requiredAnyOf and no subTabs = always visible (permissionless leaf)
    if (tab.requiredAnyOf.length === 0 && (!tab.subTabs || tab.subTabs.length === 0)) {
        return true;
    }

    return false;
}

/**
 * Get first allowed tab for a page
 * SAP LAW: Tab allowed if self.allowed OR ANY(subTab.allowed)
 */
export function getFirstAllowedTab(
    pageKey: string,
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): { tab: string; subTab?: string } | null {
    const permSet = new Set(userPermissions);
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return null;

    for (const tab of page.tabs) {
        // SAP: Check if tab is allowed (self OR any subTab)
        if (isTabAllowed(tab, permSet)) {
            // Find first allowed subTab if exists
            if (tab.subTabs && tab.subTabs.length > 0) {
                for (const subTab of tab.subTabs) {
                    const hasSubTabAccess = subTab.requiredAnyOf.some(req => permSet.has(req));
                    if (hasSubTabAccess) {
                        return { tab: tab.key, subTab: subTab.key };
                    }
                }
                // Tab visible via subTab but couldn't find specific one - shouldn't happen
            }
            // Tab has self permission (no subTabs or has direct access)
            const selfAllowed = tab.requiredAnyOf.length > 0 &&
                tab.requiredAnyOf.some(req => permSet.has(req));
            if (selfAllowed || (tab.requiredAnyOf.length === 0 && (!tab.subTabs || tab.subTabs.length === 0))) {
                return { tab: tab.key };
            }
        }
    }

    return null;
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
 * SAP-GRADE: EXACT basePath match only - NO startsWith prefix matching
 */
export function getPageByPath(
    path: string,
    context: 'admin' | 'tenant' = 'admin'
): PageConfig | undefined {
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    // Normalize: strip query params and trailing slashes
    const normalizedPath = path.split('?')[0].replace(/\/+$/, '');
    return pages.find(p => p.basePath === normalizedPath);
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

/**
 * Get Settings tabs formatted for SettingsPage UI
 * Returns tabs grouped by category for left sidebar
 */
export function getSettingsTabsForUI(): Array<{
    groupLabel: string;
    items: Array<{
        id: string;
        label: string;
        permission: string;
        subItems?: Array<{
            id: string;
            label: string;
            permission: string;
        }>;
    }>;
}> {
    const settingsPage = ADMIN_PAGES.find(p => p.pageKey === 'admin.settings');
    if (!settingsPage) return [];

    // Group tabs by category - original SETTINGS_REGISTRY titles
    const groups = [
        {
            groupLabel: 'Ümumi Tənzimləmələr',
            items: settingsPage.tabs.filter(t =>
                ['general', 'notifications'].includes(t.key)
            )
        },
        {
            groupLabel: 'Kommunikasiya',
            items: settingsPage.tabs.filter(t =>
                ['smtp', 'sms'].includes(t.key)
            )
        },
        {
            groupLabel: 'Təhlükəsizlik & Giriş',
            items: settingsPage.tabs.filter(t =>
                ['security', 'sso', 'roles'].includes(t.key)
            )
        },
        {
            groupLabel: 'Sistem Konfiqurasiyası',
            items: settingsPage.tabs.filter(t =>
                ['billing_config', 'dictionaries', 'templates', 'workflow'].includes(t.key)
            )
        }
    ];

    return groups.map(g => ({
        groupLabel: g.groupLabel,
        items: g.items.map(tab => ({
            id: tab.key,
            label: tab.label,
            permission: tab.requiredAnyOf[0],
            subItems: tab.subTabs?.map(st => ({
                id: st.key,
                label: st.label,
                permission: st.requiredAnyOf[0]
            }))
        }))
    }));
}
