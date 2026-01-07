import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';

/**
 * PHASE 14H: usePageState Hook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-GRADE page state hook.
 * 
 * RULES:
 * - ONLY source of action visibility for UI
 * - NO session fallback
 * - NO navigation fallback
 * - NO permission logic
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Dynamic actions map - backend returns GS_* semantic keys
 * Each key is a boolean indicating whether the action is allowed
 */
export type ActionsMap = Record<string, boolean>;

export interface PageState {
    authorized: boolean;
    pageKey: string;
    sections: Record<string, boolean>;
    actions: ActionsMap;
}


interface UsePageStateOptions {
    enabled?: boolean;
}

/**
 * Fetch page state from Decision Center
 * 
 * @param pageKey - Page authorization object key (e.g., 'Z_USERS')
 * @returns PageState with authorized flag, sections, and actions
 */
export function usePageState(pageKey: string, options?: UsePageStateOptions) {
    const query = useQuery({
        queryKey: ['pageState', pageKey],
        queryFn: async (): Promise<PageState> => {
            console.log('[usePageState] Fetching page-state for:', pageKey);
            const response = await api.get(`/decision/page-state/${pageKey}`);
            // API returns { statusCode, data: {...}, timestamp } - extract nested data
            const pageState = response.data?.data ?? response.data;
            console.log('[usePageState] Extracted pageState:', pageState);
            return pageState;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes (aligned with backend cache TTL)
        gcTime: 10 * 60 * 1000,
        enabled: options?.enabled ?? true,
        retry: false, // Don't retry authorization failures
    });

    return {
        pageState: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        // Convenience accessors
        actions: query.data?.actions ?? ({} as ActionsMap),
        sections: query.data?.sections ?? {},
        authorized: query.data?.authorized ?? false,
    };
}

/**
 * Check if a specific action is allowed
 * 
 * @param actions - Actions map from pageState
 * @param actionKey - Canonical action key from ACTION_KEYS
 * @returns true if action is allowed, false otherwise
 */
export function isActionAllowed(actions: ActionsMap, actionKey: string): boolean {
    return actions[actionKey as keyof ActionsMap] === true;
}
