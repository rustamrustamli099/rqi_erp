import React, { lazy, Suspense } from "react";
import { useHelp } from "@/app/context/HelpContext";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { ShieldAlert, Server as ServerIcon, Activity, Database, Flag, MessageSquare, Wrench, LayoutDashboard } from "lucide-react";
import { ScrollableTabs } from "@/shared/components/ui/scrollable-tabs";
import { SystemHealthWidget, CacheManager, MaintenanceControls } from "./components/SystemDashboardWidgets";

// Lazy load components
// Lazy load components
const MonitoringPage = lazy(() => import("@/domains/system-console/monitoring/views/MonitoringPage")); // Added
const JobRegistryPage = lazy(() => import("@/domains/system-console/scheduler/views/JobRegistryPage"));
const RetentionPolicyPage = lazy(() => import("@/domains/system-console/maintenance/RetentionPolicyPage"));
const FeatureFlagsPage = lazy(() => import("@/domains/system-console/feature-flags/FeatureFlagsPage"));
const PolicyRulesPage = lazy(() => import("@/domains/system-console/maintenance/PolicyRulesPage"));
const FeedbackPage = lazy(() => import("@/domains/system-console/feedback/FeedbackPage"));
const AuditLogsPage = lazy(() => import("@/domains/system-console/audit-logs/AuditLogsPage"));
const SystemToolsTab = lazy(() => import("@/domains/system-console/tools/SystemToolsTab"));

export default function SystemCorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageKey } = useHelp();

    React.useEffect(() => {
        setPageKey("sys-admin");
    }, [setPageKey]);

    const currentTab = searchParams.get("tab") || "dashboard";

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
                            <TabsTrigger
                                value="dashboard"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" /> İdarəetmə Paneli
                            </TabsTrigger>
                            <TabsTrigger
                                value="monitoring"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <Activity className="w-4 h-4 mr-2" /> Monitorinq
                            </TabsTrigger>
                            <TabsTrigger
                                value="audit"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <ShieldAlert className="w-4 h-4 mr-2" /> Audit & Compliance
                            </TabsTrigger>
                            <TabsTrigger
                                value="jobs"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <ServerIcon className="w-4 h-4 mr-2" /> Job Scheduler
                            </TabsTrigger>
                            <TabsTrigger
                                value="retention"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <Database className="w-4 h-4 mr-2" /> Data Retention
                            </TabsTrigger>
                            <TabsTrigger
                                value="features"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <Flag className="w-4 h-4 mr-2" /> Feature Flags
                            </TabsTrigger>
                            <TabsTrigger
                                value="policy"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <ShieldAlert className="w-4 h-4 mr-2" /> Policy & Security
                            </TabsTrigger>
                            <TabsTrigger
                                value="feedback"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" /> Feedback Inbox
                            </TabsTrigger>
                            <TabsTrigger
                                value="tools"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 shrink-0"
                            >
                                <Wrench className="w-4 h-4 mr-2" /> Alətlər (Tools)
                            </TabsTrigger>
                        </TabsList>
                    </ScrollableTabs>

                    {/* Content Area */}
                    <div className="pt-4">
                        <Suspense fallback={<div className="p-8 text-center">Yüklənir...</div>}>
                            {currentTab === 'dashboard' && (
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
                            {currentTab === 'overview' && <div className="p-8 text-muted-foreground">System Dashboard (Graphs & Stats)</div>}
                            {currentTab === 'monitoring' && <MonitoringPage />}
                            {currentTab === 'audit' && <AuditLogsPage />}
                            {currentTab === 'jobs' && <JobRegistryPage />}
                            {currentTab === 'retention' && <RetentionPolicyPage />}
                            {currentTab === 'features' && <FeatureFlagsPage />}
                            {currentTab === 'policy' && <PolicyRulesPage />}
                            {currentTab === 'feedback' && <FeedbackPage />}
                            {currentTab === 'tools' && <SystemToolsTab />}
                        </Suspense>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
