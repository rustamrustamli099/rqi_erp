import { useCallback } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading } = useAuth(); // permissions are already canonicalized in AuthContext

    const hasPermission = useCallback((requiredPermission: string) => {
        // Guard against undefined/null permission requests
        if (!requiredPermission) return false;

        // SAP-Grade Prefix Matching:
        // User has access if their assigned permission is a PREFIX of the required permission.
        // e.g. User has 'system.settings' -> Access to 'system.settings.general' (TRUE)
        // e.g. User has 'system.settings.general.read' -> Access to 'system.settings' (FALSE - handled by Menu, not here)
        // This function checks AUTHORIZATION: "Do I have enough power?"
        return permissions.some(userPerm => requiredPermission.startsWith(userPerm));
    }, [permissions]);

    const hasAll = useCallback((requiredPermissions: string[]) => {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        return requiredPermissions.every(req => permissions.some(userPerm => req.startsWith(userPerm)));
    }, [permissions]);

    const hasAny = useCallback((requiredPermissions: string[]) => {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        return requiredPermissions.some(req => permissions.some(userPerm => req.startsWith(userPerm)));
    }, [permissions]);

    return { hasPermission, can: hasPermission, hasAll, hasAny, permissions, user, isImpersonating, isLoading };
};
