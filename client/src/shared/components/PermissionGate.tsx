import React from 'react';
import { useAuthStore } from '../../store'; // Adjust import based on actual store location

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ permission, children, fallback = null }) => {
    // Assuming useAuthStore has a user object with permissions array
    const { user } = useAuthStore();

    // Check if user has the required permission
    const hasPermission = user?.permissions?.includes(permission);

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

// Also export a hook for logic usage
export const usePermission = (permission: string) => {
    const { user } = useAuthStore();
    return user?.permissions?.includes(permission) || false;
};
