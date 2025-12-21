import { useCallback } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading } = useAuth(); // permissions are already canonicalized in AuthContext

    const hasPermission = useCallback((requiredPermission: string) => {
        return permissions.includes(requiredPermission);
    }, [permissions]);

    const hasAll = useCallback((requiredPermissions: string[]) => {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        return requiredPermissions.every(perm => permissions.includes(perm));
    }, [permissions]);

    const hasAny = useCallback((requiredPermissions: string[]) => {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        return requiredPermissions.some(perm => permissions.includes(perm));
    }, [permissions]);

    return { hasPermission, can: hasPermission, hasAll, hasAny, permissions, user, isImpersonating, isLoading };
};
