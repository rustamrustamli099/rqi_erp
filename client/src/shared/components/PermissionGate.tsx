// Adapted for Redux Token-Based Auth
import { usePermissions } from '../../app/auth/hooks/usePermissions';

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ permission, children, fallback = null }) => {
    const { can } = usePermissions();
    const hasPermission = can(permission);

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export const usePermission = (permission: string) => {
    const { can } = usePermissions();
    return can(permission);
};
