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
    // Force refresh of permissions (e.g. after profile update)
    refreshSession: () => Promise<void>;

    // SAP-Grade State Machine
    authState: 'UNINITIALIZED' | 'BOOTSTRAPPING' | 'STABLE';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Redux is still used for the initial "User" object state driven by login
    const reduxUser = useSelector((state: any) => state.auth.user);
    const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

    const [permissions, setPermissionsState] = useState<string[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [authState, setAuthState] = useState<'UNINITIALIZED' | 'BOOTSTRAPPING' | 'STABLE'>('UNINITIALIZED');

    // Impersonation State
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [originalUser, setOriginalUser] = useState<User | null>(null);

    // Derived State
    // If user has no tenantId (or system tenant ID), they are SYSTEM context.
    const isSystemTenant = (tid?: string) => tid === 'system' || !tid;

    const activeTenantType: 'SYSTEM' | 'TENANT' = React.useMemo(() => {
        // If not authenticated, default to SYSTEM (or handled by login redirect)
        if (!reduxUser) return 'SYSTEM';

        // SAP-GRADE: Single Decision Center
        // Backend decides scope. Frontend reads it.
        if (reduxUser.scopeType) return reduxUser.scopeType;
        if (reduxUser.scope) return reduxUser.scope;

        // Fallback for legacy objects (should not happen in SAP mode)
        if (reduxUser.isOwner && !isImpersonating) return 'SYSTEM';
        return isSystemTenant(reduxUser.tenantId) ? 'SYSTEM' : 'TENANT';
    }, [reduxUser, isImpersonating]);

    // Load Session (Permissions)
    const loadSessionData = async () => {
        try {
            setLoading(true);
            setAuthState('BOOTSTRAPPING'); // Start transition

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
                const responseData = data.data || data;
                // FIX: Support nested user object (Backend sends { data: { user: { permissions: [] } } })
                const userObj = responseData.user || responseData;

                // FIX: Broad search for permissions to handle different backend structures
                // Priority: 1. user.permissions, 2. root.permissions, 3. data.permissions
                const rawPerms: string[] = userObj.permissions ||
                    responseData.permissions ||
                    data.permissions ||
                    [];

                // SAP-GRADE: Owner Bypass Logic for Logging
                if (userObj.isOwner || responseData.isOwner) {
                    console.log("[AuthContext] Owner Access (Bypass) - Full Permissions Granted");
                } else {
                    console.log("[AuthContext] Raw Perms Extracted:", rawPerms.length);
                }

                // Mapped (Canonical)
                const mappedPerms = rawPerms.map(p => {
                    // Phase 31 Migration: Dynamic platform->system replacement
                    if (p.startsWith('platform.')) {
                        return p.replace('platform.', 'system.');
                    }

                    if (isCanonical(p)) return p;
                    if (LEGACY_TO_CANONICAL_MAP[p]) return LEGACY_TO_CANONICAL_MAP[p];
                    return p;
                });

                // STRICT IMMUTABILITY (User Request Phase 31)
                // We do NOT expand permissions. We do NOT infer parents.
                // We only deduplicate to be safe.

                // SAP-GRADE: NO .access synthesis
                // Backend canonical slugs are the ONLY source of truth
                // .access permissions are NOT generated - use EXACT permission matching

                const uniquePerms = Array.from(new Set(mappedPerms));

                // console.log("[AuthContext] FINAL PERMISSIONS (No Expansion):", uniquePerms);
                setPermissionsState(uniquePerms);

            } else {
                console.warn("Failed to refresh session - 401/403?");
            }

        } catch (e) {
            console.error("Session load error", e);
        } finally {
            setLoading(false);
            setAuthState('STABLE'); // End transition
        }
    };

    // Zero-Permission Lockout is now handled by AuthGate for flicker-free experience.
    // useEffect(() => { ... }) removed.

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
                const token = localStorage.getItem('accessToken');
                if (token) {
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
        setAuthState('UNINITIALIZED');
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
        refreshSession: loadSessionData,
        authState
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
