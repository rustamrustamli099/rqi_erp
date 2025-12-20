import React from "react";
import { useFeatureFlags } from "./context/FeatureFlagContext";
import { usePermissions } from "@/app/auth/hooks/usePermissions";

interface FeatureFlagGuardProps {
    flag: string; // The Feature Flag key (e.g., 'beta_ai_assistant')
    permission?: string; // Optional permission slug (e.g., 'ai.chat.view')
    fallback?: React.ReactNode; // What to show if access denied (null by default)
    children: React.ReactNode;
}

export const FeatureFlagGuard: React.FC<FeatureFlagGuardProps> = ({ 
    flag, 
    permission, 
    fallback = null, 
    children 
}) => {
    const { isEnabled } = useFeatureFlags();
    const { hasPermission } = usePermissions();

    // 1. Check Feature Flag
    const featureEnabled = isEnabled(flag);
    if (!featureEnabled) {
        return <>{fallback}</>;
    }

    // 2. Check Permission (if provided)
    if (permission) {
        const hasAccess = hasPermission(permission);
        if (!hasAccess) {
            return <>{fallback}</>;
        }
    }

    // 3. Render Content
    return <>{children}</>;
};
