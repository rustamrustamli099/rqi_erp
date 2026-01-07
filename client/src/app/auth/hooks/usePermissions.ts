/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Permission Hook — EXACT MATCH ONLY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ⚠️ PHASE 14H DEPRECATION WARNING ⚠️
 * This hook is DEPRECATED for UI authorization decisions.
 * Use usePageState() instead to get backend-resolved actions.
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

// PHASE 14H: Deprecation warning helper
const warnDeprecated = (fnName: string) => {
    if (import.meta.env?.DEV) {
        console.warn(
            `[PHASE 14H DEPRECATION] ${fnName}() is BANNED in domain UI components. ` +
            `Use usePageState() hook instead. See GEMINI.md FRONTEND CONSTITUTION.`
        );
    }
};

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading, activeTenantType } = useAuth();
    const context: 'admin' | 'tenant' = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    /**
     * SAP-GRADE: Check if user has EXACT permission
     * ⚠️ DEPRECATED: Use usePageState() actions instead
     */
    const can = useCallback((requiredPermission: string): boolean => {
        warnDeprecated('can');
        if (!requiredPermission) return false;
        // EXACT MATCH ONLY
        return permissions.includes(requiredPermission);
    }, [permissions]);

    /**
     * SAP-GRADE: Check if user can access ANY of the permissions
     * ⚠️ DEPRECATED: Use usePageState() actions instead
     */
    const canAny = useCallback((slugs: string[]): boolean => {
        warnDeprecated('canAny');
        if (!slugs || slugs.length === 0) return true;
        return slugs.some(slug => permissions.includes(slug));
    }, [permissions]);

    /**
     * SAP-GRADE: Check if user can access ALL of the permissions
     * ⚠️ DEPRECATED: Use usePageState() actions instead
     */
    const canAll = useCallback((slugs: string[]): boolean => {
        warnDeprecated('canAll');
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
