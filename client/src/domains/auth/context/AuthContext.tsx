import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LEGACY_TO_CANONICAL_MAP, isCanonical } from '@/app/security/permission-slugs';

interface User {
    id: string;
    email: string;
    isOwner?: boolean;
    roles?: any[];
    permissions?: string[];
    tenantId?: string;
    firstName?: string;
    lastName?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    permissions: string[]; // Effective permissions (mapped to canonical)
    isLoading: boolean;

    // Impersonation & Context
    isImpersonating: boolean;
    originalUser: User | null;
    // activeTenantType: 'SYSTEM' | 'TENANT'; // Derived from user context

    impersonate: (userId: string) => Promise<void>;
    stopImpersonating: () => Promise<void>;
    logout: () => void;

    // Explicit tenant context switch could be added here if needed
    // For now we derive it from the user.tenantId
    activeTenantType: 'SYSTEM' | 'TENANT';

    // Force refresh of permissions (e.g. after profile update)
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Redux is still used for the initial "User" object state driven by login
    const reduxUser = useSelector((state: any) => state.auth.user);
    const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

    const [permissions, setPermissionsState] = useState<string[]>([]);
    const [isLoading, setLoading] = useState(true);

    // Impersonation State
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [originalUser, setOriginalUser] = useState<User | null>(null);

    // Derived State
    // If user has no tenantId (or system tenant ID), they are SYSTEM context.
    const isSystemTenant = (tid?: string) => tid === 'system' || !tid;

    const activeTenantType: 'SYSTEM' | 'TENANT' = React.useMemo(() => {
        // If not authenticated, default to SYSTEM (or handled by login redirect)
        if (!reduxUser) return 'SYSTEM';

        // Strategy 0: Robust Permission Check (Fixes Owner sidebar issue)
        // If user has platform permissions, they are in SYSTEM context.
        if (permissions.some(p => p.startsWith('platform.'))) return 'SYSTEM';

        // Strategy:
        // 1. If impersonating, strictly use the IMPERSONATED user's tenantId.
        // 2. If owner, normally SYSTEM, but if they are owner of a tenant org? 
        //    (Usually Owner is Platform Owner).
        //    For now: Owner -> SYSTEM.
        // 3. Else check tenantId.

        if (reduxUser.isOwner && !isImpersonating) return 'SYSTEM';
        return isSystemTenant(reduxUser.tenantId) ? 'SYSTEM' : 'TENANT';
    }, [reduxUser, isImpersonating, permissions]);

    // Load Session (Permissions)
    const loadSessionData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            // Always fetch /me to get fresh effective permissions
            const res = await fetch('http://localhost:3000/api/v1/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const freshUser = data.data || data;

                // MAPPING STRATEGY:
                // Backend returns permissions as string[] (mixed legacy/canonical).
                // We MUST normalize them to canonical here so frontend logic works.
                const rawPerms: string[] = freshUser.permissions || [];

                const mappedPerms = rawPerms.map(p => {
                    if (isCanonical(p)) return p;
                    // Try exact match
                    if (LEGACY_TO_CANONICAL_MAP[p]) return LEGACY_TO_CANONICAL_MAP[p];
                    // If not found, keep it (fallback), but it won't match canonical checks.
                    return p;
                });

                // Dedup
                let uniquePerms = Array.from(new Set(mappedPerms));

                // OWNER OVERRIDE REMOVED: Strict RBAC enforcement. Owner permissions must be in DB.

                setPermissionsState(uniquePerms);

                // Also could update redux user if needed, but we keep local state for perms
            } else {
                console.warn("Failed to refresh session - 401/403?");
                // If 401, maybe logout? For now just warn.
            }

        } catch (e) {
            console.error("Session load error", e);
        } finally {
            setLoading(false);
        }
    };

    // Absolute Security Rule: Zero-Permission Lockout
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Strict RBAC: Even Owners need permissions (assigned directly or via role)
            // We allow access if permissions array is empty ONLY if we are already on the denied page
            // or if it's a public route (though isAuthenticated shouldn't be true there ideally)
            if (permissions.length === 0) {
                const currentPath = window.location.pathname;
                // Avoid infinite loop
                if (currentPath !== '/access-denied' && !currentPath.startsWith('/login')) {
                    console.warn("Security Alert: User has 0 permissions. Redirecting to Access Denied.");
                    window.location.href = '/access-denied';
                }
            }
        }
    }, [isLoading, isAuthenticated, permissions]);

    // Initial Load & Impersonation Check
    useEffect(() => {
        const init = async () => {
            const origToken = localStorage.getItem('originalAccessToken');
            if (origToken) {
                setIsImpersonating(true);
                const storedOrigUser = localStorage.getItem('originalUser');
                if (storedOrigUser) setOriginalUser(JSON.parse(storedOrigUser));
            }

            if (isAuthenticated) {
                await loadSessionData();
            } else {
                // Not authenticated, verify if we have token but redux is empty (refresh case)
                // If redux persistence is working, isAuthenticated is true.
                // If not, we might be reloading. 
                const token = localStorage.getItem('accessToken');
                if (token) {
                    // Try to restore session via loadSessionData?
                    // Usually we rely on Redux persist. 
                    // If Redux is empty but token exists, we should probably fetch /me and fill Redux.
                    // For now, assum Redux persist works.
                    await loadSessionData();
                } else {
                    setLoading(false);
                }
            }
        };
        init();
    }, [isAuthenticated]);

    const impersonate = async (userId: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`http://localhost:3000/api/v1/auth/impersonate/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                const newToken = data.accessToken || data.data?.accessToken;

                if (!newToken) throw new Error("No token returned");

                const originalToken = localStorage.getItem('accessToken');
                localStorage.setItem('originalAccessToken', originalToken || '');
                localStorage.setItem('originalUser', JSON.stringify(reduxUser));
                localStorage.setItem('accessToken', newToken);

                setOriginalUser(reduxUser);
                setIsImpersonating(true);

                // Hard reload to reset all states/sockets
                window.location.reload();
            }
        } catch (error) {
            console.error("Impersonation failed", error);
            setLoading(false);
        }
    };

    const stopImpersonating = async () => {
        const originalToken = localStorage.getItem('originalAccessToken');
        if (originalToken) {
            localStorage.setItem('accessToken', originalToken);
            localStorage.removeItem('originalAccessToken');
            localStorage.removeItem('originalUser');
            window.location.reload();
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('originalAccessToken');
        localStorage.removeItem('originalUser');
        window.location.href = '/login';
    };

    const value = {
        user: reduxUser,
        isAuthenticated,
        permissions,
        isLoading,
        isImpersonating,
        originalUser,
        activeTenantType,
        impersonate,
        stopImpersonating,
        logout,
        refreshSession: loadSessionData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
