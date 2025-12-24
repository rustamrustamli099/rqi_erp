import { Navigate } from "react-router-dom"
import { useAuth } from "@/domains/auth/context/AuthContext"
import { findFirstPathFromMenu } from "@/app/security/route-utils"
import { useMenu } from "@/app/navigation/useMenu"
import { PageLoader } from "@/shared/components/PageLoader"

/**
 * RootRedirect
 * 
 * Intelligent redirection based on user scope/permissions.
 * Dynamically finds the first accessible route in the user's menu.
 */
export function RootRedirect() {
    const { isAuthenticated, isLoading } = useAuth();
    const { menu } = useMenu();

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
    // Dynamic Route Resolution from Filtered Menu
    // This guarantees we only redirect to something that is actually in the sidebar.
    const targetRoute = findFirstPathFromMenu(menu);
    // Note: useMenu already handles filtering by permission.

    // State 4: DENIED_TERMINAL (Zero Permissions)
    // If no accessible route is found, user is locked out.
    if (!targetRoute) {
        console.warn("[RootRedirect] Access Denied: User has no valid routes in filtered menu.");
        return <Navigate to="/access-denied" state={{ error: 'access_denied_redirect' }} replace />;
    }

    // Success: Redirect to calculated leaf node
    // Debug Log to diagnose loop
    console.log(`[RootRedirect] Navigating to: ${targetRoute}`);

    return <Navigate to={targetRoute} replace />;
}
