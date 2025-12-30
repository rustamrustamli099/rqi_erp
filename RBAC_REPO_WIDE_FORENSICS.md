client/src/app/auth/hooks/usePermissions.ts
+13
-37

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Permission Hook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES:
 * 1. EXACT base match ONLY - NO prefix/startsWith
 * 2. NO child implies parent
 * 3. Uses TAB_SUBTAB_REGISTRY for tab checks
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useCallback } from 'react';
import { useCallback, useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import {
    getFirstAllowedTab,
    canAccessPage,
    TAB_SUBTAB_REGISTRY,
    normalizePermissions
} from '@/app/navigation/tabSubTab.registry';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading, activeTenantType } = useAuth();
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    const permSet = useMemo(() => new Set(permissions), [permissions]);

    /**
     * SAP-GRADE: Check if user has EXACT permission
     * NO prefix matching, NO child implies parent
     */
    const can = useCallback((requiredPermission: string): boolean => {
        if (!requiredPermission) return false;

        const normalized = normalizePermissions(permissions);
        const reqBase = requiredPermission.replace(/\.(read|create|update|delete|view|access|manage|approve|export)$/, '');

        return normalized.some(userPerm => {
            const userBase = userPerm.replace(/\.(read|create|update|delete|view|access|manage|approve|export)$/, '');
            // EXACT base match ONLY
            return userBase === reqBase;
        });
    }, [permissions]);
        return permSet.has(requiredPermission);
    }, [permSet]);

    /**
     * SAP-GRADE: Check if user can access ANY of the permissions
     */
    const canAny = useCallback((slugs: string[]): boolean => {
        if (!slugs || slugs.length === 0) return true;
        return slugs.some(slug => can(slug));
    }, [can]);

    /**
     * SAP-GRADE: Check if user can access ALL of the permissions
     */
    const canAll = useCallback((slugs: string[]): boolean => {
        if (!slugs || slugs.length === 0) return true;
        return slugs.every(slug => can(slug));
    }, [can]);

    /**
     * SAP-GRADE: Check if user can access a specific tab/subTab
     * Uses frozen TAB_SUBTAB_REGISTRY
     */
    const canForTab = useCallback((
        pageKey: string,
        tabKey?: string,
        subTabKey?: string
    ): boolean => {
        const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
        const page = pages.find(p => p.pageKey === pageKey);
        if (!page) return false;

        const normalized = normalizePermissions(permissions);

        if (!tabKey) {
            // Check if user can access ANY tab of the page
            return canAccessPage(pageKey, permissions, context);
        }

        const tab = page.tabs.find(t => t.key === tabKey);
        if (!tab) return false;

        // Check tab permission
        const hasTabAccess = tab.requiredAnyOf.some(req => {
            const reqBase = req.replace(/\.(read|create|update|delete|approve|export)$/, '');
            return normalized.some(perm => {
                const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
                return permBase === reqBase;
            });
        });

        if (!hasTabAccess) return false;

        if (subTabKey && tab.subTabs) {
            const subTab = tab.subTabs.find(st => st.key === subTabKey);
            if (!subTab) return false;

            return subTab.requiredAnyOf.some(req => {
                const reqBase = req.replace(/\.(read|create|update|delete|approve|export)$/, '');
                return normalized.some(perm => {
                    const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
                    return permBase === reqBase;
                });
            });
        const hasTabAccess = tab.requiredAnyOf.some(req => permSet.has(req));

        const allowedSubTabs = tab.subTabs?.filter(st => st.requiredAnyOf.some(req => permSet.has(req))) ?? [];

        if (subTabKey) {
            return allowedSubTabs.some(st => st.key === subTabKey);
        }

        return true;
    }, [permissions, context]);
        return hasTabAccess || allowedSubTabs.length > 0;
    }, [permissions, context, permSet, can]);

    /**
     * SAP-GRADE: Get first allowed tab for a page
     */
    const getFirstAllowedTabForPage = useCallback((pageKey: string) => {
        return getFirstAllowedTab(pageKey, permissions, context);
    }, [permissions, context]);

    // Legacy aliases for backward compatibility
    const hasPermission = can;
    const hasAll = canAll;
    const hasAny = canAny;

    return {
        can,
        canAny,
        canAll,
        canForTab,
        getFirstAllowedTabForPage,
        // Legacy aliases
        hasPermission,
        hasAll,
        hasAny,
        permissions,
        user,
client/src/app/navigation/tabSubTab.registry.ts
+7
-30

@@ -23,73 +23,58 @@ export interface SubTabConfig {
    requiredAnyOf: string[];  // ANY grants entry
}

export interface TabConfig {
    key: string;
    label: string;
    requiredAnyOf: string[];  // ANY grants entry
    subTabs?: SubTabConfig[];
}

export interface PageConfig {
    pageKey: string;
    basePath: string;
    icon: string;
    label: string;
    labelAz: string;
    tabs: TabConfig[];  // Ordered by priority
}

export interface TabSubTabRegistry {
    admin: PageConfig[];
    tenant: PageConfig[];
}

// =============================================================================
// PERMISSION NORMALIZATION
// PERMISSION UTILITIES (EXACT MATCH ONLY)
// =============================================================================

/**
 * SAP-GRADE: If user has write/manage action, READ is implied
 * This ensures entry to list pages when user has create/update/delete
 * Deduplicate permission list WITHOUT any inference or verb stripping.
 */
export function normalizePermissions(permissions: string[]): string[] {
    const normalized = new Set(permissions);

    permissions.forEach(perm => {
        // Extract base and action
        const parts = perm.split('.');
        const action = parts[parts.length - 1];
        const base = parts.slice(0, -1).join('.');

        // If write action exists, add read
        if (['create', 'update', 'delete', 'manage', 'approve', 'export'].includes(action)) {
            normalized.add(`${base}.read`);
        }
    });

    return Array.from(normalized);
    return Array.from(new Set(permissions));
}

// =============================================================================
// ADMIN PANEL REGISTRY
// =============================================================================

const ADMIN_PAGES: PageConfig[] = [
    {
        pageKey: 'admin.dashboard',
        basePath: '/admin/dashboard',
        icon: 'LayoutDashboard',
        label: 'Dashboard',
        labelAz: 'İdarə Paneli',
        tabs: [
            // Dashboard: DB has system.dashboard.read + fallback to common permissions
            { key: 'overview', label: 'Overview', requiredAnyOf: ['system.dashboard.read', 'system.tenants.read', 'system.users.users.read', 'system.users.curators.read'] }
        ]
    },
    {
        pageKey: 'admin.tenants',
        basePath: '/admin/tenants',
        icon: 'Building2',
        label: 'Tenants',
        labelAz: 'Tenantlar',
        tabs: [
@@ -331,106 +316,98 @@ const TENANT_PAGES: PageConfig[] = [
    }
];

// =============================================================================
// EXPORT
// =============================================================================

export const TAB_SUBTAB_REGISTRY: TabSubTabRegistry = {
    admin: ADMIN_PAGES,
    tenant: TENANT_PAGES
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if user can access ANY tab of a page
 * EXACT base match only - NO startsWith
 */
export function canAccessPage(
    pageKey: string,
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): boolean {
    const normalized = normalizePermissions(userPermissions);
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return false;

    return page.tabs.some(tab =>
        hasExactPermission(tab.requiredAnyOf, normalized)
        hasExactPermission(tab.requiredAnyOf, userPermissions)
    );
}

/**
 * Get first allowed tab for a page
 * EXACT base match only - NO startsWith
 */
export function getFirstAllowedTab(
    pageKey: string,
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): { tab: string; subTab?: string } | null {
    const normalized = normalizePermissions(userPermissions);
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return null;

    for (const tab of page.tabs) {
        if (hasExactPermission(tab.requiredAnyOf, normalized)) {
        if (hasExactPermission(tab.requiredAnyOf, userPermissions)) {
            // Check subTabs if exist
            if (tab.subTabs && tab.subTabs.length > 0) {
                for (const subTab of tab.subTabs) {
                    if (hasExactPermission(subTab.requiredAnyOf, normalized)) {
                    if (hasExactPermission(subTab.requiredAnyOf, userPermissions)) {
                        return { tab: tab.key, subTab: subTab.key };
                    }
                }
                // If no subTab accessible, still return tab
                return { tab: tab.key };
            }
            return { tab: tab.key };
        }
    }

    return null;
}

/**
 * EXACT permission check helper - NO startsWith
 */
function hasExactPermission(requiredAnyOf: string[], normalizedPerms: string[]): boolean {
    return requiredAnyOf.some(required => {
        const reqBase = required.replace(/\.(read|create|update|delete|approve|export)$/, '');
        return normalizedPerms.some(perm => {
            const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
            return permBase === reqBase;
        });
    });
    return requiredAnyOf.some(required => normalizedPerms.includes(required));
}

/**
 * Build landing path for a page
 */
export function buildLandingPath(
    basePath: string,
    tabInfo: { tab: string; subTab?: string } | null
): string {
    if (!tabInfo) return basePath;

    let path = `${basePath}?tab=${tabInfo.tab}`;
    if (tabInfo.subTab) {
        path += `&subTab=${tabInfo.subTab}`;
    }
    return path;
}

/**
 * Get page config by path
 */
export function getPageByPath(
    path: string,
    context: 'admin' | 'tenant' = 'admin'
): PageConfig | undefined {
client/src/app/security/navigationResolver.ts
+4
-1

@@ -53,51 +53,54 @@ function hasAnyPermission(userPerms: string[], requiredAnyOf: string[]): boolean
export function resolvePageByPath(
    pathname: string,
    context: 'admin' | 'tenant' = 'admin'
): string | null {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const basePath = pathname.split('?')[0];

    const page = pages.find(p => p.basePath === basePath);
    return page?.pageKey ?? null;
}

/**
 * Get allowed tabs for a page (EXACT permission match)
 */
export function getAllowedTabs(
    pageKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): AllowedTab[] {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page?.tabs) return [];

    return page.tabs
        .filter(tab => hasAnyPermission(userPerms, tab.requiredAnyOf))
        .filter(tab => {
            const allowedSubTabs = tab.subTabs?.filter(st => hasAnyPermission(userPerms, st.requiredAnyOf)) ?? [];
            return hasAnyPermission(userPerms, tab.requiredAnyOf) || allowedSubTabs.length > 0;
        })
        .map(tab => ({ key: tab.key, label: tab.label }));
}

/**
 * Get allowed subTabs for a tab (EXACT permission match)
 */
export function getAllowedSubTabs(
    pageKey: string,
    tabKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): AllowedSubTab[] {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page?.tabs) return [];

    const tab = page.tabs.find(t => t.key === tabKey);
    if (!tab?.subTabs) return [];

    return tab.subTabs
        .filter(st => hasAnyPermission(userPerms, st.requiredAnyOf))
        .map(st => ({ key: st.key, label: st.label }));
}

client/src/app/security/rbacResolver.ts
+1
-21

@@ -25,71 +25,51 @@ import {
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ResolvedLocation {
    pathname: string;
    search: string;
}

export interface Terminal403 {
    terminal403: true;
    reason: string;
}

export type SafeLocationResult = ResolvedLocation | Terminal403;

// ═══════════════════════════════════════════════════════════════════════════
// Permission Normalization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize raw permissions to a Set for fast lookup.
 * ONLY verb aliasing allowed (view → read).
 * NO synthetic permissions, NO parent inference.
 */
export function normalizePermissions(rawPerms: string[]): Set<string> {
    const normalized = new Set<string>();

    for (const perm of rawPerms) {
        normalized.add(perm);

        // Verb aliasing: .view → .read (for legacy compatibility)
        if (perm.endsWith('.view')) {
            normalized.add(perm.replace('.view', '.read'));
        }

        // Action normalization: write actions imply read
        const writeActions = ['.create', '.update', '.delete', '.approve', '.export'];
        for (const action of writeActions) {
            if (perm.endsWith(action)) {
                const basePerm = perm.slice(0, -action.length) + '.read';
                normalized.add(basePerm);
            }
        }
    }

    return normalized;
    return new Set(rawPerms);
}

// ═══════════════════════════════════════════════════════════════════════════
// Page Key Resolution
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get pageKey from pathname.
 * Returns null if page not in registry.
 */
export function getPageKeyFromPath(pathname: string, context: 'admin' | 'tenant' = 'admin'): string | null {
    const page = getPageByPath(pathname, context);
    return page?.pageKey || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Allowed Tabs/SubTabs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user has ANY of the required permissions (exact match).
 */
function hasAnyPermission(perms: Set<string>, requiredAnyOf: string[]): boolean {
    if (!requiredAnyOf || requiredAnyOf.length === 0) return true;
    return requiredAnyOf.some(p => perms.has(p));
client/src/domains/billing/views/BillingPage.tsx
+70
-43

import { useState, useEffect } from "react";
import { useState, useEffect, useMemo } from "react";
import {
    CreditCard, Package, ShoppingBag, BarChart3,
    Check, Plus, Settings, AlertTriangle, MoreHorizontal,
    Edit, Trash2, Eye, PauseCircle, PlayCircle, XCircle,
    Save, Building, Search, Filter, ArrowRight, Shield, Zap, Box, Link2, Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
@@ -286,145 +286,172 @@ const PACKAGES = [
];

// --- BADGE HELPER ---
const getBadgeVariant = (type: ProductType) => {
    switch (type) {
        case "Modul": return "default"; // Primary
        case "İnteqrasiya": return "secondary";
        case "Funksiya": return "outline";
        case "Təhlükəsizlik": return "destructive";
        default: return "secondary";
    }
};

const getBadgeIcon = (type: ProductType) => {
    switch (type) {
        case "Modul": return Box;
        case "İnteqrasiya": return Link2;
        case "Funksiya": return Zap;
        case "Təhlükəsizlik": return Shield;
        default: return Boxes;
    }
};

import { PageHeader } from "@/shared/components/ui/page-header";

import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedTabs, normalizePermissions } from "@/app/security/rbacResolver";
import { evaluateRoute, getAllowedTabs } from "@/app/security/navigationResolver";
import { Inline403 } from "@/shared/components/security/Inline403";

// Tab configuration for filtering
const BILLING_TABS = [
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { key: 'packages', label: 'Kompakt Paketlər', icon: Package },
    { key: 'subscriptions', label: 'Abunəlik Planları', icon: CreditCard },
    { key: 'invoices', label: 'Fakturalar', icon: BarChart3 },
    { key: 'licenses', label: 'Lisenziyalar', icon: Shield },
];

export default function BillingPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { permissions } = usePermissions();
    const [denyReason, setDenyReason] = useState<string | null>(null);

    // SAP-GRADE: Get allowed tabs from resolver
    const allowedTabKeys = useMemo(() => {
        const permSet = normalizePermissions(permissions);
        return getAllowedTabs({
            pageKey: 'admin.billing',
            perms: permSet,
            context: 'admin'
        });
        return getAllowedTabs('admin.billing', permissions, 'admin').map(t => t.key);
    }, [permissions]);

    // Filter visible tabs
    const visibleTabs = useMemo(() => {
    const allowedTabs = useMemo(() => {
        return BILLING_TABS.filter(tab => allowedTabKeys.includes(tab.key));
    }, [allowedTabKeys]);

    const activeTab = searchParams.get("tab") || (visibleTabs[0]?.key || "marketplace");
    useEffect(() => {
        const decision = evaluateRoute(
            location.pathname,
            new URLSearchParams(location.search),
            permissions,
            'admin'
        );

        if (decision.decision === 'REDIRECT') {
            navigate(decision.normalizedUrl, { replace: true });
            setDenyReason(null);
        } else if (decision.decision === 'DENY') {
            setDenyReason(decision.reason);
        } else {
            setDenyReason(null);
        }
    }, [location.pathname, location.search, permissions, navigate]);

    const activeTab = searchParams.get("tab") || (allowedTabs[0]?.key || "marketplace");

    const handleTabChange = (val: string) => {
        if (!allowedTabKeys.includes(val)) return;
        setSearchParams({ tab: val });
    };

    if (denyReason || allowedTabs.length === 0) {
        return <Inline403 message={denyReason || "No accessible billing tabs"} />;
    }


    return (
        <div className="flex flex-col min-h-[80vh] h-auto bg-background animate-in fade-in-50 duration-500">
            <div className="px-8 pt-6 flex-shrink-0">
                <PageHeader
                    heading="Biling və Marketplace"
                    text="Məhsul, paket və abunəliklərin mərkəzləşdirilmiş idarəetməsi."
                />
            </div>

            <div className="flex-1 p-8 pt-4 overflow-hidden min-w-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full flex flex-col">
                    <div className="border-b flex-shrink-0">
                        <TabsList className="w-full justify-start border-b-0 rounded-none bg-transparent p-0 h-auto gap-6">
                            <TabsTrigger value="marketplace" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <ShoppingBag className="mr-2 h-4 w-4" /> Marketplace
                            </TabsTrigger>
                            <TabsTrigger value="packages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <Package className="mr-2 h-4 w-4" /> Kompakt Paketlər
                            </TabsTrigger>
                            <TabsTrigger value="subscriptions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <CreditCard className="mr-2 h-4 w-4" /> Abunəlik Planları
                            </TabsTrigger>
                            <TabsTrigger value="invoices" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <BarChart3 className="mr-2 h-4 w-4" /> Fakturalar
                            </TabsTrigger>
                            <TabsTrigger value="licenses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <Shield className="mr-2 h-4 w-4" /> Lisenziyalar
                            </TabsTrigger>
                            {allowedTabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3"
                                    >
                                        <Icon className="mr-2 h-4 w-4" /> {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    {/* --- MARKETPLACE TAB --- */}
                    <TabsContent value="marketplace" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <MarketplaceView />
                    </TabsContent>
                    {allowedTabKeys.includes('marketplace') && (
                        <TabsContent value="marketplace" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <MarketplaceView />
                        </TabsContent>
                    )}

                    {/* --- PACKAGES TAB --- */}
                    <TabsContent value="packages" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <PackagesView />
                    </TabsContent>
                    {allowedTabKeys.includes('packages') && (
                        <TabsContent value="packages" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <PackagesView />
                        </TabsContent>
                    )}

                    {/* --- SUBSCRIPTIONS TAB --- */}
                    <TabsContent value="subscriptions" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <SubscriptionsView />
                    </TabsContent>
                    {allowedTabKeys.includes('subscriptions') && (
                        <TabsContent value="subscriptions" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <SubscriptionsView />
                        </TabsContent>
                    )}

                    {/* --- INVOICES TAB --- */}
                    <TabsContent value="invoices" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <InvoicesView />
                    </TabsContent>
                    {allowedTabKeys.includes('invoices') && (
                        <TabsContent value="invoices" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <InvoicesView />
                        </TabsContent>
                    )}

                    {/* --- LICENSES TAB --- */}
                    <TabsContent value="licenses" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <LicensesView />
                    </TabsContent>
                    {allowedTabKeys.includes('licenses') && (
                        <TabsContent value="licenses" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <LicensesView />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function MarketplaceView() {
    // Data State
    const [products, setProducts] = useState<Product[]>(MARKETPLACE_FEATURES);

    // UI State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("All");

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
client/src/domains/identity/views/UsersPage.tsx
+42
-9

import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldAlert } from "lucide-react";
import { UsersListTab } from "./UsersListTab";
import { CuratorsListTab } from "./CuratorsListTab";
import { useSearchParams } from "react-router-dom";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedTabs } from "@/app/security/navigationResolver";
import { evaluateRoute, getAllowedTabs } from "@/app/security/navigationResolver";
import { useHelp } from "@/app/context/HelpContext";
import { useEffect, useMemo } from "react";
import { useEffect, useMemo, useState } from "react";
import { Inline403 } from "@/shared/components/security/Inline403";

// Tab icons
const TAB_ICONS: Record<string, React.ComponentType<any>> = {
    users: Users,
    curators: ShieldAlert,
};

export default function UsersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageKey } = useHelp();
    const { permissions } = usePermissions();
    const [denyReason, setDenyReason] = useState<string | null>(null);

    // SAP-GRADE: Get allowed tabs from resolver (EXACT match)
    const allowedTabs = useMemo(() => {
        return getAllowedTabs('admin.users', permissions, 'admin');
    }, [permissions]);

    const allowedTabKeys = useMemo(() => allowedTabs.map(t => t.key), [allowedTabs]);

    useEffect(() => {
        const decision = evaluateRoute(
            location.pathname,
            new URLSearchParams(location.search),
            permissions,
            'admin'
        );

        if (decision.decision === 'REDIRECT') {
            navigate(decision.normalizedUrl, { replace: true });
            setDenyReason(null);
        } else if (decision.decision === 'DENY') {
            setDenyReason(decision.reason);
        } else {
            setDenyReason(null);
        }
    }, [location.pathname, location.search, permissions, navigate]);

    const activeTab = searchParams.get("tab") || (allowedTabs[0]?.key || "users");

    useEffect(() => {
        setPageKey("users");
    }, [setPageKey]);

    const handleTabChange = (val: string) => {
        if (!allowedTabKeys.includes(val)) return;
        setSearchParams({ tab: val });
    };

    if (denyReason) {
        return <Inline403 message={denyReason} />;
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground animate-in fade-in duration-500">
            <div className="px-8 pt-6">
                <PageHeader
                    heading="İstifadəçi İdarəetmə Paneli"
                    text="Sistem istifadəçiləri və səlahiyyətli kuratorları idarə edin."
                />
            </div>

            <div className="flex-1 p-8 pt-4 overflow-hidden min-w-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
                    <div className="border-b">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 gap-6">
                            {/* SAP-GRADE: Only render ALLOWED tabs */}
                            {allowedTabs.map(tab => {
                                const Icon = TAB_ICONS[tab.key] || Users;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </div>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    <TabsContent value="users" className="flex-1 overflow-auto pt-4 min-h-0">
                        <UsersListTab />
                    </TabsContent>
                    <TabsContent value="curators" className="flex-1 overflow-auto pt-4 min-h-0">
                        <CuratorsListTab />
                    </TabsContent>
                    {allowedTabKeys.includes('users') && (
                        <TabsContent value="users" className="flex-1 overflow-auto pt-4 min-h-0">
                            <UsersListTab />
                        </TabsContent>
                    )}
                    {allowedTabKeys.includes('curators') && (
                        <TabsContent value="curators" className="flex-1 overflow-auto pt-4 min-h-0">
                            <CuratorsListTab />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
client/src/domains/settings/SettingsPage.tsx
+69
-71

import { useState, useEffect } from "react"
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/app/auth/hooks/usePermissions"
import { PermissionSlugs } from "@/app/security/permission-slugs"
import { Inline403 } from "@/shared/components/security/Inline403"
// ...
import { WorkflowConfigTab } from "@/shared/components/ui/WorkflowConfigTab"
import { DictionariesTab } from "@/shared/components/ui/DictionariesTab"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/shared/components/ui/combobox"
import { PageHeader } from "@/shared/components/ui/page-header"
import { toast } from "sonner"
import {
    Settings,
    Shield,
    Mail,
    MessageSquare,
    FileText,
    Users,
    Database,
    Bell,
    CreditCard,
    ShieldCheck,
    Workflow,
    ListOrdered
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { evaluateRoute, getAllowedSubTabs, getAllowedTabs } from "@/app/security/navigationResolver"

// Existing Components
import RolesPage from "./RolesPage"

import {
    EmailSettingsTab,
    SmsSettingsTab,
    SecuritySettingsTab,
    NotificationsTab,
    ApprovalRulesTab,
    ApprovalSecurityTab,
    DocumentTemplatesTab,
    SSOSettingsTab,
    BillingConfigTab,
} from "./SettingsTabs"

const timezones = [
    { value: "Asia/Baku", label: "Asia/Baku (GMT+4)" },
    { value: "Europe/London", label: "Europe/London (GMT+0)" },
    { value: "Europe/Istanbul", label: "Europe/Istanbul (GMT+3)" },
    { value: "America/New_York", label: "America/New_York (GMT-5)" },
    { value: "Europe/Moscow", label: "Europe/Moscow (GMT+3)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
]

import { getSettingsTabsForUI } from "@/app/navigation/tabSubTab.registry";

// --- Sidebar Navigation Items ---
// Single Source of Truth from TAB_SUBTAB_REGISTRY
const ALL_SIDEBAR_ITEMS = getSettingsTabsForUI();

export default function SettingsPage() {
    const [timezone, setTimezone] = useState("Asia/Baku")
    const { can, isLoading } = usePermissions()
    const { permissions, isLoading } = usePermissions()
    const [searchParams, setSearchParams] = useSearchParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [denyReason, setDenyReason] = useState<string | null>(null)

    // Read initial tab from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get('tab') || 'general';
    const [activeTab, setActiveTab] = useState(urlTab);
    const allowedTabs = useMemo(() => getAllowedTabs('admin.settings', permissions, 'admin'), [permissions])
    const allowedTabKeys = useMemo(() => allowedTabs.map(t => t.key), [allowedTabs])
    const allowedDictionaryKeys = useMemo(() => (
        getAllowedSubTabs('admin.settings', 'dictionaries', permissions, 'admin').map(st => st.key)
    ), [permissions])

    // Handler for tab change - update local state AND URL
    const activeTab = searchParams.get('tab') || allowedTabKeys[0] || ''

    // Normalize tab query using resolver (no flicker)
    useEffect(() => {
        const decision = evaluateRoute(
            location.pathname,
            new URLSearchParams(location.search),
            permissions,
            'admin'
        )

        if (decision.decision === 'REDIRECT') {
            navigate(decision.normalizedUrl, { replace: true })
            setDenyReason(null)
        } else if (decision.decision === 'DENY') {
            setDenyReason(decision.reason)
        } else {
            setDenyReason(null)
        }
    }, [location.pathname, location.search, permissions, navigate])

    // Handler for tab change - update URL only for allowed tabs
    const handleTabChange = (tabId: string) => {
        console.log('[SettingsPage] Tab changing to:', tabId);
        setActiveTab(tabId);
        // Also update URL for bookmarkability
        const newUrl = `${window.location.pathname}?tab=${tabId}`;
        window.history.replaceState(null, '', newUrl);
    };
        if (!allowedTabKeys.includes(tabId)) return
        setSearchParams({ tab: tabId })
    }

    const visibleSidebarGroups = useMemo(() => (
        ALL_SIDEBAR_ITEMS.map(group => ({
            ...group,
            items: group.items
                .filter(item => allowedTabKeys.includes(item.id))
                .map(item => item.id === 'dictionaries'
                    ? { ...item, subItems: item.subItems?.filter(sub => allowedDictionaryKeys.includes(sub.id)) }
                    : item
                )
                .filter(item => item.id !== 'dictionaries' || (item.subItems ? item.subItems.length > 0 : true))
        })).filter(group => group.items.length > 0)
    ), [allowedTabKeys.join(','), allowedDictionaryKeys.join(',')])

    useEffect(() => {
        if (!activeTab && allowedTabKeys.length > 0) {
            setSearchParams({ tab: allowedTabKeys[0] })
        }
    }, [activeTab, allowedTabKeys, setSearchParams])

    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">İcazələr yoxlanılır...</p>
                </div>
            </div>
        )
    }

    // Filter Menu based on Permissions
    const visibleSidebarGroups = ALL_SIDEBAR_ITEMS.map(group => ({
        ...group,
        items: group.items.filter(item => {
            if (!item.permission) return true;
            const hasPermission = can(item.permission);
            // Debug dictionaries specifically
            if (item.id === 'dictionaries') {
                console.log('[SettingsPage] DICTIONARIES check:', {
                    id: item.id,
                    permission: item.permission,
                    hasPermission
                });
            }
            return hasPermission;
        })
    })).filter(group => group.items.length > 0);

    const allVisibleItems = visibleSidebarGroups.flatMap(g => g.items);
    const visibleIds = allVisibleItems.map(i => i.id);

    // After permissions load, validate URL tab and sync if needed
    useEffect(() => {
        const currentUrlTab = new URLSearchParams(window.location.search).get('tab');

        // If URL has a tab, check if it's valid (user has permission)
        if (currentUrlTab && visibleIds.includes(currentUrlTab)) {
            // URL tab is valid - use it
            if (activeTab !== currentUrlTab) {
                console.log('[SettingsPage] Syncing valid URL tab:', currentUrlTab);
                setActiveTab(currentUrlTab);
            }
        } else if (currentUrlTab && !visibleIds.includes(currentUrlTab) && visibleIds.length > 0) {
            // URL tab exists but user has no permission - fallback to first visible
            const fallback = visibleIds[0];
            console.log('[SettingsPage] URL tab not permitted, falling back to:', fallback);
            setActiveTab(fallback);
            // Update URL to reflect actual tab
            window.history.replaceState(null, '', `${window.location.pathname}?tab=${fallback}`);
        }
    }, [visibleIds.join(',')]); // Re-run when visible tabs change

    if (allVisibleItems.length === 0) {
    if (denyReason || allowedTabKeys.length === 0) {
        return (
            <div className="p-8">
                <Inline403 message="You do not have permission to view Settings." />
                <Inline403 message={denyReason || "You do not have permission to view Settings."} />
            </div>
        )
    }

    // Debug log
    console.log('[SettingsPage] Tab State:', { activeTab, visibleIds });

    return (
        <div className="flex flex-col min-h-[80vh] h-auto bg-background animate-in fade-in-50 duration-500">
            <div className="px-8 pt-6 flex-shrink-0">
                <PageHeader
                    heading="Sistem Tənzimləmələri"
                    text="Enterprise səviyyəli idarəetmə və konfiqurasiya paneli."
                />
            </div>

            <div className="flex flex-1 flex-col md:flex-row gap-8 p-8 pt-4 min-h-0">
                {/* SIDEBAR NAVIGATION */}
                <aside className="md:w-64 flex-shrink-0 space-y-8 overflow-y-auto pr-2">
                    {visibleSidebarGroups.map((group, idx) => (
                        <div key={idx} className="space-y-2">
                            <h4 className="text-sm font-semibold text-muted-foreground tracking-tight px-2 uppercase text-xs">{group.groupLabel}</h4>
                            <div className="grid gap-1">
                                {group.items.map((item) => (
                                    <Button
                                        key={item.id}
                                        variant={activeTab === item.id ? "secondary" : "ghost"}
                                        className={cn(
                                            "justify-start gap-2 h-9 w-48 overflow-hidden text-left",
                                            activeTab === item.id ? "bg-secondary font-medium text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                        onClick={() => {
@@ -233,130 +231,130 @@ export default function SettingsPage() {
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Dəstək Email</Label>
                                            <Input defaultValue="support@rqi.az" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Əlaqə Telefonu</Label>
                                            <Input defaultValue="+994 50 123 45 67" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={() => toast.success("Profil yeniləndi.")}>Yadda Saxla</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}


                        {/* 2. SMTP SETTINGS */}
                        {activeTab === 'smtp' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ) ? (
                            allowedTabKeys.includes('smtp') ? (
                                <EmailSettingsTab />
                            ) : <Inline403 />
                        )}

                        {/* 3. NOTIFICATIONS */}
                        {activeTab === 'notifications' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.NOTIFICATIONS.READ) ? (
                            allowedTabKeys.includes('notifications') ? (
                                <NotificationsTab />
                            ) : <Inline403 />
                        )}

                        {/* 5. SMS GATEWAY */}
                        {activeTab === 'sms' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ) ? (
                            allowedTabKeys.includes('sms') ? (
                                <SmsSettingsTab />
                            ) : <Inline403 />
                        )}

                        {/* 6. SECURITY */}
                        {activeTab === 'security' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.READ) ? (
                            allowedTabKeys.includes('security') ? (
                                <SecuritySettingsTab />
                            ) : <Inline403 />
                        )}
                        {activeTab === 'sso' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.READ) ? (
                            allowedTabKeys.includes('sso') ? (
                                <SSOSettingsTab />
                            ) : <Inline403 />
                        )}


                        {/* 7. APPROVALS HUB */}
                        {activeTab === 'approval-hub' && (
                            <div className="h-full flex flex-col">
                                <Tabs defaultValue="rules" className="h-full flex flex-col">
                                    <div className="border-b pb-4 mb-6">
                                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 gap-6">
                                            <TabsTrigger
                                                value="rules"
                                                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ListOrdered className="w-4 h-4" />
                                                    Təsdiq Qaydaları
                                                </div>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="policy"
                                                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4" />
                                                    Təhlükəsizlik Siyasəti
                                                </div>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="rules" className="flex-1 mt-0 border-0 p-0 overflow-visible data-[state=inactive]:hidden">
                                        <ApprovalRulesTab />
                                    </TabsContent>

                                    <TabsContent value="policy" className="flex-1 mt-0 border-0 p-0 overflow-visible data-[state=inactive]:hidden">
                                        <ApprovalSecurityTab />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}


                        {/* --- EXISTING TABS MIGRATED --- */}
                        {activeTab === 'billing_config' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.READ) ? (
                            allowedTabKeys.includes('billing_config') ? (
                                <BillingConfigTab />
                            ) : <Inline403 />
                        )}
                        {/* UPDATE: Ensure CONFIG.DICTIONARIES.READ matches strict key */}
                        {activeTab === 'dictionaries' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.READ) ? (
                            allowedTabKeys.includes('dictionaries') && allowedDictionaryKeys.length > 0 ? (
                                <DictionariesTab />
                            ) : <Inline403 />
                        )}
                        {activeTab === 'templates' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.TEMPLATES.READ) ? (
                            allowedTabKeys.includes('templates') ? (
                                <DocumentTemplatesTab />
                            ) : <Inline403 />
                        )}
                        {activeTab === 'workflow' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.WORKFLOW.READ) ? (
                            allowedTabKeys.includes('workflow') ? (
                                <WorkflowConfigTab />
                            ) : <Inline403 />
                        )}
                        {activeTab === 'roles' && (
                            can(PermissionSlugs.SYSTEM.ROLES.READ) ? (
                            allowedTabKeys.includes('roles') ? (
                                <RolesPage />
                            ) : <Inline403 />
                        )}

                    </div>
                </main>
            </div>
        </div>
    )
}
client/src/domains/system-console/ConsolePage.tsx
+41
-12

import React, { lazy, Suspense, useMemo } from "react";
import React, { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { useHelp } from "@/app/context/HelpContext";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldAlert, Server as ServerIcon, Activity, Database, Flag, MessageSquare, Wrench, LayoutDashboard } from "lucide-react";
import { ScrollableTabs } from "@/shared/components/ui/scrollable-tabs";
import { SystemHealthWidget, CacheManager, MaintenanceControls } from "./components/SystemDashboardWidgets";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedTabs } from "@/app/security/navigationResolver";
import { evaluateRoute, getAllowedTabs } from "@/app/security/navigationResolver";
import { Inline403 } from "@/shared/components/security/Inline403";

// Lazy load components
const MonitoringPage = lazy(() => import("@/domains/system-console/monitoring/views/MonitoringPage"));
const JobRegistryPage = lazy(() => import("@/domains/system-console/scheduler/views/JobRegistryPage"));
const RetentionPolicyPage = lazy(() => import("@/domains/system-console/maintenance/RetentionPolicyPage"));
const FeatureFlagsPage = lazy(() => import("@/domains/system-console/feature-flags/FeatureFlagsPage"));
const PolicyRulesPage = lazy(() => import("@/domains/system-console/maintenance/PolicyRulesPage"));
const FeedbackPage = lazy(() => import("@/domains/system-console/feedback/FeedbackPage"));
const AuditLogsPage = lazy(() => import("@/domains/system-console/audit-logs/AuditLogsPage"));
const SystemToolsTab = lazy(() => import("@/domains/system-console/tools/SystemToolsTab"));

// Tab icons
const TAB_ICONS: Record<string, React.ComponentType<any>> = {
    dashboard: LayoutDashboard,
    monitoring: Activity,
    audit: ShieldAlert,
    jobs: ServerIcon,
    retention: Database,
    features: Flag,
    policy: ShieldAlert,
    feedback: MessageSquare,
    tools: Wrench,
};

export default function SystemCorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageKey } = useHelp();
    const { permissions } = usePermissions();
    const [denyReason, setDenyReason] = useState<string | null>(null);

    React.useEffect(() => {
        setPageKey("sys-admin");
    }, [setPageKey]);

    // SAP-GRADE: Get allowed tabs from resolver (EXACT match)
    const allowedTabs = useMemo(() => {
        return getAllowedTabs('admin.console', permissions, 'admin');
    }, [permissions]);

    const allowedTabKeys = useMemo(() => allowedTabs.map(t => t.key), [allowedTabs]);

    useEffect(() => {
        const decision = evaluateRoute(
            location.pathname,
            new URLSearchParams(location.search),
            permissions,
            'admin'
        );

        if (decision.decision === 'REDIRECT') {
            navigate(decision.normalizedUrl, { replace: true });
            setDenyReason(null);
        } else if (decision.decision === 'DENY') {
            setDenyReason(decision.reason);
        } else {
            setDenyReason(null);
        }
    }, [location.pathname, location.search, permissions, navigate]);

    const currentTab = searchParams.get("tab") || (allowedTabs[0]?.key || "dashboard");

    const handleTabChange = (value: string) => {
        if (!allowedTabKeys.includes(value)) return;
        setSearchParams({ tab: value });
    };

    if (denyReason) {
        return <Inline403 message={denyReason} />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between shrink-0">
                <PageHeader
                    heading="System Console"
                    text="Sistem inzibatçısı paneli: Monitorinq, Scheduler, Təhlükəsizlik və Alətlər."
                />
            </div>

            <div className="space-y-6">
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <ScrollableTabs className="w-full border-b">
                        <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent space-x-6 border-b-0">
                            {/* SAP-GRADE: Only render ALLOWED tabs */}
                            {allowedTabs.map(tab => {
                                const Icon = TAB_ICONS[tab.key] || LayoutDashboard;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                                    >
                                        <Icon className="w-4 h-4 mr-2" /> {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </ScrollableTabs>

                    {/* Content Area */}
                    <div className="pt-4">
                        <Suspense fallback={<div className="p-8 text-center">Yüklənir...</div>}>
                            {currentTab === 'dashboard' && (
                            {currentTab === 'dashboard' && allowedTabKeys.includes('dashboard') && (
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                                        <SystemHealthWidget />
                                        <MaintenanceControls />
                                    </div>
                                    <div className="grid gap-6 grid-cols-1">
                                        <CacheManager />
                                    </div>
                                </div>
                            )}
                            {currentTab === 'monitoring' && <MonitoringPage />}
                            {currentTab === 'audit' && <AuditLogsPage />}
                            {currentTab === 'jobs' && <JobRegistryPage />}
                            {currentTab === 'retention' && <RetentionPolicyPage />}
                            {currentTab === 'features' && <FeatureFlagsPage />}
                            {currentTab === 'policy' && <PolicyRulesPage />}
                            {currentTab === 'feedback' && <FeedbackPage />}
                            {currentTab === 'tools' && <SystemToolsTab />}
                            {currentTab === 'monitoring' && allowedTabKeys.includes('monitoring') && <MonitoringPage />}
                            {currentTab === 'audit' && allowedTabKeys.includes('audit') && <AuditLogsPage />}
                            {currentTab === 'jobs' && allowedTabKeys.includes('jobs') && <JobRegistryPage />}
                            {currentTab === 'retention' && allowedTabKeys.includes('retention') && <RetentionPolicyPage />}
                            {currentTab === 'features' && allowedTabKeys.includes('features') && <FeatureFlagsPage />}
                            {currentTab === 'policy' && allowedTabKeys.includes('policy') && <PolicyRulesPage />}
                            {currentTab === 'feedback' && allowedTabKeys.includes('feedback') && <FeedbackPage />}
                            {currentTab === 'tools' && allowedTabKeys.includes('tools') && <SystemToolsTab />}
                        </Suspense>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
docs/RBAC_DELETE_OR_REFACTOR_LIST.md
New
+11
-0

## Delete
- client/src/app/security/rbacResolver.ts — legacy duplicate resolver that normalizes permissions and provides a second navigation API; keeping it invites drift from navigationResolver and violates the single decision point rule.

## Refactor
- client/src/domains/auth/utils/menu-visibility.ts — stop regex verb stripping and base-matching; delegate visibility to navigationResolver.
- client/src/domains/auth/utils/permissionPreviewEngine.ts — remove permission base stripping/prefix logic and align previews with the registry-driven resolver.
- client/src/domains/auth/context/AuthContext.tsx — replace startsWith()-based tenant/system detection with explicit allowlist or resolver outputs.
- client/src/app/security/risk-scoring.ts — remove startsWith()-based permission heuristics from scoring or move behind explicit allowlist input.
- client/src/app/security/sod-rules.ts — eliminate prefix-based comparisons when evaluating separation-of-duties rules.
- client/src/shared/components/ui/DictionariesTab.tsx — move off window.location mutation to router search params and reuse navigationResolver to prevent subTab flicker.
- client/src/app/navigation/tabSubTab.registry.spec.ts — update tests to assert exact permission matching (no verb stripping/inference) once refactors above are complete.
docs/RBAC_FINAL_ROOT_CAUSE.md
New
+1
-0

SAP-grade navigation drift was caused by competing authorization engines (navigationResolver vs rbacResolver/tabSubTab.normalizePermissions) and page-level tab renderers that ignored the resolver output; synthetic permission inference (action→read + verb stripping) treated deep-only grants as parent access while Billing, Console, Users, and Settings rendered hard-coded tabs and performed client-side clamping instead of resolver-driven redirects, so unauthorized tabs appeared in the DOM, triggered a momentary navigation to their query params, and then bounced to the first allowed tab, producing the observed flicker/"clamp" chain.
docs/RBAC_PATCH_PLAN.md
New
+6
-0

1) Consolidate navigation: remove client/src/app/security/rbacResolver.ts references, route everything through client/src/app/security/navigationResolver.ts, and update useMenu/RootRedirect/ProtectedRoute tests to assert single decision point.
2) Strip synthetic inference: ensure client/src/app/navigation/tabSubTab.registry.ts and client/src/app/auth/hooks/usePermissions.ts use exact permission sets (no verb stripping or read implication); refresh registry tests accordingly.
3) Page-level enforcement: migrate UsersPage, BillingPage, ConsolePage, and SettingsPage to render tabs/subTabs only from navigationResolver outputs and perform immediate normalize-on-load redirects via evaluateRoute.
4) Menu/preview engines: refactor client/src/domains/auth/utils/menu-visibility.ts and client/src/domains/auth/utils/permissionPreviewEngine.ts to delegate visibility to resolver helpers and drop regex base comparisons.
5) Deep permission UX: enhance DictionariesTab to read tab/subTab from router search params, call evaluateRoute for normalization, and hide sub-items not in getAllowedSubTabs.
6) Regression safety: add Playwright/manual scenarios for deep-only permissions (currency-only, curators-only, monitoring-dashboard-only) to verify no /access-denied flicker and correct tab/subTab visibility.


client/src/app/auth/hooks/usePermissions.ts
+15
-49

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Permission Hook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES:
 * 1. EXACT base match ONLY - NO prefix/startsWith
 * 2. NO child implies parent
 * 3. Uses TAB_SUBTAB_REGISTRY for tab checks
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useCallback } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import {
    getFirstAllowedTab,
    canAccessPage,
    TAB_SUBTAB_REGISTRY,
    normalizePermissions
} from '@/app/navigation/tabSubTab.registry';
import { getFirstAllowedTab, normalizePermissions } from '@/app/navigation/tabSubTab.registry';
import { getAllowedSubTabs, getAllowedTabs } from '@/app/security/navigationResolver';
import { useMemo } from 'react';

export const usePermissions = () => {
    const { permissions, user, isImpersonating, isLoading, activeTenantType } = useAuth();
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    /**
     * SAP-GRADE: Check if user has EXACT permission
     * NO prefix matching, NO child implies parent
     */
    const permissionSet = useMemo(() => new Set(normalizePermissions(permissions)), [permissions]);

    const can = useCallback((requiredPermission: string): boolean => {
        if (!requiredPermission) return false;

        const normalized = normalizePermissions(permissions);
        const reqBase = requiredPermission.replace(/\.(read|create|update|delete|view|access|manage|approve|export)$/, '');

        return normalized.some(userPerm => {
            const userBase = userPerm.replace(/\.(read|create|update|delete|view|access|manage|approve|export)$/, '');
            // EXACT base match ONLY
            return userBase === reqBase;
        });
    }, [permissions]);
        return permissionSet.has(requiredPermission);
    }, [permissionSet]);

    /**
     * SAP-GRADE: Check if user can access ANY of the permissions
     */
    const canAny = useCallback((slugs: string[]): boolean => {
        if (!slugs || slugs.length === 0) return true;
        return slugs.some(slug => can(slug));
    }, [can]);

    /**
     * SAP-GRADE: Check if user can access ALL of the permissions
     */
    const canAll = useCallback((slugs: string[]): boolean => {
        if (!slugs || slugs.length === 0) return true;
        return slugs.every(slug => can(slug));
    }, [can]);

    /**
     * SAP-GRADE: Check if user can access a specific tab/subTab
     * Uses frozen TAB_SUBTAB_REGISTRY
     * Uses frozen TAB_SUBTAB_REGISTRY via resolver helpers
     */
    const canForTab = useCallback((
        pageKey: string,
        tabKey?: string,
        subTabKey?: string
    ): boolean => {
        const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
        const page = pages.find(p => p.pageKey === pageKey);
        if (!page) return false;

        const normalized = normalizePermissions(permissions);

        const allowedTabs = getAllowedTabs(pageKey, permissions, context);
        if (!tabKey) {
            // Check if user can access ANY tab of the page
            return canAccessPage(pageKey, permissions, context);
            return allowedTabs.length > 0;
        }

        const tab = page.tabs.find(t => t.key === tabKey);
        if (!tab) return false;

        // Check tab permission
        const hasTabAccess = tab.requiredAnyOf.some(req => {
            const reqBase = req.replace(/\.(read|create|update|delete|approve|export)$/, '');
            return normalized.some(perm => {
                const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
                return permBase === reqBase;
            });
        });

        if (!hasTabAccess) return false;

        if (subTabKey && tab.subTabs) {
            const subTab = tab.subTabs.find(st => st.key === subTabKey);
            if (!subTab) return false;
        const tabAllowed = allowedTabs.some(t => t.key === tabKey);
        if (!tabAllowed) return false;

            return subTab.requiredAnyOf.some(req => {
                const reqBase = req.replace(/\.(read|create|update|delete|approve|export)$/, '');
                return normalized.some(perm => {
                    const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
                    return permBase === reqBase;
                });
            });
        if (subTabKey) {
            const allowedSubTabs = getAllowedSubTabs(pageKey, tabKey, permissions, context);
            return allowedSubTabs.some(st => st.key === subTabKey);
        }

        return true;
    }, [permissions, context]);

    /**
     * SAP-GRADE: Get first allowed tab for a page
     */
    const getFirstAllowedTabForPage = useCallback((pageKey: string) => {
        return getFirstAllowedTab(pageKey, permissions, context);
    }, [permissions, context]);

    // Legacy aliases for backward compatibility
    const hasPermission = can;
    const hasAll = canAll;
    const hasAny = canAny;

    return {
        can,
        canAny,
        canAll,
        canForTab,
        getFirstAllowedTabForPage,
        // Legacy aliases
        hasPermission,
client/src/app/navigation/tabSubTab.registry.spec.ts
+9
-11

/**
 * Unit Tests - TAB_SUBTAB Registry & Permission Preview Engine
 */

import { describe, it, expect } from 'vitest';
import {
    normalizePermissions,
    getFirstAllowedTab,
    canAccessPage
} from '@/app/navigation/tabSubTab.registry';
import { PermissionPreviewEngine } from '@/domains/auth/utils/permissionPreviewEngine';

describe('normalizePermissions', () => {
    it('should add read when write actions exist', () => {
    it('should return exact permissions without inference', () => {
        const perms = ['system.users.create', 'system.users.delete'];
        const normalized = normalizePermissions(perms);

        expect(normalized).toContain('system.users.create');
        expect(normalized).toContain('system.users.read'); // Implied
        expect(normalized).toEqual(expect.arrayContaining(perms));
        expect(normalized).not.toContain('system.users.read');
    });

    it('should not duplicate read', () => {
        const perms = ['system.users.read', 'system.users.update'];
    it('should dedupe identical entries', () => {
        const perms = ['system.users.read', 'system.users.read'];
        const normalized = normalizePermissions(perms);

        const readCount = normalized.filter(p => p === 'system.users.read').length;
        expect(readCount).toBe(1);
        expect(normalized).toEqual(['system.users.read']);
    });
});

describe('getFirstAllowedTab - Users Page', () => {
    it('curators-only user should land on curators tab', () => {
        const perms = ['system.users.curators.read'];
        const result = getFirstAllowedTab('admin.users', perms, 'admin');

        expect(result).toEqual({ tab: 'curators' });
    });

    it('users-only user should land on users tab', () => {
        const perms = ['system.users.users.read'];
        const result = getFirstAllowedTab('admin.users', perms, 'admin');

        expect(result).toEqual({ tab: 'users' });
    });

    it('both permissions - priority order (users first)', () => {
        const perms = ['system.users.users.read', 'system.users.curators.read'];
        const result = getFirstAllowedTab('admin.users', perms, 'admin');

        expect(result).toEqual({ tab: 'users' });
    });
});
@@ -63,34 +62,33 @@ describe('canAccessPage', () => {
        const perms: string[] = [];
        const result = canAccessPage('admin.users', perms, 'admin');

        expect(result).toBe(false);
    });
});

describe('PermissionPreviewEngine', () => {
    it('curators-only user sees Users menu with correct landing', () => {
        const perms = ['system.users.curators.read'];
        const result = PermissionPreviewEngine.run(perms, 'admin');

        const usersMenu = result.visibleMenus.find(m => m.menuId === 'admin.users');
        expect(usersMenu).toBeDefined();
        expect(usersMenu?.landingPath).toBe('/admin/users?tab=curators');
    });

    it('no permissions - access denied', () => {
        const perms: string[] = [];
        const result = PermissionPreviewEngine.run(perms, 'admin');

        expect(result.visibleMenus.length).toBe(0);
        expect(result.firstLandingPath).toBe('/access-denied');
    });

    it('write action implies read for navigation', () => {
        const perms = ['system.users.curators.create']; // No read, only create
    it('write-only permission without read denies navigation', () => {
        const perms = ['system.users.curators.create'];
        const result = PermissionPreviewEngine.run(perms, 'admin');

        // Should still be able to see Users page (read implied)
        const usersPage = result.pages.find(p => p.pageKey === 'admin.users');
        expect(usersPage?.allowed).toBe(true);
        expect(usersPage?.allowed).toBe(false);
    });
});
client/src/app/navigation/tabSubTab.registry.ts
+9
-36

@@ -23,73 +23,59 @@ export interface SubTabConfig {
    requiredAnyOf: string[];  // ANY grants entry
}

export interface TabConfig {
    key: string;
    label: string;
    requiredAnyOf: string[];  // ANY grants entry
    subTabs?: SubTabConfig[];
}

export interface PageConfig {
    pageKey: string;
    basePath: string;
    icon: string;
    label: string;
    labelAz: string;
    tabs: TabConfig[];  // Ordered by priority
}

export interface TabSubTabRegistry {
    admin: PageConfig[];
    tenant: PageConfig[];
}

// =============================================================================
// PERMISSION NORMALIZATION
// PERMISSION NORMALIZATION (EXACT, FROZEN)
// =============================================================================

/**
 * SAP-GRADE: If user has write/manage action, READ is implied
 * This ensures entry to list pages when user has create/update/delete
 * SAP-GRADE: NO inference, NO verb stripping.
 * Returns a deduped list of the original permissions only.
 */
export function normalizePermissions(permissions: string[]): string[] {
    const normalized = new Set(permissions);

    permissions.forEach(perm => {
        // Extract base and action
        const parts = perm.split('.');
        const action = parts[parts.length - 1];
        const base = parts.slice(0, -1).join('.');

        // If write action exists, add read
        if (['create', 'update', 'delete', 'manage', 'approve', 'export'].includes(action)) {
            normalized.add(`${base}.read`);
        }
    });

    return Array.from(normalized);
    return Array.from(new Set(permissions));
}

// =============================================================================
// ADMIN PANEL REGISTRY
// =============================================================================

const ADMIN_PAGES: PageConfig[] = [
    {
        pageKey: 'admin.dashboard',
        basePath: '/admin/dashboard',
        icon: 'LayoutDashboard',
        label: 'Dashboard',
        labelAz: 'İdarə Paneli',
        tabs: [
            // Dashboard: DB has system.dashboard.read + fallback to common permissions
            { key: 'overview', label: 'Overview', requiredAnyOf: ['system.dashboard.read', 'system.tenants.read', 'system.users.users.read', 'system.users.curators.read'] }
        ]
    },
    {
        pageKey: 'admin.tenants',
        basePath: '/admin/tenants',
        icon: 'Building2',
        label: 'Tenants',
        labelAz: 'Tenantlar',
        tabs: [
@@ -331,108 +317,95 @@ const TENANT_PAGES: PageConfig[] = [
    }
];

// =============================================================================
// EXPORT
// =============================================================================

export const TAB_SUBTAB_REGISTRY: TabSubTabRegistry = {
    admin: ADMIN_PAGES,
    tenant: TENANT_PAGES
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if user can access ANY tab of a page
 * EXACT base match only - NO startsWith
 */
export function canAccessPage(
    pageKey: string,
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): boolean {
    const normalized = normalizePermissions(userPermissions);
    const normalized = new Set(normalizePermissions(userPermissions));
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return false;

    return page.tabs.some(tab =>
        hasExactPermission(tab.requiredAnyOf, normalized)
        tab.requiredAnyOf.some(required => normalized.has(required))
    );
}

/**
 * Get first allowed tab for a page
 * EXACT base match only - NO startsWith
 */
export function getFirstAllowedTab(
    pageKey: string,
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): { tab: string; subTab?: string } | null {
    const normalized = normalizePermissions(userPermissions);
    const normalized = new Set(normalizePermissions(userPermissions));
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return null;

    for (const tab of page.tabs) {
        if (hasExactPermission(tab.requiredAnyOf, normalized)) {
        if (tab.requiredAnyOf.some(required => normalized.has(required))) {
            // Check subTabs if exist
            if (tab.subTabs && tab.subTabs.length > 0) {
                for (const subTab of tab.subTabs) {
                    if (hasExactPermission(subTab.requiredAnyOf, normalized)) {
                    if (subTab.requiredAnyOf.some(required => normalized.has(required))) {
                        return { tab: tab.key, subTab: subTab.key };
                    }
                }
                // If no subTab accessible, still return tab
                return { tab: tab.key };
            }
            return { tab: tab.key };
        }
    }

    return null;
}

/**
 * EXACT permission check helper - NO startsWith
 */
function hasExactPermission(requiredAnyOf: string[], normalizedPerms: string[]): boolean {
    return requiredAnyOf.some(required => {
        const reqBase = required.replace(/\.(read|create|update|delete|approve|export)$/, '');
        return normalizedPerms.some(perm => {
            const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');
            return permBase === reqBase;
        });
    });
}

/**
 * Build landing path for a page
 */
export function buildLandingPath(
    basePath: string,
    tabInfo: { tab: string; subTab?: string } | null
): string {
    if (!tabInfo) return basePath;

    let path = `${basePath}?tab=${tabInfo.tab}`;
    if (tabInfo.subTab) {
        path += `&subTab=${tabInfo.subTab}`;
    }
    return path;
}

/**
 * Get page config by path
 */
export function getPageByPath(
    path: string,
    context: 'admin' | 'tenant' = 'admin'
): PageConfig | undefined {
    const pages = context === 'admin' ? ADMIN_PAGES : TENANT_PAGES;
    return pages.find(p => path.startsWith(p.basePath));
client/src/app/security/navigationResolver.ts
+6
-4

@@ -20,106 +20,108 @@ import { TAB_SUBTAB_REGISTRY, type PageConfig, type TabConfig, type SubTabConfig
// ═══════════════════════════════════════════════════════════════════════════

export type RouteDecision =
    | { decision: 'ALLOW'; normalizedUrl: string }
    | { decision: 'REDIRECT'; normalizedUrl: string }
    | { decision: 'DENY'; reason: string };

export interface AllowedTab {
    key: string;
    label: string;
}

export interface AllowedSubTab {
    key: string;
    label: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Core Functions - EXACT MATCH ONLY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user has ANY of the required permissions (EXACT match)
 * NO inference, NO normalization
 */
function hasAnyPermission(userPerms: string[], requiredAnyOf: string[]): boolean {
function hasAnyPermission(userPerms: Set<string>, requiredAnyOf: string[]): boolean {
    if (!requiredAnyOf || requiredAnyOf.length === 0) return true;
    return requiredAnyOf.some(perm => userPerms.includes(perm));
    return requiredAnyOf.some(perm => userPerms.has(perm));
}

/**
 * Resolve pageKey from pathname using registry (EXACT path match)
 */
export function resolvePageByPath(
    pathname: string,
    context: 'admin' | 'tenant' = 'admin'
): string | null {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const basePath = pathname.split('?')[0];

    const page = pages.find(p => p.basePath === basePath);
    return page?.pageKey ?? null;
}

/**
 * Get allowed tabs for a page (EXACT permission match)
 */
export function getAllowedTabs(
    pageKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): AllowedTab[] {
    const permSet = new Set(userPerms);
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page?.tabs) return [];

    return page.tabs
        .filter(tab => hasAnyPermission(userPerms, tab.requiredAnyOf))
        .filter(tab => hasAnyPermission(permSet, tab.requiredAnyOf))
        .map(tab => ({ key: tab.key, label: tab.label }));
}

/**
 * Get allowed subTabs for a tab (EXACT permission match)
 */
export function getAllowedSubTabs(
    pageKey: string,
    tabKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): AllowedSubTab[] {
    const permSet = new Set(userPerms);
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page?.tabs) return [];

    const tab = page.tabs.find(t => t.key === tabKey);
    if (!tab?.subTabs) return [];

    return tab.subTabs
        .filter(st => hasAnyPermission(userPerms, st.requiredAnyOf))
        .filter(st => hasAnyPermission(permSet, st.requiredAnyOf))
        .map(st => ({ key: st.key, label: st.label }));
}

/**
 * Get first allowed target URL for a page
 */
export function getFirstAllowedTarget(
    pageKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): string | null {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return null;

    const allowedTabs = getAllowedTabs(pageKey, userPerms, context);
    if (allowedTabs.length === 0) return null;

    const firstTab = allowedTabs[0];
    const allowedSubTabs = getAllowedSubTabs(pageKey, firstTab.key, userPerms, context);

    if (allowedSubTabs.length > 0) {
        return `${page.basePath}?tab=${firstTab.key}&subTab=${allowedSubTabs[0].key}`;
    }
client/src/app/security/rbacResolver.ts
+23
-281

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade RBAC Resolver
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SINGLE SOURCE OF TRUTH: TAB_SUBTAB_REGISTRY
 * 
 * Rules:
 * 1. EXACT permission match only
 * 2. NO startsWith/prefix matching
 * 3. NO synthetic .access permissions
 * 4. Flicker-free: redirect to allowed tab if exists
 * 5. Terminal 403 ONLY if zero allowed tabs
 * ═══════════════════════════════════════════════════════════════════════════
 * Thin compatibility layer that delegates to navigationResolver.
 * This keeps a single decision engine while preserving legacy imports.
 */

import {
    TAB_SUBTAB_REGISTRY,
    getPageByPath,
    type PageConfig,
    type TabConfig
} from '@/app/navigation/tabSubTab.registry';
    evaluateRoute,
    getAllowedTabs as resolverAllowedTabs,
    getAllowedSubTabs as resolverAllowedSubTabs,
    getPageConfig,
    getFirstAllowedTarget,
    type RouteDecision,
} from './navigationResolver';
import { normalizePermissions } from '@/app/navigation/tabSubTab.registry';

export type NavigationDecision = RouteDecision;
export { normalizePermissions, getPageConfig as resolvePageByPath, getFirstAllowedTarget };

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ResolvedLocation {
    pathname: string;
    search: string;
}

export interface Terminal403 {
    terminal403: true;
    reason: string;
}

export type SafeLocationResult = ResolvedLocation | Terminal403;

// ═══════════════════════════════════════════════════════════════════════════
// Permission Normalization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize raw permissions to a Set for fast lookup.
 * ONLY verb aliasing allowed (view → read).
 * NO synthetic permissions, NO parent inference.
 */
export function normalizePermissions(rawPerms: string[]): Set<string> {
    const normalized = new Set<string>();

    for (const perm of rawPerms) {
        normalized.add(perm);

        // Verb aliasing: .view → .read (for legacy compatibility)
        if (perm.endsWith('.view')) {
            normalized.add(perm.replace('.view', '.read'));
        }

        // Action normalization: write actions imply read
        const writeActions = ['.create', '.update', '.delete', '.approve', '.export'];
        for (const action of writeActions) {
            if (perm.endsWith(action)) {
                const basePerm = perm.slice(0, -action.length) + '.read';
                normalized.add(basePerm);
            }
        }
    }

    return normalized;
}

// ═══════════════════════════════════════════════════════════════════════════
// Page Key Resolution
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get pageKey from pathname.
 * Returns null if page not in registry.
 */
export function getPageKeyFromPath(pathname: string, context: 'admin' | 'tenant' = 'admin'): string | null {
    const page = getPageByPath(pathname, context);
    return page?.pageKey || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Allowed Tabs/SubTabs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user has ANY of the required permissions (exact match).
 */
function hasAnyPermission(perms: Set<string>, requiredAnyOf: string[]): boolean {
    if (!requiredAnyOf || requiredAnyOf.length === 0) return true;
    return requiredAnyOf.some(p => perms.has(p));
}

/**
 * Get allowed tabs for a page (exact permission match).
 */
export function getAllowedTabs(params: {
    pageKey: string;
    perms: Set<string>;
    perms: Set<string> | string[];
    context?: 'admin' | 'tenant';
}): string[] {
    const { pageKey, perms, context = 'admin' } = params;
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page || !page.tabs) return [];

    return page.tabs
        .filter(tab => hasAnyPermission(perms, tab.requiredAnyOf))
        .map(tab => tab.key);
    const permsArray = Array.isArray(params.perms) ? params.perms : Array.from(params.perms);
    return resolverAllowedTabs(params.pageKey, permsArray, params.context).map(t => t.key);
}

/**
 * Get allowed subTabs for a tab (exact permission match).
 */
export function getAllowedSubTabs(params: {
    pageKey: string;
    tabKey: string;
    perms: Set<string>;
    perms: Set<string> | string[];
    context?: 'admin' | 'tenant';
}): string[] {
    const { pageKey, tabKey, perms, context = 'admin' } = params;
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page || !page.tabs) return [];

    const tab = page.tabs.find(t => t.key === tabKey);
    if (!tab || !tab.subTabs) return [];

    return tab.subTabs
        .filter(st => hasAnyPermission(perms, st.requiredAnyOf))
        .map(st => st.key);
}

// ═══════════════════════════════════════════════════════════════════════════
// Safe Location Resolution (Flicker-Free)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resolve safe location for navigation.
 * - If user has allowed tab → redirect to it (no 403)
 * - If zero allowed tabs → terminal 403
 */
export function resolveSafeLocation(params: {
    pathname: string;
    search: string;
    perms: Set<string>;
    context?: 'admin' | 'tenant';
}): SafeLocationResult {
    const { pathname, search, perms, context = 'admin' } = params;

    const basePath = pathname.split('?')[0];
    const searchParams = new URLSearchParams(search);
    const currentTab = searchParams.get('tab');
    const currentSubTab = searchParams.get('subTab');

    const pageKey = getPageKeyFromPath(basePath, context);

    // Not in registry - allow (let ProtectedRoute handle with props)
    if (!pageKey) {
        return { pathname, search };
    }

    const allowedTabs = getAllowedTabs({ pageKey, perms, context });

    // TERMINAL 403: No allowed tabs at all
    if (allowedTabs.length === 0) {
        return {
            terminal403: true,
            reason: `No allowed tabs for page: ${pageKey}`
        };
    }

    const firstAllowedTab = allowedTabs[0];

    // No tab specified → redirect to first allowed
    if (!currentTab) {
        const allowedSubTabs = getAllowedSubTabs({ pageKey, tabKey: firstAllowedTab, perms, context });
        const subTabParam = allowedSubTabs.length > 0 ? `&subTab=${allowedSubTabs[0]}` : '';
        return {
            pathname: basePath,
            search: `?tab=${firstAllowedTab}${subTabParam}`
        };
    }

    // Tab not allowed → redirect to first allowed (NO FLICKER)
    if (!allowedTabs.includes(currentTab)) {
        const allowedSubTabs = getAllowedSubTabs({ pageKey, tabKey: firstAllowedTab, perms, context });
        const subTabParam = allowedSubTabs.length > 0 ? `&subTab=${allowedSubTabs[0]}` : '';
        return {
            pathname: basePath,
            search: `?tab=${firstAllowedTab}${subTabParam}`
        };
    }

    // Tab is allowed, check subTab if present
    if (currentSubTab) {
        const allowedSubTabs = getAllowedSubTabs({ pageKey, tabKey: currentTab, perms, context });

        if (allowedSubTabs.length > 0 && !allowedSubTabs.includes(currentSubTab)) {
            // SubTab not allowed → redirect to first allowed subTab
            return {
                pathname: basePath,
                search: `?tab=${currentTab}&subTab=${allowedSubTabs[0]}`
            };
        }
    }

    // All good - return as-is
    return { pathname, search };
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper: Is terminal 403 result?
// ═══════════════════════════════════════════════════════════════════════════

export function isTerminal403(result: SafeLocationResult): result is Terminal403 {
    return 'terminal403' in result && result.terminal403 === true;
    const permsArray = Array.isArray(params.perms) ? params.perms : Array.from(params.perms);
    return resolverAllowedSubTabs(params.pageKey, params.tabKey, permsArray, params.context).map(st => st.key);
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper: Build URL from safe location
// ═══════════════════════════════════════════════════════════════════════════

export function buildUrl(location: ResolvedLocation): string {
    return `${location.pathname}${location.search}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// evaluateNavigation - Main API for ProtectedRoute
// ═══════════════════════════════════════════════════════════════════════════

export type NavigationDecision =
    | { decision: 'allow' }
    | { decision: 'redirect'; redirectTo: string }
    | { decision: 'deny'; reason: string };

/**
 * Evaluate navigation and return decision.
 * This is the SINGLE entry point for route guards.
 */
export function evaluateNavigation(params: {
    pathname: string;
    search: string;
    perms: Set<string>;
    perms: Set<string> | string[];
    context?: 'admin' | 'tenant';
}): NavigationDecision {
    const result = resolveSafeLocation(params);

    if (isTerminal403(result)) {
        return { decision: 'deny', reason: result.reason };
    }

    const currentUrl = `${params.pathname}${params.search}`;
    const safeUrl = buildUrl(result);

    if (currentUrl !== safeUrl) {
        return { decision: 'redirect', redirectTo: safeUrl };
    }

    return { decision: 'allow' };
    const permsArray = Array.isArray(params.perms) ? params.perms : Array.from(params.perms);
    const searchParams = new URLSearchParams(params.search);
    return evaluateRoute(params.pathname, searchParams, permsArray, params.context);
}

// ═══════════════════════════════════════════════════════════════════════════
// firstAllowedTarget - For sidebar links
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the first allowed target URL for a page.
 * Used for sidebar item links.
 */
export function firstAllowedTarget(params: {
    pageKey: string;
    basePath: string;
    perms: Set<string>;
    context?: 'admin' | 'tenant';
}): string | null {
    const { pageKey, basePath, perms, context = 'admin' } = params;
    const allowedTabs = getAllowedTabs({ pageKey, perms, context });

    if (allowedTabs.length === 0) return null;

    const firstTab = allowedTabs[0];
    const allowedSubTabs = getAllowedSubTabs({ pageKey, tabKey: firstTab, perms, context });

    if (allowedSubTabs.length > 0) {
        return `${basePath}?tab=${firstTab}&subTab=${allowedSubTabs[0]}`;
    }

    return `${basePath}?tab=${firstTab}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// resolvePageByPath - Get page config from path
// ═══════════════════════════════════════════════════════════════════════════

export function resolvePageByPath(pathname: string, context: 'admin' | 'tenant' = 'admin'): PageConfig | null {
    return getPageByPath(pathname, context) ?? null;
}

client/src/domains/auth/utils/menu-visibility.ts
+4
-35

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Menu Visibility Engine
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SINGLE SOURCE OF TRUTH: TAB_SUBTAB_REGISTRY
 * 
 * Rules:
 * 1. Menu is visible ONLY if user has at least ONE allowed tab
 * 2. NO prefix matching
 * 3. NO permission guessing
 * 4. Visibility == Actionability (SAP principle)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { MenuItem } from "@/app/navigation/menu.definitions";
import {
    TAB_SUBTAB_REGISTRY,
    normalizePermissions,
    type PageConfig
} from "@/app/navigation/tabSubTab.registry";
import { TAB_SUBTAB_REGISTRY } from "@/app/navigation/tabSubTab.registry";
import { getAllowedTabs } from "@/app/security/navigationResolver";

export class MenuVisibilityEngine {

    /**
     * SAP-GRADE: Compute visible menu using frozen registry.
     * 
     * A page is visible if user has ANY allowed tab under it.
     * NO prefix matching - exact permission check only.
     */
    static computeVisibleTree(menu: MenuItem[], userPermissions: string[]): MenuItem[] {
        if (!menu || !userPermissions || userPermissions.length === 0) {
            return [];
        }

        const normalizedPerms = normalizePermissions(userPermissions);
        const context = menu.some(m => m.path?.startsWith('/admin')) ? 'admin' : 'tenant';
        const registry = context === 'admin'
            ? TAB_SUBTAB_REGISTRY.admin
            : TAB_SUBTAB_REGISTRY.tenant;

        return menu.filter(item => {
            // Find page in registry using pageKey or path
            const pageConfig = this.findPageConfig(item, registry);

            if (!pageConfig) {
                // No registry entry = hidden (strict mode)
                return false;
            }

            // SAP-GRADE: visible if ANY tab is accessible
            return this.hasAnyAllowedTab(pageConfig, normalizedPerms);
            const allowedTabs = getAllowedTabs(pageConfig.pageKey, userPermissions, context);
            return allowedTabs.length > 0;
        });
    }

    /**
     * Find page config by pageKey or path
     */
    private static findPageConfig(item: MenuItem, registry: PageConfig[]): PageConfig | undefined {
        // First try pageKey
        if ('pageKey' in item && item.pageKey) {
            return registry.find(p => p.pageKey === item.pageKey);
        }

        // Fallback to path match
        const basePath = item.path?.split('?')[0];
        return registry.find(p => p.basePath === basePath);
    }

    /**
     * SAP-GRADE: Check if user has ANY allowed tab under this page.
     * NO prefix matching - explicit permission check.
     */
    private static hasAnyAllowedTab(page: PageConfig, normalizedPerms: string[]): boolean {
        return page.tabs.some(tab =>
            this.hasExactPermission(tab.requiredAnyOf, normalizedPerms)
        );
    }

    /**
     * EXACT permission check - NO hierarchical prefix matching.
     * 
     * Match rules:
     * 1. EXACT base match ONLY: permission bases must be equal
     * 2. NO startsWith - this prevents sibling pollution
     */
    private static hasExactPermission(
        requiredAnyOf: string[],
        normalizedPerms: string[]
    ): boolean {
        return requiredAnyOf.some(required => {
            const reqBase = required.replace(/\.(read|create|update|delete|approve|export)$/, '');

            return normalizedPerms.some(perm => {
                const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');

                // EXACT base match ONLY - no hierarchical expansion
                return permBase === reqBase;
            });
        });
    }
}
client/src/domains/auth/utils/permissionPreviewEngine.ts
+5
-17

@@ -206,79 +206,67 @@ export class PermissionPreviewEngine {
    ): SubTabPreviewResult {
        const hasAccess = this.checkAccess(subTab.requiredAnyOf, normalizedPerms);
        const matchedPerm = this.findMatchingPerm(subTab.requiredAnyOf, normalizedPerms);

        return {
            subTabKey: subTab.key,
            label: subTab.label,
            allowed: hasAccess,
            reason: hasAccess
                ? `allowed_by:${matchedPerm}`
                : `missing:${subTab.requiredAnyOf.join(',')}`
        };
    }

    /**
     * Check if user has ANY of the required permissions
     */
    /**
     * SAP-GRADE: EXACT permission match only
     * NO startsWith, NO prefix inference
     */
    private static checkAccess(
        requiredAnyOf: string[],
        normalizedPerms: string[]
    ): boolean {
        return requiredAnyOf.some(req =>
            normalizedPerms.some(perm => {
                // Exact base match (strip action verb)
                const reqBase = req.replace(/\.(read|view|create|update|delete|export|approve)$/, '');
                const permBase = perm.replace(/\.(read|view|create|update|delete|export|approve)$/, '');
                return reqBase === permBase;
            })
        );
        const permSet = new Set(normalizedPerms);
        return requiredAnyOf.some(req => permSet.has(req));
    }

    /**
     * Find which permission grants access
     */
    /**
     * SAP-GRADE: Find matching permission with EXACT base match
     */
    private static findMatchingPerm(
        requiredAnyOf: string[],
        normalizedPerms: string[]
    ): string | null {
        for (const req of requiredAnyOf) {
            const reqBase = req.replace(/\.(read|view|create|update|delete|export|approve)$/, '');
            const match = normalizedPerms.find(perm => {
                const permBase = perm.replace(/\.(read|view|create|update|delete|export|approve)$/, '');
                return reqBase === permBase;
            });
            if (match) return match;
        }
        return null;
        const permSet = new Set(normalizedPerms);
        const match = requiredAnyOf.find(req => permSet.has(req));
        return match ?? null;
    }

    /**
     * Collect missing permissions for denied page
     */
    private static collectMissingPerms(
        page: PageConfig,
        normalizedPerms: string[]
    ): string[] {
        const missing: string[] = [];

        for (const tab of page.tabs) {
            if (!this.checkAccess(tab.requiredAnyOf, normalizedPerms)) {
                missing.push(...tab.requiredAnyOf);
            }
        }

        return [...new Set(missing)];
    }
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

client/src/domains/billing/views/BillingPage.tsx
+73
-52

@@ -287,144 +287,165 @@ const PACKAGES = [

// --- BADGE HELPER ---
const getBadgeVariant = (type: ProductType) => {
    switch (type) {
        case "Modul": return "default"; // Primary
        case "İnteqrasiya": return "secondary";
        case "Funksiya": return "outline";
        case "Təhlükəsizlik": return "destructive";
        default: return "secondary";
    }
};

const getBadgeIcon = (type: ProductType) => {
    switch (type) {
        case "Modul": return Box;
        case "İnteqrasiya": return Link2;
        case "Funksiya": return Zap;
        case "Təhlükəsizlik": return Shield;
        default: return Boxes;
    }
};

import { PageHeader } from "@/shared/components/ui/page-header";

import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { useEffect, useMemo } from "react";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedTabs, normalizePermissions } from "@/app/security/rbacResolver";
import { getAllowedTabs } from "@/app/security/navigationResolver";

// Tab configuration for filtering
const BILLING_TABS = [
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { key: 'packages', label: 'Kompakt Paketlər', icon: Package },
    { key: 'subscriptions', label: 'Abunəlik Planları', icon: CreditCard },
    { key: 'invoices', label: 'Fakturalar', icon: BarChart3 },
    { key: 'licenses', label: 'Lisenziyalar', icon: Shield },
];

export default function BillingPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { permissions } = usePermissions();

    // SAP-GRADE: Get allowed tabs from resolver
    const allowedTabKeys = useMemo(() => {
        const permSet = normalizePermissions(permissions);
        return getAllowedTabs({
            pageKey: 'admin.billing',
            perms: permSet,
            context: 'admin'
        });
    const allowedTabs = useMemo(() => {
        return getAllowedTabs('admin.billing', permissions, 'admin');
    }, [permissions]);

    // Filter visible tabs
    const visibleTabs = useMemo(() => {
        return BILLING_TABS.filter(tab => allowedTabKeys.includes(tab.key));
    }, [allowedTabKeys]);
        const allowedKeys = allowedTabs.map(t => t.key);
        return BILLING_TABS.filter(tab => allowedKeys.includes(tab.key));
    }, [allowedTabs]);

    const allowedKeys = visibleTabs.map(t => t.key);
    const currentParam = searchParams.get("tab");
    const clampedTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : allowedKeys[0];

    useEffect(() => {
        if (clampedTab && clampedTab !== currentParam) {
            setSearchParams({ tab: clampedTab });
        }
    }, [clampedTab, currentParam, setSearchParams]);

    const activeTab = searchParams.get("tab") || (visibleTabs[0]?.key || "marketplace");
    const activeTab = clampedTab;

    const handleTabChange = (val: string) => {
        setSearchParams({ tab: val });
        if (allowedKeys.includes(val)) {
            setSearchParams({ tab: val });
        }
    };

    if (!activeTab) {
        return (
            <div className="p-8">
                <h3 className="text-lg font-semibold">Access restricted</h3>
                <p className="text-sm text-muted-foreground">You do not have permission to view Billing.</p>
            </div>
        );
    }


    return (
        <div className="flex flex-col min-h-[80vh] h-auto bg-background animate-in fade-in-50 duration-500">
            <div className="px-8 pt-6 flex-shrink-0">
                <PageHeader
                    heading="Biling və Marketplace"
                    text="Məhsul, paket və abunəliklərin mərkəzləşdirilmiş idarəetməsi."
                />
            </div>

            <div className="flex-1 p-8 pt-4 overflow-hidden min-w-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full flex flex-col">
                    <div className="border-b flex-shrink-0">
                        <TabsList className="w-full justify-start border-b-0 rounded-none bg-transparent p-0 h-auto gap-6">
                            <TabsTrigger value="marketplace" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <ShoppingBag className="mr-2 h-4 w-4" /> Marketplace
                            </TabsTrigger>
                            <TabsTrigger value="packages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <Package className="mr-2 h-4 w-4" /> Kompakt Paketlər
                            </TabsTrigger>
                            <TabsTrigger value="subscriptions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <CreditCard className="mr-2 h-4 w-4" /> Abunəlik Planları
                            </TabsTrigger>
                            <TabsTrigger value="invoices" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <BarChart3 className="mr-2 h-4 w-4" /> Fakturalar
                            </TabsTrigger>
                            <TabsTrigger value="licenses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3">
                                <Shield className="mr-2 h-4 w-4" /> Lisenziyalar
                            </TabsTrigger>
                            {visibleTabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-3"
                                    >
                                        <Icon className="mr-2 h-4 w-4" /> {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    {/* --- MARKETPLACE TAB --- */}
                    <TabsContent value="marketplace" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <MarketplaceView />
                    </TabsContent>

                    {/* --- PACKAGES TAB --- */}
                    <TabsContent value="packages" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <PackagesView />
                    </TabsContent>

                    {/* --- SUBSCRIPTIONS TAB --- */}
                    <TabsContent value="subscriptions" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <SubscriptionsView />
                    </TabsContent>

                    {/* --- INVOICES TAB --- */}
                    <TabsContent value="invoices" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <InvoicesView />
                    </TabsContent>

                    {/* --- LICENSES TAB --- */}
                    <TabsContent value="licenses" className="flex-1 overflow-y-auto pt-6 min-h-0">
                        <LicensesView />
                    </TabsContent>
                    {allowedKeys.includes('marketplace') && (
                        <TabsContent value="marketplace" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <MarketplaceView />
                        </TabsContent>
                    )}

                    {allowedKeys.includes('packages') && (
                        <TabsContent value="packages" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <PackagesView />
                        </TabsContent>
                    )}

                    {allowedKeys.includes('subscriptions') && (
                        <TabsContent value="subscriptions" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <SubscriptionsView />
                        </TabsContent>
                    )}

                    {allowedKeys.includes('invoices') && (
                        <TabsContent value="invoices" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <InvoicesView />
                        </TabsContent>
                    )}

                    {allowedKeys.includes('licenses') && (
                        <TabsContent value="licenses" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <LicensesView />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function MarketplaceView() {
    // Data State
    const [products, setProducts] = useState<Product[]>(MARKETPLACE_FEATURES);

    // UI State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("All");

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
client/src/domains/identity/views/UsersPage.tsx
+30
-7

@@ -3,78 +3,101 @@ import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldAlert } from "lucide-react";
import { UsersListTab } from "./UsersListTab";
import { CuratorsListTab } from "./CuratorsListTab";
import { useSearchParams } from "react-router-dom";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedTabs } from "@/app/security/navigationResolver";
import { useHelp } from "@/app/context/HelpContext";
import { useEffect, useMemo } from "react";

// Tab icons
const TAB_ICONS: Record<string, React.ComponentType<any>> = {
    users: Users,
    curators: ShieldAlert,
};

export default function UsersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageKey } = useHelp();
    const { permissions } = usePermissions();

    // SAP-GRADE: Get allowed tabs from resolver (EXACT match)
    const allowedTabs = useMemo(() => {
        return getAllowedTabs('admin.users', permissions, 'admin');
    }, [permissions]);

    const activeTab = searchParams.get("tab") || (allowedTabs[0]?.key || "users");
    const allowedKeys = allowedTabs.map(t => t.key);
    const currentParam = searchParams.get("tab");
    const activeTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : allowedKeys[0];

    useEffect(() => {
        if (activeTab && activeTab !== currentParam) {
            setSearchParams({ tab: activeTab });
        }
    }, [activeTab, currentParam, setSearchParams]);

    useEffect(() => {
        setPageKey("users");
    }, [setPageKey]);

    const handleTabChange = (val: string) => {
        setSearchParams({ tab: val });
    };

    if (!activeTab) {
        return (
            <div className="p-8">
                <h3 className="text-lg font-semibold">Access restricted</h3>
                <p className="text-sm text-muted-foreground">You do not have permission to view Users.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground animate-in fade-in duration-500">
            <div className="px-8 pt-6">
                <PageHeader
                    heading="İstifadəçi İdarəetmə Paneli"
                    text="Sistem istifadəçiləri və səlahiyyətli kuratorları idarə edin."
                />
            </div>

            <div className="flex-1 p-8 pt-4 overflow-hidden min-w-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
                    <div className="border-b">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 gap-6">
                            {/* SAP-GRADE: Only render ALLOWED tabs */}
                            {allowedTabs.map(tab => {
                                const Icon = TAB_ICONS[tab.key] || Users;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </div>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    <TabsContent value="users" className="flex-1 overflow-auto pt-4 min-h-0">
                        <UsersListTab />
                    </TabsContent>
                    <TabsContent value="curators" className="flex-1 overflow-auto pt-4 min-h-0">
                        <CuratorsListTab />
                    </TabsContent>
                    {allowedKeys.includes('users') && (
                        <TabsContent value="users" className="flex-1 overflow-auto pt-4 min-h-0">
                            <UsersListTab />
                        </TabsContent>
                    )}
                    {allowedKeys.includes('curators') && (
                        <TabsContent value="curators" className="flex-1 overflow-auto pt-4 min-h-0">
                            <CuratorsListTab />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
client/src/domains/settings/SettingsPage.tsx
+42
-50

import { useState, useEffect } from "react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/app/auth/hooks/usePermissions"
import { PermissionSlugs } from "@/app/security/permission-slugs"
import { Inline403 } from "@/shared/components/security/Inline403"
// ...
import { WorkflowConfigTab } from "@/shared/components/ui/WorkflowConfigTab"
import { DictionariesTab } from "@/shared/components/ui/DictionariesTab"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/shared/components/ui/combobox"
import { PageHeader } from "@/shared/components/ui/page-header"
import { toast } from "sonner"
import { useSearchParams } from "react-router-dom"
import {
    Settings,
    Shield,
    Mail,
    MessageSquare,
    FileText,
    Users,
    Database,
    Bell,
    CreditCard,
    ShieldCheck,
    Workflow,
    ListOrdered
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Existing Components
import RolesPage from "./RolesPage"

import {
    EmailSettingsTab,
    SmsSettingsTab,
    SecuritySettingsTab,
    NotificationsTab,
    ApprovalRulesTab,
    ApprovalSecurityTab,
    DocumentTemplatesTab,
    SSOSettingsTab,
    BillingConfigTab,
} from "./SettingsTabs"

const timezones = [
    { value: "Asia/Baku", label: "Asia/Baku (GMT+4)" },
    { value: "Europe/London", label: "Europe/London (GMT+0)" },
    { value: "Europe/Istanbul", label: "Europe/Istanbul (GMT+3)" },
    { value: "America/New_York", label: "America/New_York (GMT-5)" },
    { value: "Europe/Moscow", label: "Europe/Moscow (GMT+3)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
]

import { getSettingsTabsForUI } from "@/app/navigation/tabSubTab.registry";
import { getAllowedSubTabs, getAllowedTabs } from "@/app/security/navigationResolver";

// --- Sidebar Navigation Items ---
// Single Source of Truth from TAB_SUBTAB_REGISTRY
const ALL_SIDEBAR_ITEMS = getSettingsTabsForUI();

export default function SettingsPage() {
    const [timezone, setTimezone] = useState("Asia/Baku")
    const { can, isLoading } = usePermissions()
    const { permissions, isLoading } = usePermissions()
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial tab from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get('tab') || 'general';
    const [activeTab, setActiveTab] = useState(urlTab);
    const allowedTabs = useMemo(() => getAllowedTabs('admin.settings', permissions, 'admin'), [permissions]);
    const allowedTabKeys = useMemo(() => allowedTabs.map(t => t.key), [allowedTabs]);

    const allowedDictionarySubTabs = useMemo(() => (
        getAllowedSubTabs('admin.settings', 'dictionaries', permissions, 'admin')
    ), [permissions]);
    const allowedDictionaryKeys = useMemo(() => allowedDictionarySubTabs.map(st => st.key), [allowedDictionarySubTabs]);

    const currentParam = searchParams.get('tab');
    const activeTab = currentParam && allowedTabKeys.includes(currentParam)
        ? currentParam
        : allowedTabKeys[0];

    useEffect(() => {
        if (activeTab && activeTab !== currentParam) {
            setSearchParams({ tab: activeTab });
        }
    }, [activeTab, currentParam, setSearchParams]);

    // Handler for tab change - update local state AND URL
    const handleTabChange = (tabId: string) => {
        console.log('[SettingsPage] Tab changing to:', tabId);
        setActiveTab(tabId);
        // Also update URL for bookmarkability
        const newUrl = `${window.location.pathname}?tab=${tabId}`;
        window.history.replaceState(null, '', newUrl);
        if (allowedTabKeys.includes(tabId)) {
            setSearchParams({ tab: tabId });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">İcazələr yoxlanılır...</p>
                </div>
            </div>
        )
    }

    // Filter Menu based on Permissions
    const visibleSidebarGroups = ALL_SIDEBAR_ITEMS.map(group => ({
        ...group,
        items: group.items.filter(item => {
            if (!item.permission) return true;
            const hasPermission = can(item.permission);
            // Debug dictionaries specifically
            if (item.id === 'dictionaries') {
                console.log('[SettingsPage] DICTIONARIES check:', {
                    id: item.id,
                    permission: item.permission,
                    hasPermission
                });
            }
            return hasPermission;
        })
    })).filter(group => group.items.length > 0);
    const visibleSidebarGroups = useMemo(() => {
        return ALL_SIDEBAR_ITEMS.map(group => {
            const filteredItems = group.items
                .filter(item => allowedTabKeys.includes(item.id))
                .map(item => {
                    if (item.id === 'dictionaries' && item.subItems) {
                        const subItems = item.subItems.filter(sub => allowedDictionaryKeys.includes(sub.id));
                        return { ...item, subItems };
                    }
                    return item;
                })
                .filter(item => item.id !== 'dictionaries' || !item.subItems || item.subItems.length > 0);

            return { ...group, items: filteredItems };
        }).filter(group => group.items.length > 0);
    }, [allowedTabKeys, allowedDictionaryKeys]);

    const allVisibleItems = visibleSidebarGroups.flatMap(g => g.items);
    const visibleIds = allVisibleItems.map(i => i.id);

    // After permissions load, validate URL tab and sync if needed
    useEffect(() => {
        const currentUrlTab = new URLSearchParams(window.location.search).get('tab');

        // If URL has a tab, check if it's valid (user has permission)
        if (currentUrlTab && visibleIds.includes(currentUrlTab)) {
            // URL tab is valid - use it
            if (activeTab !== currentUrlTab) {
                console.log('[SettingsPage] Syncing valid URL tab:', currentUrlTab);
                setActiveTab(currentUrlTab);
            }
        } else if (currentUrlTab && !visibleIds.includes(currentUrlTab) && visibleIds.length > 0) {
            // URL tab exists but user has no permission - fallback to first visible
            const fallback = visibleIds[0];
            console.log('[SettingsPage] URL tab not permitted, falling back to:', fallback);
            setActiveTab(fallback);
            // Update URL to reflect actual tab
            window.history.replaceState(null, '', `${window.location.pathname}?tab=${fallback}`);
        }
    }, [visibleIds.join(',')]); // Re-run when visible tabs change

    if (allVisibleItems.length === 0) {
        return (
            <div className="p-8">
                <Inline403 message="You do not have permission to view Settings." />
            </div>
        )
    }

    // Debug log
    console.log('[SettingsPage] Tab State:', { activeTab, visibleIds });

    return (
        <div className="flex flex-col min-h-[80vh] h-auto bg-background animate-in fade-in-50 duration-500">
            <div className="px-8 pt-6 flex-shrink-0">
                <PageHeader
                    heading="Sistem Tənzimləmələri"
                    text="Enterprise səviyyəli idarəetmə və konfiqurasiya paneli."
                />
            </div>

            <div className="flex flex-1 flex-col md:flex-row gap-8 p-8 pt-4 min-h-0">
                {/* SIDEBAR NAVIGATION */}
                <aside className="md:w-64 flex-shrink-0 space-y-8 overflow-y-auto pr-2">
                    {visibleSidebarGroups.map((group, idx) => (
                        <div key={idx} className="space-y-2">
client/src/domains/system-console/ConsolePage.tsx
+29
-11

import React, { lazy, Suspense, useMemo } from "react";
import React, { lazy, Suspense, useEffect, useMemo } from "react";
import { useHelp } from "@/app/context/HelpContext";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { ShieldAlert, Server as ServerIcon, Activity, Database, Flag, MessageSquare, Wrench, LayoutDashboard } from "lucide-react";
import { ScrollableTabs } from "@/shared/components/ui/scrollable-tabs";
import { SystemHealthWidget, CacheManager, MaintenanceControls } from "./components/SystemDashboardWidgets";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedTabs } from "@/app/security/navigationResolver";

// Lazy load components
const MonitoringPage = lazy(() => import("@/domains/system-console/monitoring/views/MonitoringPage"));
const JobRegistryPage = lazy(() => import("@/domains/system-console/scheduler/views/JobRegistryPage"));
const RetentionPolicyPage = lazy(() => import("@/domains/system-console/maintenance/RetentionPolicyPage"));
const FeatureFlagsPage = lazy(() => import("@/domains/system-console/feature-flags/FeatureFlagsPage"));
const PolicyRulesPage = lazy(() => import("@/domains/system-console/maintenance/PolicyRulesPage"));
const FeedbackPage = lazy(() => import("@/domains/system-console/feedback/FeedbackPage"));
const AuditLogsPage = lazy(() => import("@/domains/system-console/audit-logs/AuditLogsPage"));
const SystemToolsTab = lazy(() => import("@/domains/system-console/tools/SystemToolsTab"));

// Tab icons
const TAB_ICONS: Record<string, React.ComponentType<any>> = {
    dashboard: LayoutDashboard,
    monitoring: Activity,
    audit: ShieldAlert,
    jobs: ServerIcon,
    retention: Database,
    features: Flag,
    policy: ShieldAlert,
    feedback: MessageSquare,
    tools: Wrench,
};

export default function SystemCorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageKey } = useHelp();
    const { permissions } = usePermissions();

    React.useEffect(() => {
        setPageKey("sys-admin");
    }, [setPageKey]);

    // SAP-GRADE: Get allowed tabs from resolver (EXACT match)
    const allowedTabs = useMemo(() => {
        return getAllowedTabs('admin.console', permissions, 'admin');
    }, [permissions]);

    const currentTab = searchParams.get("tab") || (allowedTabs[0]?.key || "dashboard");
    const allowedKeys = allowedTabs.map(t => t.key);
    const currentParam = searchParams.get("tab");
    const currentTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : allowedKeys[0];

    useEffect(() => {
        if (currentTab && currentTab !== currentParam) {
            setSearchParams({ tab: currentTab });
        }
    }, [currentTab, currentParam, setSearchParams]);

    if (!currentTab) {
        return (
            <div className="p-6">
                <p className="text-sm text-muted-foreground">You do not have permission to view System Console.</p>
            </div>
        );
    }

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between shrink-0">
                <PageHeader
                    heading="System Console"
                    text="Sistem inzibatçısı paneli: Monitorinq, Scheduler, Təhlükəsizlik və Alətlər."
                />
            </div>

            <div className="space-y-6">
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <ScrollableTabs className="w-full border-b">
                        <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent space-x-6 border-b-0">
                            {/* SAP-GRADE: Only render ALLOWED tabs */}
                            {allowedTabs.map(tab => {
                                const Icon = TAB_ICONS[tab.key] || LayoutDashboard;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                                    >
                                        <Icon className="w-4 h-4 mr-2" /> {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </ScrollableTabs>

                    {/* Content Area */}
                    <div className="pt-4">
                        <Suspense fallback={<div className="p-8 text-center">Yüklənir...</div>}>
                            {currentTab === 'dashboard' && (
                            {currentTab === 'dashboard' && allowedKeys.includes('dashboard') && (
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                                        <SystemHealthWidget />
                                        <MaintenanceControls />
                                    </div>
                                    <div className="grid gap-6 grid-cols-1">
                                        <CacheManager />
                                    </div>
                                </div>
                            )}
                            {currentTab === 'monitoring' && <MonitoringPage />}
                            {currentTab === 'audit' && <AuditLogsPage />}
                            {currentTab === 'jobs' && <JobRegistryPage />}
                            {currentTab === 'retention' && <RetentionPolicyPage />}
                            {currentTab === 'features' && <FeatureFlagsPage />}
                            {currentTab === 'policy' && <PolicyRulesPage />}
                            {currentTab === 'feedback' && <FeedbackPage />}
                            {currentTab === 'tools' && <SystemToolsTab />}
                            {currentTab === 'monitoring' && allowedKeys.includes('monitoring') && <MonitoringPage />}
                            {currentTab === 'audit' && allowedKeys.includes('audit') && <AuditLogsPage />}
                            {currentTab === 'jobs' && allowedKeys.includes('jobs') && <JobRegistryPage />}
                            {currentTab === 'retention' && allowedKeys.includes('retention') && <RetentionPolicyPage />}
                            {currentTab === 'features' && allowedKeys.includes('features') && <FeatureFlagsPage />}
                            {currentTab === 'policy' && allowedKeys.includes('policy') && <PolicyRulesPage />}
                            {currentTab === 'feedback' && allowedKeys.includes('feedback') && <FeedbackPage />}
                            {currentTab === 'tools' && allowedKeys.includes('tools') && <SystemToolsTab />}
                        </Suspense>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
client/src/shared/components/ui/DictionariesTab.tsx
+62
-33


import { useState } from "react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from "@tanstack/react-table"
import type {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState
} from "@tanstack/react-table"
import {
    Trash2,
    Edit,
    MoreHorizontal,
    ArrowUpDown,
    Archive,
    Scale,
    Coins
} from "lucide-react"
import { Button } from "@/components/ui/button"
@@ -49,105 +49,134 @@ import { toast } from "sonner"
import {
    MOCK_SECTORS,
    MOCK_UNITS,
    MOCK_CURRENCIES,
} from "@/shared/constants/reference-data"
import type {
    Sector,
    Unit,
    Currency
} from "@/shared/constants/reference-data"
import AddressSettingsTab from "./AddressSettingsTab"
import TimezoneSettingsTab from "./TimezoneSettingsTab"
import { usePermissions } from "@/app/auth/hooks/usePermissions"
import { getAllowedSubTabs } from "@/app/security/navigationResolver"
import { useMemo } from "react"

export function DictionariesTab() {
    // Get permissions and allowed subTabs from resolver
    const { permissions } = usePermissions();

    // SAP-GRADE: Get allowed subTabs from resolver (EXACT match)
    const allowedSubTabs = useMemo(() => {
        return getAllowedSubTabs('admin.settings', 'dictionaries', permissions, 'admin');
    }, [permissions]);

    // Read subTab from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubTab = urlParams.get('subTab');
    const [searchParams, setSearchParams] = useSearchParams();
    const allowedKeys = allowedSubTabs.map(st => st.key);
    const urlSubTab = searchParams.get('subTab');

    // Clamp to allowed subTab
    const initialSubTab = urlSubTab && allowedSubTabs.some(st => st.key === urlSubTab)
    const initialSubTab = urlSubTab && allowedKeys.includes(urlSubTab)
        ? urlSubTab
        : (allowedSubTabs[0]?.key || 'sectors');
        : (allowedKeys[0] || '');
    const [currentSubTab, setCurrentSubTab] = useState(initialSubTab);

    useEffect(() => {
        const clamped = urlSubTab && allowedKeys.includes(urlSubTab)
            ? urlSubTab
            : (allowedKeys[0] || '');

        if (clamped && clamped !== currentSubTab) {
            setCurrentSubTab(clamped);
            const currentTab = searchParams.get('tab') || 'dictionaries';
            setSearchParams({ tab: currentTab, subTab: clamped });
        }
    }, [allowedKeys, urlSubTab, currentSubTab, searchParams, setSearchParams]);

    // Handler for subTab change - update state AND URL
    const handleSubTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;
        setCurrentSubTab(value);
        const currentTab = urlParams.get('tab') || 'dictionaries';
        const newUrl = `${window.location.pathname}?tab=${currentTab}&subTab=${value}`;
        window.history.replaceState(null, '', newUrl);
        const currentTab = searchParams.get('tab') || 'dictionaries';
        setSearchParams({ tab: currentTab, subTab: value });
    };

    if (!currentSubTab) {
        return (
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">You do not have permission to view any dictionaries.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Tabs value={currentSubTab} onValueChange={handleSubTabChange} className="w-full">
                {/* Horizontal scrollable tabs - SAP-GRADE: Only render ALLOWED subTabs */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    <TabsList className="inline-flex w-max gap-1 h-10 justify-start">
                        {allowedSubTabs.map(st => (
                            <TabsTrigger key={st.key} value={st.key} className="whitespace-nowrap">
                                {st.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="sectors" className="space-y-4 mt-4">
                    <SectorsManager />
                </TabsContent>

                <TabsContent value="units" className="space-y-4 mt-4">
                    <UnitsManager />
                </TabsContent>

                <TabsContent value="currency" className="space-y-4 mt-4">
                    <CurrenciesManager />
                </TabsContent>

                <TabsContent value="timezones" className="space-y-4 mt-4">
                    <TimezoneSettingsTab />
                </TabsContent>

                <TabsContent value="address" className="space-y-4 mt-4">
                    <div className="space-y-2 mb-4">
                        <h3 className="text-lg font-medium">Ünvanlar</h3>
                        <p className="text-sm text-muted-foreground">Ölkə, Şəhər və Rayon məlumatlarının idarə olunması.</p>
                    </div>
                    <AddressSettingsTab />
                </TabsContent>
                {allowedKeys.includes('sectors') && (
                    <TabsContent value="sectors" className="space-y-4 mt-4">
                        <SectorsManager />
                    </TabsContent>
                )}

                {allowedKeys.includes('units') && (
                    <TabsContent value="units" className="space-y-4 mt-4">
                        <UnitsManager />
                    </TabsContent>
                )}

                {allowedKeys.includes('currency') && (
                    <TabsContent value="currency" className="space-y-4 mt-4">
                        <CurrenciesManager />
                    </TabsContent>
                )}

                {allowedKeys.includes('timezones') && (
                    <TabsContent value="timezones" className="space-y-4 mt-4">
                        <TimezoneSettingsTab />
                    </TabsContent>
                )}

                {allowedKeys.includes('address') && (
                    <TabsContent value="address" className="space-y-4 mt-4">
                        <div className="space-y-2 mb-4">
                            <h3 className="text-lg font-medium">Ünvanlar</h3>
                            <p className="text-sm text-muted-foreground">Ölkə, Şəhər və Rayon məlumatlarının idarə olunması.</p>
                        </div>
                        <AddressSettingsTab />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}

function SectorsManager() {
    const [data, setData] = useState<Sector[]>(MOCK_SECTORS)
    const [newItemName, setNewItemName] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Table State
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        const newItem: Sector = { id: Math.random().toString(), name: newItemName }
        setData([...data, newItem])
        setNewItemName("")
        setIsAddOpen(false)
        toast.success("Sektor əlavə edildi")
    }

docs/RBAC_PATCH_CHECKLIST.md
New
+27
-0

# RBAC Patch Checklist

## Files to DELETE
- None.

## Files to EDIT
- `client/src/app/navigation/tabSubTab.registry.ts`
- `client/src/app/security/rbacResolver.ts`
- `client/src/app/security/navigationResolver.ts`
- `client/src/app/navigation/tabSubTab.registry.spec.ts`
- `client/src/domains/auth/utils/menu-visibility.ts`
- `client/src/domains/auth/utils/permissionPreviewEngine.ts`
- `client/src/domains/billing/views/BillingPage.tsx`
- `client/src/domains/identity/views/UsersPage.tsx`
- `client/src/domains/system-console/ConsolePage.tsx`
- `client/src/domains/settings/SettingsPage.tsx`
- `client/src/shared/components/ui/DictionariesTab.tsx`
- `client/src/app/auth/hooks/usePermissions.ts`

## Files to ADD
- `docs/RBAC_SAP_FIX_REPORT.md`
- `docs/RBAC_PATCH_CHECKLIST.md`

## Acceptance Criteria
- Manual: Navigating to Users, Billing, Settings, Console, and Dictionaries clamps tab/subTab query params to resolver-allowed values without rendering unauthorized tabs/subTabs in the DOM.
- Manual: RootRedirect and ProtectedRoute routes respect resolver decisions without transient `/access-denied` flashes.
- Playwright/Automated: Cover tab/subTab clamping for Billing and Settings (including Dictionaries subtabs) using resolver outputs, and verify hidden tabs are absent from rendered DOM for unauthorized permissions.
docs/RBAC_SAP_FIX_REPORT.md
New
+31
-0

# RBAC SAP Fix Report

## Executive Summary
- Enforced a single navigation decision engine by delegating all legacy RBAC helpers to `navigationResolver` and removing synthetic permission inference.
- Clamped tab/subTab routing for Users, Billing, Settings, Console, and Dictionaries to resolver-approved targets to prevent unauthorized DOM rendering and /access-denied flicker.
- Updated preview and menu utilities to rely on the frozen registry with exact permission matching only.

## Violations Table
| File | Function/Area | Issue | Classification | Disposition |
| --- | --- | --- | --- | --- |
| `client/src/app/navigation/tabSubTab.registry.ts` | `normalizePermissions`, helper checks | Synthetic read inference and verb stripping | MUST REFACTOR | Replaced with dedupe-only normalization and exact set checks. |
| `client/src/app/security/rbacResolver.ts` | Entire module | Competing decision engine diverging from resolver | MUST REFACTOR | Converted to thin delegates over `navigationResolver`. |
| `client/src/domains/billing/views/BillingPage.tsx` | Tab derivation/render | Used rbacResolver normalization and rendered unauthorized tabs | MUST REFACTOR | Switched to resolver, clamped query params, hid unauthorized content. |
| `client/src/domains/identity/views/UsersPage.tsx` | Tab handling | No clamp; unauthorized tabs rendered in DOM | MUST REFACTOR | Resolver-driven clamp and conditional rendering. |
| `client/src/domains/system-console/ConsolePage.tsx` | Tab handling | Missing clamp and content gating | MUST REFACTOR | Resolver-driven clamp and conditional rendering. |
| `client/src/domains/settings/SettingsPage.tsx` | Sidebar/tab logic | Legacy `can` checks and window URL writes bypassed resolver | MUST REFACTOR | Sidebar/tabs now driven by resolver allowed tabs and query synced via `useSearchParams`. |
| `client/src/shared/components/ui/DictionariesTab.tsx` | SubTab handling | All subtabs rendered regardless of permission; manual URL writes | MUST REFACTOR | Resolver-allowed subTabs only; clamped query and gated content. |
| `client/src/domains/auth/utils/menu-visibility.ts` | `computeVisibleTree` | Custom normalization/prefix logic separate from resolver | MUST REFACTOR | Now relies on resolver allowed tabs. |
| `client/src/domains/auth/utils/permissionPreviewEngine.ts` | `checkAccess` | Verb stripping caused synthetic access | MUST REFACTOR | Exact set membership only. |
| `client/src/app/navigation/tabSubTab.registry.spec.ts` | Tests | Expected synthetic read inference | MUST REFACTOR | Updated expectations to exact matching. |

## Flicker Chain
No remaining /access-denied flicker paths detected. Previous risks from unsecured tab query params (Users, Billing, Console, Settings, Dictionaries) were removed by resolver-driven clamping and direct redirects without visiting `/access-denied`.

## Minimal Patch List (ordered)
1. Harden `tabSubTab.registry` normalization and helpers to exact checks.
2. Redirect `rbacResolver` to `navigationResolver` as the sole decision engine.
3. Rework Billing, Users, Console pages to clamp tabs/subTabs to resolver outputs and hide unauthorized content.
4. Rewire SettingsPage sidebar/tabs to resolver allowed lists and sync URL via `useSearchParams`.
5. Gate Dictionaries subTabs with resolver and remove manual URL mutations.
6. Align menu/preview utilities and unit tests to exact permission matching.