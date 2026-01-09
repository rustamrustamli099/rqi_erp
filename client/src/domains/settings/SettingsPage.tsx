import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/domains/auth/context/AuthContext"
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
import { useSearchParams } from "react-router-dom"

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
import { GeneralSettingsForm } from "./_components/settings/GeneralSettingsForm"

const timezones = [
    { value: "Asia/Baku", label: "Asia/Baku (GMT+4)" },
    { value: "Europe/London", label: "Europe/London (GMT+0)" },
    { value: "Europe/Istanbul", label: "Europe/Istanbul (GMT+3)" },
    { value: "America/New_York", label: "America/New_York (GMT-5)" },
    { value: "Europe/Moscow", label: "Europe/Moscow (GMT+3)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
]

import { getSettingsTabsForUI } from "@/app/navigation/tabSubTab.registry";
import { useMenu, type ResolvedNavNode } from "@/app/navigation/useMenu";

// --- Sidebar Navigation Items ---
// Single Source of Truth from TAB_SUBTAB_REGISTRY
const ALL_SIDEBAR_ITEMS = getSettingsTabsForUI();

export default function SettingsPage() {
    const [timezone, setTimezone] = useState("Asia/Baku")
    const { isLoading, permissions } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    // PHASE 14H: Use backend menu for tab visibility
    const { menu, loading: menuLoading } = useMenu();



    // Find settings page node from backend menu
    const settingsPageNode = useMemo(() => {
        const findNode = (nodes: ResolvedNavNode[], targetId: string): ResolvedNavNode | undefined => {
            for (const node of nodes) {
                if (node.id === targetId) return node;
                if (node.children) {
                    const found = findNode(node.children, targetId);
                    if (found) return found;
                }
            }
            return undefined;
        };
        return findNode(menu, 'settings');
    }, [menu]);

    // Tabs from page node children
    const allowedTabs = useMemo(() => settingsPageNode?.children ?? [], [settingsPageNode]);

    // Extract all tab keys recursively from nested children
    const allowedKeys = useMemo(() => {
        const extractKeys = (nodes: ResolvedNavNode[]): string[] => {
            const keys: string[] = [];
            for (const node of nodes) {
                if (node.path) {
                    const match = node.path.match(/[?&]tab=([^&]+)/);
                    if (match) keys.push(match[1]);
                }
                if (node.children) keys.push(...extractKeys(node.children));
            }
            return keys;
        };
        return extractKeys(allowedTabs);
    }, [allowedTabs]);

    // Filter sidebar - Show only allowed items
    const visibleSidebarGroups = useMemo(() => {
        return ALL_SIDEBAR_ITEMS.map(group => ({
            ...group,
            items: group.items.filter(item => allowedKeys.includes(item.id))
        })).filter(group => group.items.length > 0);
    }, [allowedKeys]);

    // Get current tabNode for passing to children
    // SAP-GRADE: Must find the CONTAINER node for complex tabs (billing_config, user_rights)
    // so that the child component receives the sub-items to render.
    const currentTabNode = useMemo(() => {
        const tabKey = searchParams.get('tab');
        if (!tabKey) return undefined;

        // Helper: Recursive search
        const findRecursive = (nodes: ResolvedNavNode[], predicate: (n: ResolvedNavNode) => boolean): ResolvedNavNode | undefined => {
            for (const node of nodes) {
                if (predicate(node)) return node;
                if (node.children) {
                    const found = findRecursive(node.children, predicate);
                    if (found) return found;
                }
            }
            return undefined;
        };

        if (!settingsPageNode?.children) return undefined;

        // 1. Try to find exact ID match (Container priority)
        let foundNode = findRecursive(settingsPageNode.children, n => n.id === tabKey);

        // 2. Fallback: Find by path match (Leaf priority, where ID != key)
        if (!foundNode) {
            foundNode = findRecursive(settingsPageNode.children, n => {
                const match = n.path?.match(/[?&]tab=([^&]+)/);
                return !!match && match[1] === tabKey;
            });
        }

        return foundNode;
    }, [settingsPageNode, searchParams]);

    // SAP-GRADE: Read tab from URL - NO [0] fallback
    // ProtectedRoute canonicalizes URL; if invalid, it redirects
    const currentParam = searchParams.get('tab');
    const activeTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : '';

    // Handler for tab change - SAP-GRADE: Clear pagination params when tab changes
    const handleTabChange = (tabId: string) => {
        if (!allowedKeys.includes(tabId)) return;
        setSearchParams(_prev => {
            // SAP-GRADE: Start fresh with only navigation params
            const newParams = new URLSearchParams();
            newParams.set('tab', tabId);
            // Don't copy: page, pageSize, search, sortBy, sortDir, filters[*]
            return newParams;
        });
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

    if (allowedKeys.length === 0) {
        return (
            <div className="p-8">
                <Inline403 message="You do not have permission to view Settings." />
            </div>
        )
    }


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
                                            // SAP-GRADE: Use canonical path from resolver (includes default subTab)
                                            // BUT only extract navigation params (tab, subTab) - NOT pagination
                                            const resolvedNode = allowedTabs.find(t => (t.tabKey || t.id) === item.id);
                                            if (resolvedNode?.path) {
                                                const url = new URL(resolvedNode.path, window.location.origin);
                                                const newParams = new URLSearchParams();
                                                // Only copy navigation params
                                                const tab = url.searchParams.get('tab');
                                                const subTab = url.searchParams.get('subTab');
                                                if (tab) newParams.set('tab', tab);
                                                if (subTab) newParams.set('subTab', subTab);
                                                setSearchParams(newParams);
                                            } else {
                                                handleTabChange(item.id);
                                            }
                                        }}
                                        title={item.label}
                                    >
                                        <span className="truncate">{item.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </aside>

                {/* CONTENT AREA */}
                <main className="flex-1 min-w-0 pb-10 overflow-y-auto">
                    <div className="space-y-6 max-w-5xl">

                        {/* 1. GENERAL PROFILE */}
                        {activeTab === 'general' && <GeneralSettingsForm />}


                        {/* 2. SMTP SETTINGS */}
                        {activeTab === 'smtp' && <EmailSettingsTab />}

                        {/* 3. NOTIFICATIONS */}
                        {activeTab === 'notifications' && <NotificationsTab />}

                        {/* 5. SMS GATEWAY */}
                        {activeTab === 'sms' && <SmsSettingsTab />}

                        {/* 6. SECURITY */}
                        {activeTab === 'security' && currentTabNode && <SecuritySettingsTab tabNode={currentTabNode} />}
                        {activeTab === 'sso' && <SSOSettingsTab />}


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


                        {/* --- EXISTING TABS MIGRATED - SAP-GRADE: pass tabNode --- */}
                        {activeTab === 'billing_config' && !currentTabNode && <div className="p-4 text-amber-600 bg-amber-50 rounded border border-amber-200">Billing Config tab definition not found. Please restart backend server.</div>}
                        {activeTab === 'billing_config' && currentTabNode && <BillingConfigTab tabNode={currentTabNode} />}

                        {activeTab === 'dictionaries' && currentTabNode && <DictionariesTab tabNode={currentTabNode} />}
                        {activeTab === 'templates' && <DocumentTemplatesTab />}

                        {activeTab === 'workflow' && !currentTabNode && <div className="p-4 text-amber-600 bg-amber-50 rounded border border-amber-200">Workflow tab definition not found. Please restart backend server.</div>}
                        {activeTab === 'workflow' && currentTabNode && <WorkflowConfigTab tabNode={currentTabNode} />}

                        {activeTab === 'user_rights' && !currentTabNode && <div className="p-4 text-amber-600 bg-amber-50 rounded border border-amber-200">User Rights tab definition (user_rights) not found. Menu cache may be stale. Restart backend.</div>}
                        {activeTab === 'user_rights' && currentTabNode && <RolesPage tabNode={currentTabNode} />}

                    </div>
                </main>
            </div>
        </div>
    )
}
