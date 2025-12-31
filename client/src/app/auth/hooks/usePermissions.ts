/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Permission Hook — EXACT MATCH ONLY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES:
 * 1. EXACT permission match via includes() — NO verb stripping
 * 2. ALL decisions delegate to navigationResolver
 * 3. NO legacy registry helpers (canAccessPage/getFirstAllowedTab)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useCallback } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import {
    hasAnyVisibleTab,
    getAllowedTabs,
    getAllowedSubTabs,
    getFirstAllowedTarget
} from '@/app/security/navigationResolver';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading, activeTenantType } = useAuth();
    const context: 'admin' | 'tenant' = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

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
     * SAP-GRADE: Check if user can access a specific page/tab/subTab
     * DELEGATES TO navigationResolver ONLY
     */
    const canForTab = useCallback((
        pageKey: string,
        tabKey?: string,
        subTabKey?: string
    ): boolean => {
        // No tabKey: check if user can access ANY tab of the page
        if (!tabKey) {
            return hasAnyVisibleTab(pageKey, permissions, context);
        }

        // Check if tab is allowed via resolver
        const allowedTabs = getAllowedTabs(pageKey, permissions, context);
        const hasTabAccess = allowedTabs.some(t => t.key === tabKey);

        if (!hasTabAccess) return false;

        // Check subTab if provided
        if (subTabKey) {
            const allowedSubTabs = getAllowedSubTabs(pageKey, tabKey, permissions, context);
            return allowedSubTabs.some(st => st.key === subTabKey);
        }

        return true;
    }, [permissions, context]);

    /**
     * SAP-GRADE: Get first allowed target for a page (default routing ONLY)
     * Returns full path with tab/subTab params
     */
    const getFirstAllowedTabForPage = useCallback((pageKey: string): string | null => {
        return getFirstAllowedTarget(pageKey, permissions, context);
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
