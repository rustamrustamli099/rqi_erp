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

import { useCallback } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import {
    getFirstAllowedTab,
    canAccessPage,
    TAB_SUBTAB_REGISTRY,
    normalizePermissions
} from '@/app/navigation/tabSubTab.registry';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading, activeTenantType } = useAuth();
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    /**
     * SAP-GRADE: Check if user has EXACT permission
     * NO prefix matching, NO child implies parent
     */
    const can = useCallback((requiredPermission: string): boolean => {
        if (!requiredPermission) return false;

        const normalized = normalizePermissions(permissions);
        const reqBase = requiredPermission.replace(/\.(read|create|update|delete|view|access|manage|approve|export)$/, '');

        return normalized.some(userPerm => {
            const userBase = userPerm.replace(/\.(read|create|update|delete|view|access|manage|approve|export)$/, '');
            // EXACT base match ONLY
            return userBase === reqBase;
        });
    }, [permissions]);

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

        const normalized = normalizePermissions(permissions);

        if (!tabKey) {
            // Check if user can access ANY tab of the page
            return canAccessPage(pageKey, permissions, context);
        }

        const tab = page.tabs.find(t => t.key === tabKey);
        if (!tab) return false;

        // Check tab permission
        const hasTabAccess = tab.requiredAnyOf.some(req => {
            const reqBase = req.replace(/\.(read|create|update|delete|approve|export)$/, '');
            return normalized.some(perm => {
                const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
                return permBase === reqBase;
            });
        });

        if (!hasTabAccess) return false;

        if (subTabKey && tab.subTabs) {
            const subTab = tab.subTabs.find(st => st.key === subTabKey);
            if (!subTab) return false;

            return subTab.requiredAnyOf.some(req => {
                const reqBase = req.replace(/\.(read|create|update|delete|approve|export)$/, '');
                return normalized.some(perm => {
                    const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
                    return permBase === reqBase;
                });
            });
        }

        return true;
    }, [permissions, context]);

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
