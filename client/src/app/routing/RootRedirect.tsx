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

    if (isLoading) {
        return <PageLoader />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Dynamic Route Resolution (SAP-Grade)
    // Instead of hardcoding /admin/dashboard, we find the first valid leaf node.
    const targetRoute = getFirstAllowedRoute(permissions, activeTenantType);

    // If no route found (even if perms exist), go to Access Denied
    if (targetRoute === '/access-denied') {
        return <Navigate to="/access-denied" state={{ error: 'access_denied_redirect' }} replace />
    }

    return <Navigate to={targetRoute} replace />
}
