import type { ReactNode } from "react";
import { usePermissions } from "@/app/auth/hooks/usePermissions";

interface PermissionGuardProps {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export const PermissionGuard = ({ permission, children, fallback = null }: PermissionGuardProps) => {
    const { hasPermission } = usePermissions();

    // Admin/Owner always has permission (handled by hook usually, but good to be explicit if logic is simple here)
    // Assuming hasPermission handles "owner" check logic or backend returns '*'

    if (!hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
