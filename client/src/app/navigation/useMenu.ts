/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 14H.5: Menu Hook (TEMPORARY FALLBACK)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * TEMPORARY: Uses resolveNavigationTree until backend /me/menu is ready.
 * 
 * TODO (Phase 15): Convert to backend API fetch when endpoint is stable.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { resolveNavigationTree, type ResolvedNavNode } from '@/app/security/navigationResolver';

export type { ResolvedNavNode };

interface UseMenuResult {
    menu: ResolvedNavNode[];
    loading: boolean;
    getFirstAllowedRoute: () => string;
}

/**
 * TEMPORARY: Uses frontend resolver until backend is ready.
 */
export const useMenu = (): UseMenuResult => {
    const { isAuthenticated, authState, activeTenantType, permissions } = useAuth();

    const isStable = authState === 'STABLE';
    const loading = !isStable || authState === 'BOOTSTRAPPING';

    const context: 'admin' | 'tenant' = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    // TEMPORARY: Use resolveNavigationTree
    const menu = useMemo(() => {
        if (!isAuthenticated || !isStable) return [];
        return resolveNavigationTree(context, permissions, 'system');
    }, [isAuthenticated, isStable, context, permissions]);

    const getFirstAllowedRoute = (): string => {
        if (menu.length === 0) {
            return '/access-denied';
        }
        // Find first menu item with a path
        const findFirstPath = (nodes: ResolvedNavNode[]): string | null => {
            for (const node of nodes) {
                if (node.path) return node.path;
                if (node.children?.length) {
                    const childPath = findFirstPath(node.children);
                    if (childPath) return childPath;
                }
            }
            return null;
        };
        return findFirstPath(menu) || '/access-denied';
    };

    return {
        menu,
        loading,
        getFirstAllowedRoute
    };
};
