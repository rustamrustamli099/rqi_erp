
import React from 'react';
import { usePermissions } from '@/app/auth/hooks/usePermissions';

interface RequirePermissionProps {
    permission?: string;
    all?: string[];
    any?: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
    mode?: 'hide' | 'disabled';
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const RequirePermission: React.FC<RequirePermissionProps> = ({
    permission,
    all,
    any,
    children,
    fallback = null,
    mode = 'hide'
}) => {
    const { hasPermission, hasAll, hasAny } = usePermissions();

    let allowed = true;

    if (permission) {
        allowed = hasPermission(permission);
    } else if (all) {
        allowed = hasAll(all);
    } else if (any) {
        allowed = hasAny(any);
    }

    if (!allowed) {
        if (mode === 'disabled') {
            // Clone element and add disabled prop if it's a valid React element
            let disabledChild = fallback;
            if (React.isValidElement(children)) {
                // @ts-ignore
                disabledChild = React.cloneElement(children, { disabled: true, className: `${children.props.className} opacity-50 cursor-not-allowed` });
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>{disabledChild}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>You do not have permission for this action</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
