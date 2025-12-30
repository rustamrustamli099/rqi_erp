import React, { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { useHelp } from "@/app/context/HelpContext";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldAlert, Server as ServerIcon, Activity, Database, Flag, MessageSquare, Wrench, LayoutDashboard } from "lucide-react";
import { ScrollableTabs } from "@/shared/components/ui/scrollable-tabs";
import { SystemHealthWidget, CacheManager, MaintenanceControls } from "./components/SystemDashboardWidgets";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
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
