import React, { lazy, Suspense, useMemo, useEffect } from "react";
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

    const allowedKeys = useMemo(() => allowedTabs.map(t => t.key), [allowedTabs]);

    // URL clamp
    const currentParam = searchParams.get("tab");
    const currentTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : allowedKeys[0] || "";

    // Sync URL if clamped
    useEffect(() => {
        if (currentTab && currentTab !== currentParam) {
            setSearchParams({ tab: currentTab }, { replace: true });
        }
    }, [currentTab, currentParam, setSearchParams]);

    const handleTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;
        setSearchParams({ tab: value });
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

                    {/* Content Area - SAP-GRADE: Only render ALLOWED content */}
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
