/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛑 DEPRECATED — PHASE 14H 🛑
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * THIS HOOK IS BANNED FOR UI AUTHORIZATION DECISIONS.
 * 
 * USE:
 * - usePageState(Z_*) for page/action authorization
 * - Backend menu API for navigation
 * 
 * The only remaining exports are for backward compatibility with auth context.
 * All permission check functions have been REMOVED.
 * 
 * SAP PFCG COMPLIANT: Frontend is a DUMB RENDERER.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useAuth } from '@/domains/auth/context/AuthContext';

/**
 * @deprecated Use usePageState() for authorization decisions.
 * This hook now only exposes auth context data, NOT permission checks.
 */
export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading } = useAuth();

    // PHASE 14H: All permission check functions REMOVED
    // Frontend must NOT make authorization decisions.
    // Use usePageState(Z_*) for backend-resolved authorization.

    return {
        // Auth context data only (no decision functions)
        permissions,    // Read-only for debugging/display
        user,
        isImpersonating,
        isLoading
    };
};
