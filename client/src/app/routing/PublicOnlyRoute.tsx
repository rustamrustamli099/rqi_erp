import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth/context/AuthContext';

interface PublicOnlyRouteProps {
    children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Ideally, AuthGate handles the loading state before this component is even rendered.
    // But for safety, we can return null here too.
    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        // Redirect logic based on role could be expanded here.
        // For now, default to Admin Dashboard.
        // If we have tenant users, we might check `activeTenantType` here.
        return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
