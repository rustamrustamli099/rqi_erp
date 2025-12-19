
import type { ReactNode } from 'react';
import { useTenant } from '@/app/layout/TenantLoader';

export const ModuleGuard = ({ moduleCode, children }: { moduleCode: string, children: ReactNode }) => {
    const { settings } = useTenant();

    // Check if module is enabled for this tenant
    const isEnabled = settings.modules?.includes(moduleCode) || moduleCode === 'core';

    if (!isEnabled) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
                <h2 className="text-xl font-bold">Module Not Enabled</h2>
                <p className="text-muted-foreground">Contact your administrator to enable access to {moduleCode}.</p>
            </div>
        );
    }

    return <>{children}</>;
};
