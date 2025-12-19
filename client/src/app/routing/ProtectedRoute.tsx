import { Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "@/app/auth/hooks/usePermissions";

interface ProtectedRouteProps {
    permission?: string;
    redirectPath?: string;
}

export const ProtectedRoute = ({
    permission,
    redirectPath = "/login"
}: ProtectedRouteProps) => {
    const { hasPermission, user } = usePermissions();

    console.log(`[ProtectedRoute] Checking permission: ${permission}, User: ${user?.id}, HasPermission: ${permission ? hasPermission(permission) : 'N/A'}`);

    if (!user) {
        console.log('[ProtectedRoute] No user, redirecting to login');
        return <Navigate to={redirectPath} replace />;
    }


    if (permission && !hasPermission(permission)) {
        console.log('[ProtectedRoute] Permission denied, redirecting to /');
        return <Navigate to="/" replace />; // Redirect to home or unauthorized page
    }

    console.log('[ProtectedRoute] Access granted');
    return <Outlet />;
};

