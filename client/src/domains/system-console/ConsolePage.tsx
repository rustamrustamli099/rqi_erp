import React, { lazy, Suspense, useMemo } from "react";
import { useHelp } from "@/app/context/HelpContext";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { ShieldAlert, Server as ServerIcon, Activity, Database, Flag, MessageSquare, Wrench, LayoutDashboard } from "lucide-react";
import { ScrollableTabs } from "@/shared/components/ui/scrollable-tabs";
import { SystemHealthWidget, CacheManager, MaintenanceControls } from "./components/SystemDashboardWidgets";

// PHASE 14H: Use backend menu instead of frontend resolver
import { useMenu, type ResolvedNavNode } from "@/app/navigation/useMenu";
import { useAuth } from "@/domains/auth/context/AuthContext";

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
    console_dash: LayoutDashboard,
    monitoring: Activity,
    audit: ShieldAlert,
    jobs: ServerIcon,
    scheduler: ServerIcon,
    retention: Database,
    features: Flag,
    feature_flags: Flag,
    policy: ShieldAlert,
    policy_security: ShieldAlert,
    feedback: MessageSquare,
    tools: Wrench,
};

export default function SystemCorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageKey } = useHelp();
    const { permissions } = useAuth();

    React.useEffect(() => {
        setPageKey("sys-admin");
    }, [setPageKey]);

    // PHASE 14H: Use backend menu for tab visibility
    const { menu } = useMenu();



    const findNode = (nodes: ResolvedNavNode[], key: string): ResolvedNavNode | undefined => {
        for (const node of nodes) {
            // FIX: Check ID 'system_console'
            if (node.pageKey === key || node.key === key || node.id === key) return node;
            if (node.children) {
                const found = findNode(node.children, key);
                if (found) return found;
            }
        }
        return undefined;
    };

    // Fix: Search by ID 'system_console'
    const consolePageNode = useMemo(() => findNode(menu, 'system_console') || findNode(menu, 'admin.console'), [menu]);

    // SAP-GRADE: Direct assignment, no shims
    const effectivePageNode = consolePageNode;

    const allowedTabs = useMemo(() => effectivePageNode?.children ?? [], [effectivePageNode]);
    const allowedKeys = useMemo(() => allowedTabs.map(t => t.tabKey || t.id), [allowedTabs]);

    // SAP-GRADE: Read tab from URL - NO [0] fallback
    // ProtectedRoute canonicalizes URL; if invalid, it redirects
    const currentParam = searchParams.get("tab");

    const currentTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : '';

    // Get current tab node for passing to child components
    const currentTabNode = useMemo(() => {
        return allowedTabs.find(t => (t.tabKey || t.id) === currentTab);
    }, [allowedTabs, currentTab]);

    // SAP-GRADE: Clear pagination params when tab changes
    const handleTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;
        setSearchParams(_prev => {
            // Start fresh - only navigation params
            const newParams = new URLSearchParams();
            newParams.set('tab', value);
            return newParams;
        });
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
                    {/* Reusable Scrollable Tabs - Pill Style */}
                    <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent border-b">
                        <TabsList className="flex h-auto w-max justify-start gap-2 bg-transparent p-0">
                            {allowedTabs.map(tab => {
                                const tabKey = tab.tabKey || tab.id;
                                const Icon = TAB_ICONS[tabKey] || LayoutDashboard;
                                return (
                                    <TabsTrigger
                                        key={tabKey}
                                        value={tabKey}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background rounded-md px-4 py-2 shrink-0"
                                    >
                                        <Icon className="w-4 h-4 mr-2" /> {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    {/* Content Area - SAP-GRADE: Pass tabNode to children */}
                    <div className="pt-4">
                        <Suspense fallback={<div className="p-8 text-center">Yüklənir...</div>}>
                            {(currentTab === 'dashboard' || currentTab === 'console_dash') && (
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
                            {currentTab === 'monitoring' && currentTabNode && <MonitoringPage tabNode={currentTabNode} />}
                            {currentTab === 'audit' && allowedKeys.includes('audit') && <AuditLogsPage />}
                            {(currentTab === 'jobs' || currentTab === 'scheduler') && <JobRegistryPage />}
                            {currentTab === 'retention' && allowedKeys.includes('retention') && <RetentionPolicyPage />}
                            {(currentTab === 'features' || currentTab === 'feature_flags') && <FeatureFlagsPage />}
                            {(currentTab === 'policy' || currentTab === 'policy_security') && <PolicyRulesPage />}
                            {currentTab === 'feedback' && allowedKeys.includes('feedback') && <FeedbackPage />}
                            {currentTab === 'tools' && allowedKeys.includes('tools') && <SystemToolsTab />}
                        </Suspense>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
