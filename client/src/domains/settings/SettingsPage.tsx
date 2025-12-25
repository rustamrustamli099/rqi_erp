import { useState, useEffect } from "react"
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

import { SETTINGS_REGISTRY } from "@/app/navigation/settings.registry";

// --- Sidebar Navigation Items ---
// Single Source of Truth from Registry
const ALL_SIDEBAR_ITEMS = SETTINGS_REGISTRY;

export default function SettingsPage() {
    const [timezone, setTimezone] = useState("Asia/Baku")
    const { can, isLoading } = usePermissions()

    // Read initial tab from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get('tab') || 'general';
    const [activeTab, setActiveTab] = useState(urlTab);

    // Handler for tab change - update local state AND URL
    const handleTabChange = (tabId: string) => {
        console.log('[SettingsPage] Tab changing to:', tabId);
        setActiveTab(tabId);
        // Also update URL for bookmarkability
        const newUrl = `${window.location.pathname}?tab=${tabId}`;
        window.history.replaceState(null, '', newUrl);
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
                            <h4 className="text-sm font-semibold text-muted-foreground tracking-tight px-2 uppercase text-xs">{group.title}</h4>
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
                                            handleTabChange(item.id);
                                        }}
                                        title={item.label}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
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
                        {activeTab === 'smtp' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ) ? (
                                <EmailSettingsTab />
                            ) : <Inline403 />
                        )}

                        {/* 3. NOTIFICATIONS */}
                        {activeTab === 'notifications' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.NOTIFICATIONS.READ) ? (
                                <NotificationsTab />
                            ) : <Inline403 />
                        )}

                        {/* 5. SMS GATEWAY */}
                        {activeTab === 'sms' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ) ? (
                                <SmsSettingsTab />
                            ) : <Inline403 />
                        )}

                        {/* 6. SECURITY */}
                        {activeTab === 'security' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.READ) ? (
                                <SecuritySettingsTab />
                            ) : <Inline403 />
                        )}
                        {activeTab === 'sso' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.READ) ? (
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
                                <BillingConfigTab />
                            ) : <Inline403 />
                        )}
                        {/* UPDATE: Ensure CONFIG.DICTIONARIES.READ matches strict key */}
                        {activeTab === 'dictionaries' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.READ) ? (
                                <DictionariesTab />
                            ) : <Inline403 />
                        )}
                        {activeTab === 'templates' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.TEMPLATES.READ) ? (
                                <DocumentTemplatesTab />
                            ) : <Inline403 />
                        )}
                        {activeTab === 'workflow' && (
                            can(PermissionSlugs.SYSTEM.SETTINGS.CONFIG.WORKFLOW.READ) ? (
                                <WorkflowConfigTab />
                            ) : <Inline403 />
                        )}
                        {activeTab === 'roles' && (
                            can(PermissionSlugs.SYSTEM.ROLES.READ) ? (
                                <RolesPage />
                            ) : <Inline403 />
                        )}

                    </div>
                </main>
            </div>
        </div>
    )
}
