import { useCallback } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading } = useAuth(); // permissions are already canonicalized in AuthContext

    const hasPermission = useCallback((requiredPermission: string) => {
        // Guard against undefined/null permission requests
        if (!requiredPermission) return false;

        // Extract base (without action suffix) for matching
        const reqBase = requiredPermission.replace(/\.(read|create|update|delete|view|access|manage)$/, '');

        // SAP-Grade Permission Matching:
        const result = permissions.some(userPerm => {
            // 1. Exact match
            if (userPerm === requiredPermission) return true;

            // 2. User has broader permission (prefix match)
            if (requiredPermission.startsWith(userPerm + '.')) return true;

            // 3. User permission base without action for matching
            const userBase = userPerm.replace(/\.(read|create|update|delete|view|access|manage)$/, '');

            // 4. Base match (same module, different actions)
            if (userBase === reqBase) return true;

            // 5. Child implies parent (SAP-Grade Rule)
            if (userBase.startsWith(reqBase + '.')) return true;

            return false;
        });

        // Debug log for dictionaries
        if (requiredPermission.includes('dictionary')) {
            console.log('[hasPermission] Dictionary check:', { requiredPermission, reqBase, result, samplePerms: permissions.filter(p => p.includes('dictionary')).slice(0, 3) });
        }

        return result;
    }, [permissions]);

    const hasAll = useCallback((requiredPermissions: string[]) => {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        return requiredPermissions.every(req => hasPermission(req));
    }, [hasPermission]);

    const hasAny = useCallback((requiredPermissions: string[]) => {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        return requiredPermissions.some(req => hasPermission(req));
    }, [hasPermission]);

    return { hasPermission, can: hasPermission, hasAll, hasAny, permissions, user, isImpersonating, isLoading };
};
