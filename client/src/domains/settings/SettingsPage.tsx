import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/app/auth/hooks/usePermissions"
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

const timezones = [
    { value: "Asia/Baku", label: "Asia/Baku (GMT+4)" },
    { value: "Europe/London", label: "Europe/London (GMT+0)" },
    { value: "Europe/Istanbul", label: "Europe/Istanbul (GMT+3)" },
    { value: "America/New_York", label: "America/New_York (GMT-5)" },
    { value: "Europe/Moscow", label: "Europe/Moscow (GMT+3)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
]

import { getSettingsTabsForUI } from "@/app/navigation/tabSubTab.registry";
import { resolveNavigationTree, type ResolvedNavNode } from "@/app/security/navigationResolver";

// --- Sidebar Navigation Items ---
// Single Source of Truth from TAB_SUBTAB_REGISTRY
const ALL_SIDEBAR_ITEMS = getSettingsTabsForUI();

export default function SettingsPage() {
    const [timezone, setTimezone] = useState("Asia/Baku")
    const { isLoading, permissions } = usePermissions()
    const [searchParams, setSearchParams] = useSearchParams()

    // SAP-GRADE: Single Decision Center - resolveNavigationTree once
    // SAP-GRADE: Resolve navigation tree
    const tree = resolveNavigationTree('admin', permissions);
    const settingsPageNode = tree.find(n => n.pageKey === 'admin.settings');

    // DEBUG - SİL SONRA (User Permission Diagnosis)
    if (import.meta.env?.DEV) {
        console.log('[SettingsPage] DEBUG:', {
            activePermissions: permissions.filter(p => p.includes('settings') || p.includes('billing')),
            settingsChildren: settingsPageNode?.children?.map(c => c.tabKey),
            billingConfigNode: settingsPageNode?.children?.find(c => c.tabKey === 'billing_config')
        });
    }

    // Tabs from page node children
    const allowedTabs = useMemo(() => settingsPageNode?.children ?? [], [settingsPageNode]);
    const allowedKeys = useMemo(() => allowedTabs.map(t => t.tabKey || t.id), [allowedTabs]);

    // Filter sidebar based on resolver output (not direct call)
    const visibleSidebarGroups = useMemo(() => {
        return ALL_SIDEBAR_ITEMS.map(group => ({
            ...group,
            items: group.items.filter(item => allowedKeys.includes(item.id))
        })).filter(group => group.items.length > 0);
    }, [allowedKeys]);

    // Get current tabNode for passing to children
    const currentTabNode = useMemo(() => {
        const tabKey = searchParams.get('tab');
        return allowedTabs.find(t => (t.tabKey || t.id) === tabKey);
    }, [allowedTabs, searchParams]);

    // SAP-GRADE: Read tab from URL - NO [0] fallback
    // ProtectedRoute canonicalizes URL; if invalid, it redirects
    const currentParam = searchParams.get('tab');
    const activeTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : '';

    // Handler for tab change - SAP-GRADE: MERGE params, don't replace
    const handleTabChange = (tabId: string) => {
        if (!allowedKeys.includes(tabId)) return;
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('tab', tabId);
            newParams.delete('subTab'); // Clear subTab when changing tab
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
                                            const resolvedNode = allowedTabs.find(t => (t.tabKey || t.id) === item.id);
                                            if (resolvedNode?.path) {
                                                // Extract params from canonical path
                                                const url = new URL(resolvedNode.path, window.location.origin);
                                                setSearchParams(url.searchParams);
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
                        {activeTab === 'general' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Şirkət Profili (Tenant)</CardTitle>
                                    <CardDescription>Bu, SİZİN şirkətinizin profilidir. Fakturalarda və sistem başlıqlarında bu məlumatlar əks olunur.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Logo & Basic Info */}
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="grid gap-2">
                                                <Label>Sistem Adı (Tenant Name)</Label>
                                                <Input defaultValue="RQI ERP Enterprise" />
                                                <span className="text-[0.7rem] text-muted-foreground leading-tight">Sistemin yuxarı sol küncündə görünən ad.</span>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Rəsmi Hüquqi Ad</Label>
                                                <Input defaultValue="RQI Solutions LLC" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>VÖEN (Tax ID)</Label>
                                            <Input placeholder="0000000000" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Vebsayt</Label>
                                            <Input placeholder="https://example.com" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Domain (Subdomain)</Label>
                                            <div className="flex gap-2">
                                                <Input defaultValue="rqi" className="flex-1" />
                                                <span className="flex items-center text-sm text-muted-foreground bg-muted px-3 rounded-md border">.rqi.az</span>
                                            </div>
                                            <span className="text-[0.7rem] text-muted-foreground leading-tight">Dəyişiklik 24 saat ərzində aktivləşir.</span>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Saat Qurşağı (Timezone)</Label>
                                            <Combobox
                                                options={timezones}
                                                value={timezone}
                                                onSelect={setTimezone}
                                                placeholder="Saat qurşağını seçin..."
                                                emptyText="Nəticə tapılmadı."
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
                        {activeTab === 'smtp' && <EmailSettingsTab />}

                        {/* 3. NOTIFICATIONS */}
                        {activeTab === 'notifications' && <NotificationsTab />}

                        {/* 5. SMS GATEWAY */}
                        {activeTab === 'sms' && <SmsSettingsTab />}

                        {/* 6. SECURITY */}
                        {activeTab === 'security' && <SecuritySettingsTab />}
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
                        {activeTab === 'billing_config' && currentTabNode && <BillingConfigTab tabNode={currentTabNode} />}
                        {activeTab === 'dictionaries' && currentTabNode && <DictionariesTab tabNode={currentTabNode} />}
                        {activeTab === 'templates' && <DocumentTemplatesTab />}
                        {activeTab === 'workflow' && currentTabNode && <WorkflowConfigTab tabNode={currentTabNode} />}
                        {activeTab === 'roles' && <RolesPage />}

                    </div>
                </main>
            </div>
        </div>
    )
}
