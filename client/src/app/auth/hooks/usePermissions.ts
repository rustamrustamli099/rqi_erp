/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Permission Hook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES:
 * 1. EXACT base match ONLY - NO prefix/startsWith
 * 2. NO child implies parent
 * 3. Uses TAB_SUBTAB_REGISTRY for tab checks
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import {
    getFirstAllowedTab,
    canAccessPage,
    TAB_SUBTAB_REGISTRY,
} from '@/app/navigation/tabSubTab.registry';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading, activeTenantType } = useAuth();
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    const permSet = useMemo(() => new Set(permissions), [permissions]);

    /**
     * SAP-GRADE: Check if user has EXACT permission
     * NO prefix matching, NO child implies parent
     */
    const can = useCallback((requiredPermission: string): boolean => {
        if (!requiredPermission) return false;

        return permSet.has(requiredPermission);
    }, [permSet]);

    /**
     * SAP-GRADE: Check if user can access ANY of the permissions
     */
    const canAny = useCallback((slugs: string[]): boolean => {
        if (!slugs || slugs.length === 0) return true;
        return slugs.some(slug => can(slug));
    }, [can]);

    /**
     * SAP-GRADE: Check if user can access ALL of the permissions
     */
    const canAll = useCallback((slugs: string[]): boolean => {
        if (!slugs || slugs.length === 0) return true;
        return slugs.every(slug => can(slug));
    }, [can]);

    /**
     * SAP-GRADE: Check if user can access a specific tab/subTab
     * Uses frozen TAB_SUBTAB_REGISTRY
     */
    const canForTab = useCallback((
        pageKey: string,
        tabKey?: string,
        subTabKey?: string
    ): boolean => {
        const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
        const page = pages.find(p => p.pageKey === pageKey);
        if (!page) return false;

        if (!tabKey) {
            // Check if user can access ANY tab of the page
            return canAccessPage(pageKey, permissions, context);
        }

        const tab = page.tabs.find(t => t.key === tabKey);
        if (!tab) return false;

        const hasTabAccess = tab.requiredAnyOf.some(req => permSet.has(req));

        const allowedSubTabs = tab.subTabs?.filter(st => st.requiredAnyOf.some(req => permSet.has(req))) ?? [];

        if (subTabKey) {
            return allowedSubTabs.some(st => st.key === subTabKey);
        }

        return hasTabAccess || allowedSubTabs.length > 0;
    }, [permissions, context, permSet, can]);

    /**
     * SAP-GRADE: Get first allowed tab for a page
     */
    const getFirstAllowedTabForPage = useCallback((pageKey: string) => {
        return getFirstAllowedTab(pageKey, permissions, context);
    }, [permissions, context]);

    // Legacy aliases for backward compatibility
    const hasPermission = can;
    const hasAll = canAll;
    const hasAny = canAny;

    return {
        can,
        canAny,
        canAll,
        canForTab,
        getFirstAllowedTabForPage,
        // Legacy aliases
        hasPermission,
        hasAll,
        hasAny,
        permissions,
        user,
        isImpersonating,
        isLoading
    };
};
