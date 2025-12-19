import { useSelector } from 'react-redux';


export const usePermissions = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = useSelector((state: any) => state.auth.user);

    const hasPermission = (permission?: string) => {
        if (!permission) return true;
        try {
            if (!user) {
                // User not found
                return false;
            }
        } catch (_error) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-console
            console.error("Check permission error", _error);
            return false;
        }

        // Check for SuperAdmin/Owner bypass
        const userRoles: string[] = user?.roles || [];
        // Fallback for legacy
        if (userRoles.length === 0 && (user as any)?.role) {
            userRoles.push((user as any).role);
        }

        const isSuperUser = userRoles.some(r => {
            const rName = typeof r === 'string' ? r : (r as any).name;
            return rName?.toLowerCase() === 'owner' || rName?.toLowerCase() === 'superadmin';
        });

        if (isSuperUser || user?.permissions?.includes('*')) return true;

        return user?.permissions?.some((p: string) => {
            if (p === '*') return true;
            if (p === permission) return true;
            if (p.endsWith(':*')) {
                const prefix = p.slice(0, -2);
                return permission.startsWith(prefix);
            }
            return false;
        });
    };

    return { hasPermission, can: hasPermission, user };
};
