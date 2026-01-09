/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 14H.5: Backend Menu Hook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This hook fetches menu from BACKEND ONLY.
 * NO frontend permission filtering.
 * NO resolveNavigationTree.
 * 
 * Backend returns pre-resolved navigation tree.
 * Frontend only renders what it receives.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';

export interface BackendMenuItem {
    id: string;
    label: string;
    path: string;
    icon?: string;
    children?: BackendMenuItem[];
}

interface UseBackendMenuResult {
    menu: BackendMenuItem[];
    loading: boolean;
    error: string | null;
    getFirstAllowedRoute: () => string;
}

/**
 * PHASE 14H.5: Backend-driven menu
 * 
 * Fetches resolved menu from /api/v1/me/menu
 * Backend applies ALL permission logic.
 * Frontend is a DUMB RENDERER.
 */
export function useBackendMenu(): UseBackendMenuResult {
    const { isAuthenticated, authState, activeTenantType } = useAuth();
    const [menu, setMenu] = useState<BackendMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || authState !== 'STABLE') {
            setLoading(authState === 'BOOTSTRAPPING');
            return;
        }

        const fetchMenu = async () => {
            try {
                setLoading(true);
                setError(null);

                const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

                const response = await fetch(`/api/v1/me/menu?context=${context}`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error(`Menu fetch failed: ${response.status}`);
                }

                const data = await response.json();
                setMenu(data.menu || []);
            } catch (err) {
                console.error('[useBackendMenu] Error:', err);
                setError(err instanceof Error ? err.message : 'Menu yüklənmədi');
                setMenu([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [isAuthenticated, authState, activeTenantType]);

    const getFirstAllowedRoute = (): string => {
        if (menu.length === 0) {
            return '/access-denied';
        }
        return menu[0].path || '/access-denied';
    };

    return {
        menu,
        loading,
        error,
        getFirstAllowedRoute
    };
}

export type { UseBackendMenuResult };
