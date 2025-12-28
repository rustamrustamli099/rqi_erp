/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH STATE MACHINE - Deterministic Auth Flow
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-Grade Auth FSM preventing:
 * - Login page flash on refresh
 * - Random AccessDenied redirects
 * - Race conditions in permission loading
 */

export type AuthState =
    | 'INIT'           // Unknown state, just loaded
    | 'HYDRATING'      // Loading token + /me
    | 'AUTHENTICATED'  // User loaded, permissions ready
    | 'UNAUTHORIZED'   // No valid token
    | 'AUTHZ_DENIED';  // Authenticated but no allowed routes

export type AuthEvent =
    | { type: 'START_HYDRATION' }
    | { type: 'HYDRATION_SUCCESS'; user: any; permissions: string[] }
    | { type: 'HYDRATION_FAILURE' }
    | { type: 'NO_ALLOWED_ROUTES' }
    | { type: 'LOGOUT' }
    | { type: 'TOKEN_EXPIRED' };

export interface AuthContext {
    state: AuthState;
    user: any | null;
    permissions: string[];
    error: string | null;
    isHydrating: boolean;
    isAuthenticated: boolean;
    hasPermissions: boolean;
}

/**
 * Auth State Machine Transitions
 */
export function authReducer(context: AuthContext, event: AuthEvent): AuthContext {
    switch (event.type) {
        case 'START_HYDRATION':
            return {
                ...context,
                state: 'HYDRATING',
                isHydrating: true,
                error: null
            };

        case 'HYDRATION_SUCCESS':
            return {
                ...context,
                state: 'AUTHENTICATED',
                user: event.user,
                permissions: event.permissions,
                isHydrating: false,
                isAuthenticated: true,
                hasPermissions: event.permissions.length > 0,
                error: null
            };

        case 'HYDRATION_FAILURE':
            return {
                ...context,
                state: 'UNAUTHORIZED',
                user: null,
                permissions: [],
                isHydrating: false,
                isAuthenticated: false,
                hasPermissions: false,
                error: null
            };

        case 'NO_ALLOWED_ROUTES':
            return {
                ...context,
                state: 'AUTHZ_DENIED',
                error: 'No allowed routes in this panel'
            };

        case 'LOGOUT':
        case 'TOKEN_EXPIRED':
            return {
                state: 'UNAUTHORIZED',
                user: null,
                permissions: [],
                error: null,
                isHydrating: false,
                isAuthenticated: false,
                hasPermissions: false
            };

        default:
            return context;
    }
}

/**
 * Initial auth context
 */
export const initialAuthContext: AuthContext = {
    state: 'INIT',
    user: null,
    permissions: [],
    error: null,
    isHydrating: false,
    isAuthenticated: false,
    hasPermissions: false
};

/**
 * Check if we can compute routes/menus
 */
export function canComputeRoutes(context: AuthContext): boolean {
    // Only compute routes after AUTHENTICATED state is stable
    return context.state === 'AUTHENTICATED' && !context.isHydrating;
}

/**
 * Check if should show loading skeleton
 */
export function shouldShowSkeleton(context: AuthContext): boolean {
    return context.state === 'INIT' || context.state === 'HYDRATING';
}

/**
 * Check if should redirect to login
 */
export function shouldRedirectToLogin(context: AuthContext): boolean {
    return context.state === 'UNAUTHORIZED';
}

/**
 * Check if should show access denied terminal page
 */
export function shouldShowAccessDenied(context: AuthContext): boolean {
    return context.state === 'AUTHZ_DENIED';
}

/**
 * FSM State Diagram (Text-based)
 * 
 * ┌──────┐
 * │ INIT │──────START_HYDRATION──────▶┌───────────┐
 * └──────┘                              │ HYDRATING │
 *                                       └─────┬─────┘
 *                                             │
 *              ┌──────────────────────────────┼──────────────────────────────┐
 *              │                              │                              │
 *              ▼                              ▼                              ▼
 *    ┌─────────────────┐          ┌───────────────────┐          ┌────────────────┐
 *    │  UNAUTHORIZED   │          │   AUTHENTICATED   │          │  AUTHZ_DENIED  │
 *    │ (→ /login)      │          │ (→ first allowed) │          │ (terminal)     │
 *    └─────────────────┘          └───────────────────┘          └────────────────┘
 *              ▲                              │
 *              │                              │
 *              └──────TOKEN_EXPIRED───────────┘
 */
