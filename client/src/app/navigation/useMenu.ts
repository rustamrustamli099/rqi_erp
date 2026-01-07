/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Menu Hook (SINGLE DECISION CENTER)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Uses resolveNavigationTree from navigationResolver as ONLY decision source.
 * NO backend menu fetch as decision source.
 * NO custom filtering logic.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { resolveNavigationTree, type ResolvedNavNode } from '@/app/security/navigationResolver';

/**
 * Enterprise Menu Hook - SAP Grade
 * 
 * Returns ONLY resolveNavigationTree output.
 * This is the SINGLE canonical menu source for Sidebar.
 */
export const useMenu = () => {
    const { activeTenantType, isLoading, authState, permissions } = useAuth();

    const isStable = authState === 'STABLE';
    const context: 'admin' | 'tenant' = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    const menu = useMemo((): ResolvedNavNode[] => {
        if (!isStable || permissions.length === 0) return [];

        // SAP-GRADE: Use resolveNavigationTree as SINGLE decision source
        // Map context to scope for action resolution (as done in resolver)
        const actionScope = context === 'admin' ? 'system' : 'tenant';
        return resolveNavigationTree(context, permissions, actionScope);
    }, [permissions, isStable, context]);

    const getFirstAllowedRoute = () => {
        if (menu.length === 0) {
            return '/access-denied';
        }
        return menu[0].path || '/access-denied';
    };

    return {
        menu,
        loading: isLoading,
        getFirstAllowedRoute
    };
};

// Re-export types for consumers
export type { ResolvedNavNode };
