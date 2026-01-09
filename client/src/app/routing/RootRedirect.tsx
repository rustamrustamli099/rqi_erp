import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "@/domains/auth/context/AuthContext"
import { useMenu } from "@/app/navigation/useMenu"
import { PageLoader } from "@/shared/components/PageLoader"
import { useEffect } from "react"
import { toast } from "sonner"

/**
 * RootRedirect
 * 
 * SAP-Grade: Uses resolver via useMenu for first allowed route.
 * NO PermissionPreviewEngine - resolver is single source.
 */
export function RootRedirect() {
    const { isAuthenticated, isLoading: authLoading, authState, logout } = useAuth();
    const { getFirstAllowedRoute, loading: menuLoading, error: menuError, menu } = useMenu();
    const navigate = useNavigate();

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

    // [SAP-GRADE] Zero permissions - logout and redirect to login with toast
    if (!targetRoute || targetRoute === '/access-denied' || (menu && menu.length === 0)) {
        console.warn("[RootRedirect] Zero permissions: Forcing logout", menuError ? `Error: ${menuError}` : '');

        // Show toast and logout
        toast.error("Giriş Məhdudlaşdırılıb", {
            id: "no-permissions-logout",
            description: "Bu hesabın sistemə giriş üçün icazəsi yoxdur. Zəhmət olmasa administratorla əlaqə saxlayın.",
            duration: 8000,
        });

        // Clear all auth state and redirect to login
        logout();
        return <Navigate to="/login" replace />;
    }

    // Redirect to allowed route
    if (import.meta.env.DEV) {
        console.log(`[RootRedirect] Landing: ${targetRoute}`);
    }
    return <Navigate to={targetRoute} replace />;
}

