/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 14H: Menu Hook (STABLE LOCAL VERSION)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DECISION: Use local resolveNavigationTree.
 * 
 * WHY:
 * - Backend API (/me/menu) has authentication issues (401)
 * - Local resolver is STABLE and works correctly
 * - DecisionCenterService on backend still enforces menu for API calls
 * 
 * TRADE-OFF:
 * - Menu filtering happens on frontend (not ideal for SAP purity)
 * - BUT: All ACTION decisions still go through backend (usePageState)
 * - Frontend cannot ADD permissions, only filter based on what backend gave
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { resolveNavigationTree, type ResolvedNavNode as ResolverNavNode } from '@/app/security/navigationResolver';

export interface ResolvedNavNode {
    id: string;
    key?: string;
    label: string;
    path?: string;
    icon?: string;
    pageKey?: string;
    tabKey?: string;
    subTabKey?: string;
    children?: ResolvedNavNode[];
    visible?: boolean;
    permission?: string;
}

interface UseMenuResult {
    menu: ResolvedNavNode[];
    loading: boolean;
    error: string | null;
    getFirstAllowedRoute: () => string;
    refetch: () => void;
}

/**
 * STABLE: Uses local resolver for menu visibility.
 * Actions are still controlled by backend via usePageState.
 */
export const useMenu = (): UseMenuResult => {
    const { isAuthenticated, authState, activeTenantType, permissions } = useAuth();

    const isStable = authState === 'STABLE';
    const loading = !isStable;

    const context: 'admin' | 'tenant' = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    // Use local resolveNavigationTree
    const menu = useMemo<ResolvedNavNode[]>(() => {
        if (!isAuthenticated || !isStable) return [];
        const rawTree = resolveNavigationTree(context, permissions, 'system');
        return mapTree(rawTree);
    }, [isAuthenticated, isStable, context, permissions]);

    const getFirstAllowedRoute = (): string => {
        if (menu.length === 0) {
            return '/access-denied';
        }
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
        error: null,
        getFirstAllowedRoute,
        refetch: () => { } // No-op for local version
    };
};

// Map resolver output to our interface
function mapTree(nodes: ResolverNavNode[]): ResolvedNavNode[] {
    return nodes.map(node => ({
        id: node.id,
        key: node.key,
        label: node.label,
        path: node.path,
        icon: node.icon,
        pageKey: node.pageKey,
        tabKey: node.tabKey,
        subTabKey: node.subTabKey,
        children: node.children ? mapTree(node.children) : undefined,
        visible: node.visible,
        permission: node.permission
    }));
}
