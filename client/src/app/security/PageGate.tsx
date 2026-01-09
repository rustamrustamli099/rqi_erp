/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 14H.4: PageGate Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-Grade Page Authorization Gate
 * 
 * RULE: This component wraps pages and consumes backend authorization.
 * It does NOT compute authorization - it only RENDERS based on pageState.
 * 
 * USAGE:
 * ```tsx
 * <PageGate pageKey="Z_USERS">
 *   <UsersPage />
 * </PageGate>
 * ```
 * 
 * BEHAVIOR:
 * - Calls usePageState(pageKey)
 * - If authorized=false → renders EmptyState
 * - If authorized=true → renders children with pageState
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { usePageState } from '@/app/security/usePageState';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PageGateProps {
    /**
     * Z_* page key from PAGE_OBJECTS_REGISTRY
     */
    pageKey: string;

    /**
     * Children to render when authorized
     */
    children: React.ReactNode;

    /**
     * Optional: Custom unauthorized component
     */
    fallback?: React.ReactNode;
}

/**
 * PageGate - SAP-Grade Page Authorization Consumer
 * 
 * This component is a DUMB RENDERER.
 * It does NOT make authorization decisions.
 * It only consumes backend-provided pageState.
 */
export function PageGate({ pageKey, children, fallback }: PageGateProps) {
    const { authorized, isLoading, error } = usePageState(pageKey);
    const navigate = useNavigate();

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }


    // [PHASE 14H] REMOVED: Owner bypass was here
    // Frontend must NEVER compute authorization
    // Only backend pageState.authorized is authoritative

    // Error state
    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
                    <h3 className="text-lg font-semibold">Xəta baş verdi</h3>
                    <p className="text-sm text-muted-foreground">{String(error)}</p>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Geri qayıt
                    </Button>
                </div>
            </div>
        );
    }

    // Unauthorized state - render fallback or default EmptyState
    if (!authorized) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="flex h-full w-full items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto" />
                    <h3 className="text-lg font-semibold">Giriş qadağandır</h3>
                    <p className="text-sm text-muted-foreground">
                        Bu səhifəyə daxil olmaq üçün lazımi icazəniz yoxdur.
                    </p>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Geri qayıt
                    </Button>
                </div>
            </div>
        );
    }

    // Authorized - render children
    return <>{children}</>;
}

export default PageGate;
