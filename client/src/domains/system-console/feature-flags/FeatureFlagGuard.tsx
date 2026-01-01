import React from "react";
import { useFeatureFlags } from "./context/FeatureFlagContext";

/**
 * SAP-GRADE: Feature Flag Guard
 * 
 * This component ONLY checks feature flags, NOT permissions.
 * Permission checking is handled by:
 * 1. ProtectedRoute (route-level guard)
 * 2. Decision Center (resolveNavigationTree)
 * 
 * If you need both feature flag AND permission check:
 * - Permission is enforced at the route level
 * - Feature flag is checked here
 * 
 * The `permission` prop has been REMOVED to comply with GEMINI Constitution.
 */
interface FeatureFlagGuardProps {
    flag: string; // The Feature Flag key (e.g., 'beta_ai_assistant')
    fallback?: React.ReactNode; // What to show if feature disabled (null by default)
    children: React.ReactNode;
}

export const FeatureFlagGuard: React.FC<FeatureFlagGuardProps> = ({
    flag,
    fallback = null,
    children
}) => {
    const { isEnabled } = useFeatureFlags();

    // SAP-GRADE: Only check Feature Flag, NOT permissions
    // Permissions are enforced by Decision Center at route level
    const featureEnabled = isEnabled(flag);

    if (!featureEnabled) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
