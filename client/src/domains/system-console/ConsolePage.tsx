import React, { lazy, Suspense, useMemo } from "react";
import { useHelp } from "@/app/context/HelpContext";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { ShieldAlert, Server as ServerIcon, Activity, Database, Flag, MessageSquare, Wrench, LayoutDashboard } from "lucide-react";
import { ScrollableTabs } from "@/shared/components/ui/scrollable-tabs";
import { SystemHealthWidget, CacheManager, MaintenanceControls } from "./components/SystemDashboardWidgets";

// SAP-GRADE: Import resolver and ResolvedNavNode type
import { resolveNavigationTree, type ResolvedNavNode } from "@/app/security/navigationResolver";
import { usePermissions } from "@/app/auth/hooks/usePermissions";

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

    // SAP-GRADE: Build tree ONCE using resolveNavigationTree
    const tree = useMemo(() => {
        return resolveNavigationTree('admin', permissions);
    }, [permissions]);

    // SAP-GRADE: Find console page node from tree
    const consolePageNode = useMemo(() => {
        return tree.find(node => node.pageKey === 'admin.console');
    }, [tree]);

    // SAP-GRADE: Get allowed tabs from node children (NOT from helper call)
    const allowedTabs = useMemo(() => {
        return consolePageNode?.children ?? [];
    }, [consolePageNode]);

    const allowedKeys = useMemo(() => allowedTabs.map(t => t.tabKey || t.id), [allowedTabs]);

    // SAP-GRADE: Read tab from URL (already canonicalized by ProtectedRoute)
    const currentParam = searchParams.get("tab");
    const currentTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : allowedKeys[0] || "";

    // Get current tab node for passing to child components
    const currentTabNode = useMemo(() => {
        return allowedTabs.find(t => (t.tabKey || t.id) === currentTab);
    }, [allowedTabs, currentTab]);

    // SAP-GRADE: MERGE params, don't replace
    const handleTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('tab', value);
            newParams.delete('subTab');
            return newParams;
        });
    };

    if (allowedKeys.length === 0) {
        return (
            <div className="p-8">
                <p className="text-sm text-muted-foreground">You do not have permission to view System Console.</p>
            </div>
        );
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
                            {/* SAP-GRADE: Only render ALLOWED tabs from tree node */}
                            {allowedTabs.map(tab => {
                                const tabKey = tab.tabKey || tab.id;
                                const Icon = TAB_ICONS[tabKey] || LayoutDashboard;
                                return (
                                    <TabsTrigger
                                        key={tabKey}
                                        value={tabKey}
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                                    >
                                        <Icon className="w-4 h-4 mr-2" /> {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </ScrollableTabs>

                    {/* Content Area - SAP-GRADE: Pass tabNode to children */}
                    <div className="pt-4">
                        <Suspense fallback={<div className="p-8 text-center">Yüklənir...</div>}>
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
                            {currentTab === 'monitoring' && currentTabNode && <MonitoringPage tabNode={currentTabNode} />}
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
