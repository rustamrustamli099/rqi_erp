import React, { lazy, Suspense, useMemo } from "react";
import { useHelp } from "@/app/context/HelpContext";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { ShieldAlert, Server as ServerIcon, Activity, Database, Flag, MessageSquare, Wrench, LayoutDashboard } from "lucide-react";
import { ScrollableTabs } from "@/shared/components/ui/scrollable-tabs";
import { SystemHealthWidget, CacheManager, MaintenanceControls } from "./components/SystemDashboardWidgets";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedTabs, normalizePermissions } from "@/app/security/rbacResolver";

// Lazy load components
const MonitoringPage = lazy(() => import("@/domains/system-console/monitoring/views/MonitoringPage"));
const JobRegistryPage = lazy(() => import("@/domains/system-console/scheduler/views/JobRegistryPage"));
const RetentionPolicyPage = lazy(() => import("@/domains/system-console/maintenance/RetentionPolicyPage"));
const FeatureFlagsPage = lazy(() => import("@/domains/system-console/feature-flags/FeatureFlagsPage"));
const PolicyRulesPage = lazy(() => import("@/domains/system-console/maintenance/PolicyRulesPage"));
const FeedbackPage = lazy(() => import("@/domains/system-console/feedback/FeedbackPage"));
const AuditLogsPage = lazy(() => import("@/domains/system-console/audit-logs/AuditLogsPage"));
const SystemToolsTab = lazy(() => import("@/domains/system-console/tools/SystemToolsTab"));

// Tab configuration with icons
const CONSOLE_TABS = [
    { key: 'dashboard', label: 'İdarəetmə Paneli', icon: LayoutDashboard },
    { key: 'monitoring', label: 'Monitorinq', icon: Activity },
    { key: 'audit', label: 'Audit & Compliance', icon: ShieldAlert },
    { key: 'jobs', label: 'Job Scheduler', icon: ServerIcon },
    { key: 'retention', label: 'Data Retention', icon: Database },
    { key: 'features', label: 'Feature Flags', icon: Flag },
    { key: 'policy', label: 'Policy & Security', icon: ShieldAlert },
    { key: 'feedback', label: 'Feedback Inbox', icon: MessageSquare },
    { key: 'tools', label: 'Alətlər (Tools)', icon: Wrench },
];

export default function SystemCorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageKey } = useHelp();
    const { permissions } = usePermissions();

    React.useEffect(() => {
        setPageKey("sys-admin");
    }, [setPageKey]);

    // SAP-GRADE: Get allowed tabs from resolver
    const allowedTabKeys = useMemo(() => {
        const permSet = normalizePermissions(permissions);
        return getAllowedTabs({
            pageKey: 'admin.system-console',
            perms: permSet,
            context: 'admin'
        });
    }, [permissions]);

    // Filter tabs to only show allowed ones
    const visibleTabs = useMemo(() => {
        return CONSOLE_TABS.filter(tab => allowedTabKeys.includes(tab.key));
    }, [allowedTabKeys]);

    const currentTab = searchParams.get("tab") || (visibleTabs[0]?.key || "dashboard");

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
                            {visibleTabs.map(tab => {
                                const Icon = tab.icon;
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
