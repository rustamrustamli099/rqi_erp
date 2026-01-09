import { Navigate } from "react-router-dom"
import { useAuth } from "@/domains/auth/context/AuthContext"
import { useMenu } from "@/app/navigation/useMenu"
import { PageLoader } from "@/shared/components/PageLoader"

/**
 * RootRedirect
 * 
 * SAP-Grade: Uses resolver via useMenu for first allowed route.
 * NO PermissionPreviewEngine - resolver is single source.
 */
export function RootRedirect() {
    const { isAuthenticated, isLoading: authLoading, authState } = useAuth();
    const { getFirstAllowedRoute, loading: menuLoading, error: menuError } = useMenu();

    // Auth loading state
    if (authLoading || authState === 'BOOTSTRAPPING' || authState === 'UNINITIALIZED') {
        return <PageLoader />;
    }

    // Not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // CRITICAL: Wait for menu to load before making decisions
    if (menuLoading) {
        return <PageLoader />;
    }

    // Get first allowed route from resolver
    const targetRoute = getFirstAllowedRoute();

    // Zero permissions or menu error - terminal
    if (!targetRoute || targetRoute === '/access-denied') {
        console.warn("[RootRedirect] Access Denied: User has no valid routes.", menuError ? `Error: ${menuError}` : '');
        return <Navigate to="/access-denied" state={{ error: 'no_permissions' }} replace />;
    }

    // Redirect to allowed route
    if (import.meta.env.DEV) {
        console.log(`[RootRedirect] Landing: ${targetRoute}`);
    }
    return <Navigate to={targetRoute} replace />;
}

