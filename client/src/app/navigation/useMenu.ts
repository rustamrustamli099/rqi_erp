/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 14H: Menu Hook — BACKEND ONLY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP PFCG COMPLIANT: This hook fetches menu from BACKEND ONLY.
 * 
 * RULES:
 * - NO local resolveNavigationTree
 * - NO frontend permission filtering
 * - NO permissions.includes()
 * - Frontend is a DUMB RENDERER
 * 
 * If backend fails → FAIL CLOSED (no fallback)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';

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
    actions?: any;
}

interface UseMenuResult {
    menu: ResolvedNavNode[];
    loading: boolean;
    error: string | null;
    getFirstAllowedRoute: () => string;
    refetch: () => void;
}

/**
 * SAP PFCG COMPLIANT: Backend-driven menu hook.
 * 
 * Fetches resolved menu from /api/v1/me/menu
 * Backend applies ALL permission logic via DecisionCenterService.
 * Frontend ONLY renders what backend returns.
 */
export const useMenu = (): UseMenuResult => {
    const { isAuthenticated, authState, activeTenantType } = useAuth();
    const [menu, setMenu] = useState<ResolvedNavNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Prevent infinite loops and duplicate fetches
    const fetchedRef = useRef(false);
    const lastContextRef = useRef<string | null>(null);

    const isStable = authState === 'STABLE';
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    const fetchMenu = useCallback(async (force = false) => {
        // Skip if not ready
        if (!isAuthenticated || !isStable) {
            setLoading(authState === 'BOOTSTRAPPING');
            return;
        }

        // Skip if already fetched for this context (unless forced)
        if (!force && fetchedRef.current && lastContextRef.current === context) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('accessToken');

            // Skip fetch if no token
            if (!token) {
                console.warn('[useMenu] No access token, skipping fetch');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/v1/me/menu?context=${context}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // FAIL CLOSED: No fallback to local resolver
                throw new Error(`Menu fetch failed: ${response.status}`);
            }

            const result = await response.json();
            // Handle NestJS response wrapper: { statusCode, data: { menu: [...] } }
            const menuData = result.data?.menu || result.menu || [];

            console.log('[useMenu] Menu loaded:', menuData.length, 'items');
            setMenu(menuData);

            // Mark as fetched for this context
            fetchedRef.current = true;
            lastContextRef.current = context;

        } catch (err) {
            console.error('[useMenu] Backend fetch failed:', err);
            setError(err instanceof Error ? err.message : 'Menu yüklənmədi');
            // FAIL CLOSED: Empty menu, no local fallback
            setMenu([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isStable, authState, context]);

    // Fetch once when stable
    useEffect(() => {
        if (isAuthenticated && isStable) {
            fetchMenu();
        }
    }, [isAuthenticated, isStable, context]); // eslint-disable-line react-hooks/exhaustive-deps

    const getFirstAllowedRoute = (): string => {
        if (menu.length === 0) {
            return '/access-denied';
        }
        // Find first path in tree (backend already ordered by priority)
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
        error,
        getFirstAllowedRoute,
        refetch: () => fetchMenu(true)
    };
};
