import { Navigate } from "react-router-dom"
import { useAuth } from "@/domains/auth/context/AuthContext"
import { getFirstAllowedRoute } from "@/app/security/route-utils"
import { PageLoader } from "@/shared/components/PageLoader"

/**
 * RootRedirect
 * 
 * Intelligent redirection based on user scope/permissions.
 * Dynamically finds the first accessible route in the user's menu.
 */
export function RootRedirect() {
    const { isAuthenticated, permissions, isLoading, activeTenantType } = useAuth();

    // SAP-Grade Auth FSM Implementation
    // -------------------------------------------------------------
    // State 1: BOOTSTRAP / TOKEN_CHECK
    // Strict Rule: No redirects while loading.
    if (isLoading) {
        return <PageLoader />;
    }

    // State 2: UNAUTHENTICATED
    // If no token/session, go to login immediately.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // State 3: AUTH_READY (Stable Session)
    // We have a user and loaded permissions.
    // Calculate the best entry point (Leaf node only).

    // Dynamic Route Resolution (Strict Leaf-Only)
    const targetRoute = getFirstAllowedRoute(permissions, activeTenantType);

    // State 4: DENIED_TERMINAL (Zero Permissions)
    // If no accessible route is found, user is locked out.
    if (targetRoute === '/access-denied') {
        console.warn("[RootRedirect] Access Denied: User has no valid routes.");
        return <Navigate to="/access-denied" state={{ error: 'access_denied_redirect' }} replace />;
    }

    // Success: Redirect to calculated leaf node
    return <Navigate to={targetRoute} replace />;
}
