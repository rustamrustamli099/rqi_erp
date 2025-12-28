/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SETTINGS TAB/SUBTAB REGISTRY (FROZEN)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Single Source of Truth for Settings page navigation.
 * Used by: Menu Visibility Engine, Route Guard, Permission Preview Engine
 * 
 * Pattern: /admin/settings?tab=dictionaries&subTab=currency
 */

export interface TabConfig {
    id: string;
    label: string;
    permission: string;  // Required permission to access this tab
    subTabs?: SubTabConfig[];
    defaultSubTab?: string;
}

export interface SubTabConfig {
    id: string;
    label: string;
    permission: string;  // Required permission to access this subTab
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS TABS REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export const SETTINGS_TABS: TabConfig[] = [
    {
        id: 'general',
        label: 'Ümumi',
        permission: 'platform.settings.general.read',
        subTabs: [
            { id: 'system', label: 'Sistem', permission: 'platform.settings.general.system.read' },
            { id: 'branding', label: 'Brendinq', permission: 'platform.settings.general.branding.read' },
            { id: 'localization', label: 'Lokallaşdırma', permission: 'platform.settings.general.localization.read' }
        ],
        defaultSubTab: 'system'
    },
    {
        id: 'security',
        label: 'Təhlükəsizlik',
        permission: 'platform.settings.security.read',
        subTabs: [
            { id: 'password-policy', label: 'Şifrə Qaydası', permission: 'platform.settings.security.password.read' },
            { id: 'session', label: 'Sessiya', permission: 'platform.settings.security.session.read' },
            { id: 'mfa', label: '2FA', permission: 'platform.settings.security.mfa.read' },
            { id: 'ip-whitelist', label: 'IP Ağ Siyahı', permission: 'platform.settings.security.ip.read' }
        ],
        defaultSubTab: 'password-policy'
    },
    {
        id: 'dictionaries',
        label: 'Lüğətlər',
        permission: 'platform.settings.dictionaries.read',
        subTabs: [
            { id: 'currency', label: 'Valyuta', permission: 'platform.settings.dictionaries.currency.read' },
            { id: 'country', label: 'Ölkələr', permission: 'platform.settings.dictionaries.country.read' },
            { id: 'language', label: 'Dillər', permission: 'platform.settings.dictionaries.language.read' },
            { id: 'timezone', label: 'Vaxt Zonası', permission: 'platform.settings.dictionaries.timezone.read' },
            { id: 'industry', label: 'Sektorlar', permission: 'platform.settings.dictionaries.industry.read' }
        ],
        defaultSubTab: 'currency'
    },
    {
        id: 'integrations',
        label: 'İnteqrasiyalar',
        permission: 'platform.settings.integrations.read',
        subTabs: [
            { id: 'payment', label: 'Ödəniş', permission: 'platform.settings.integrations.payment.read' },
            { id: 'email', label: 'Email', permission: 'platform.settings.integrations.email.read' },
            { id: 'sms', label: 'SMS', permission: 'platform.settings.integrations.sms.read' },
            { id: 'api-keys', label: 'API Açarları', permission: 'platform.settings.integrations.api.read' }
        ],
        defaultSubTab: 'payment'
    },
    {
        id: 'audit',
        label: 'Audit',
        permission: 'platform.settings.audit.read'
    },
    {
        id: 'compliance',
        label: 'Uyğunluq',
        permission: 'platform.settings.compliance.read',
        subTabs: [
            { id: 'soc2', label: 'SOC 2', permission: 'platform.settings.compliance.soc2.read' },
            { id: 'iso27001', label: 'ISO 27001', permission: 'platform.settings.compliance.iso.read' }
        ],
        defaultSubTab: 'soc2'
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get first allowed tab for Settings page
 */
export function getFirstAllowedSettingsTab(userPermissions: string[]): string | null {
    for (const tab of SETTINGS_TABS) {
        if (hasPermission(userPermissions, tab.permission)) {
            return tab.id;
        }
        // Check subTabs
        if (tab.subTabs) {
            for (const subTab of tab.subTabs) {
                if (hasPermission(userPermissions, subTab.permission)) {
                    return tab.id;
                }
            }
        }
    }
    return null;
}

/**
 * Get first allowed subTab for a given tab
 */
export function getFirstAllowedSubTab(tabId: string, userPermissions: string[]): string | null {
    const tab = SETTINGS_TABS.find(t => t.id === tabId);
    if (!tab?.subTabs) return null;

    for (const subTab of tab.subTabs) {
        if (hasPermission(userPermissions, subTab.permission)) {
            return subTab.id;
        }
    }
    return null;
}

/**
 * Check if user can access a specific tab
 */
export function canAccessSettingsTab(tabId: string, userPermissions: string[]): boolean {
    const tab = SETTINGS_TABS.find(t => t.id === tabId);
    if (!tab) return false;

    // Direct tab permission
    if (hasPermission(userPermissions, tab.permission)) return true;

    // Any subTab permission grants parent access
    if (tab.subTabs) {
        return tab.subTabs.some(st => hasPermission(userPermissions, st.permission));
    }

    return false;
}

/**
 * Check if user can access a specific subTab
 */
export function canAccessSettingsSubTab(
    tabId: string,
    subTabId: string,
    userPermissions: string[]
): boolean {
    const tab = SETTINGS_TABS.find(t => t.id === tabId);
    if (!tab?.subTabs) return false;

    const subTab = tab.subTabs.find(st => st.id === subTabId);
    if (!subTab) return false;

    return hasPermission(userPermissions, subTab.permission);
}

/**
 * Build Settings URL with first allowed tab/subTab
 */
export function buildSettingsUrl(userPermissions: string[]): string {
    const tabId = getFirstAllowedSettingsTab(userPermissions);
    if (!tabId) return '/admin/settings';

    let url = `/admin/settings?tab=${tabId}`;

    const subTabId = getFirstAllowedSubTab(tabId, userPermissions);
    if (subTabId) {
        url += `&subTab=${subTabId}`;
    }

    return url;
}

/**
 * Get all Settings permissions (for seeding)
 */
export function getAllSettingsPermissions(): string[] {
    const permissions: string[] = [];

    for (const tab of SETTINGS_TABS) {
        permissions.push(tab.permission);
        permissions.push(tab.permission.replace('.read', '.update'));

        if (tab.subTabs) {
            for (const subTab of tab.subTabs) {
                permissions.push(subTab.permission);
                permissions.push(subTab.permission.replace('.read', '.update'));
            }
        }
    }

    return permissions;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function hasPermission(userPermissions: string[], required: string): boolean {
    // Exact match
    if (userPermissions.includes(required)) return true;

    // Prefix match (e.g., platform.settings.* covers platform.settings.general.read)
    const basePermission = required.replace(/\.(read|update|create|delete)$/, '');
    return userPermissions.some(p => {
        if (p.endsWith('.*')) {
            const prefix = p.slice(0, -2);
            return basePermission.startsWith(prefix);
        }
        return p === required || p.startsWith(basePermission);
    });
}
