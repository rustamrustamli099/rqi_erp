/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Permission Hook — EXACT MATCH ONLY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES:
 * 1. EXACT permission match via includes() — NO verb stripping
 * 2. NO regex base-matching
 * 3. Uses TAB_SUBTAB_REGISTRY for tab checks via resolver
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useCallback } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import {
    getFirstAllowedTab,
    canAccessPage,
    TAB_SUBTAB_REGISTRY
} from '@/app/navigation/tabSubTab.registry';
import {
    getAllowedTabs,
    getAllowedSubTabs
} from '@/app/security/navigationResolver';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading, activeTenantType } = useAuth();
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    /**
     * SAP-GRADE: Check if user has EXACT permission
     * NO verb stripping, NO base matching, NO regex
     */
    const can = useCallback((requiredPermission: string): boolean => {
        if (!requiredPermission) return false;
        // EXACT MATCH ONLY
        return permissions.includes(requiredPermission);
    }, [permissions]);

    /**
     * SAP-GRADE: Check if user can access ANY of the permissions
     */
    const canAny = useCallback((slugs: string[]): boolean => {
        if (!slugs || slugs.length === 0) return true;
        return slugs.some(slug => permissions.includes(slug));
    }, [permissions]);

    /**
     * SAP-GRADE: Check if user can access ALL of the permissions
     */
    const canAll = useCallback((slugs: string[]): boolean => {
        if (!slugs || slugs.length === 0) return true;
        return slugs.every(slug => permissions.includes(slug));
    }, [permissions]);

    /**
     * SAP-GRADE: Check if user can access a specific tab/subTab
     * Uses frozen TAB_SUBTAB_REGISTRY via resolver
     */
    const canForTab = useCallback((
        pageKey: string,
        tabKey?: string,
        subTabKey?: string
    ): boolean => {
        if (!tabKey) {
            // Check if user can access ANY tab of the page
            return canAccessPage(pageKey, permissions, context);
        }

        // Use resolver for tab/subTab checks
        const allowedTabs = getAllowedTabs(pageKey, permissions, context);
        const hasTabAccess = allowedTabs.some(t => t.key === tabKey);

        if (!hasTabAccess) return false;

        if (subTabKey) {
            const allowedSubTabs = getAllowedSubTabs(pageKey, tabKey, permissions, context);
            return allowedSubTabs.some(st => st.key === subTabKey);
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
