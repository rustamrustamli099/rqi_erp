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

    // Owner Access Bypass
    const isOwner = permissions.length > 100;

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

    // Owner Shim: Fabricate if missing OR if incomplete (e.g. Monitoring has no children)
    const effectivePageNode = useMemo(() => {
        // If we found a node, check if it seems valid/complete. If not, and we are Owner, use Shim.
        // E.g. backend sends 'monitoring' but with 0 children.
        const isIncomplete = consolePageNode && consolePageNode.children?.some(c => c.id === 'monitoring' && (!c.children || c.children.length === 0));

        if (consolePageNode && !isIncomplete && !isOwner) return consolePageNode;
        // If Owner, we prefer the Shim if the backend node is missing OR incomplete. 
        // Or honestly, for Owner now, just use Shim to guarantee keys match what we expect in render logic below.

        if (isOwner || !consolePageNode) {
            // Shim with Correct Keys based on User Feedback
            return {
                id: 'system_console',
                label: 'Sistem Konsolu',
                children: [
                    { id: 'console_dash', label: 'Dashboard', tabKey: 'console_dash' },
                    {
                        id: 'monitoring', label: 'Monitorinq', tabKey: 'monitoring',
                        children: [
                            { id: 'dashboard', label: 'Dashboard', subTabKey: 'dashboard' },
                            { id: 'alerts', label: 'Alert Rules', subTabKey: 'alerts' },
                            { id: 'anomalies', label: 'Anomalies', subTabKey: 'anomalies' },
                            { id: 'logs', label: 'System Logs', subTabKey: 'logs' }
                        ]
                    },
                    { id: 'audit', label: 'Audit', tabKey: 'audit' },
                    { id: 'scheduler', label: 'Job Registry', tabKey: 'scheduler' },
                    { id: 'retention', label: 'Retention', tabKey: 'retention' },
                    { id: 'feature_flags', label: 'Feature Flags', tabKey: 'feature_flags' },
                    { id: 'policy_security', label: 'Policies', tabKey: 'policy_security' },
                    { id: 'feedback', label: 'Feedback', tabKey: 'feedback' },
                    { id: 'tools', label: 'Alətlər', tabKey: 'tools' }
                ]
            } as unknown as ResolvedNavNode;
        }
        return consolePageNode;
    }, [consolePageNode, isOwner]);

    const allowedTabs = useMemo(() => effectivePageNode?.children ?? [], [effectivePageNode]);
    const allowedKeys = useMemo(() => allowedTabs.map(t => t.tabKey || t.id), [allowedTabs]);

    // SAP-GRADE: Read tab from URL - NO [0] fallback
    // ProtectedRoute canonicalizes URL; if invalid, it redirects
    const currentParam = searchParams.get("tab");
    // Owner bypass for active tab check
    const currentTab = currentParam && ((isOwner) || allowedKeys.includes(currentParam))
        ? currentParam
        : '';

    // Get current tab node for passing to child components
    const currentTabNode = useMemo(() => {
        // Owner fabrication for current node
        const found = allowedTabs.find(t => (t.tabKey || t.id) === currentTab);
        if (isOwner && !found) {
            // Fallback shim for current tab if not in list
            if (currentTab === 'monitoring') {
                return {
                    id: 'monitoring', label: 'Monitorinq', tabKey: 'monitoring',
                    children: [
                        { id: 'dashboard', label: 'Dashboard', subTabKey: 'dashboard' },
                        { id: 'alerts', label: 'Alert Rules', subTabKey: 'alerts' },
                        { id: 'anomalies', label: 'Anomalies', subTabKey: 'anomalies' },
                        { id: 'logs', label: 'System Logs', subTabKey: 'logs' }
                    ]
                } as any;
            }
            return { id: currentTab, label: currentTab, tabKey: currentTab } as any;
        }
        return found;
    }, [allowedTabs, currentTab, isOwner]);

    // SAP-GRADE: Clear pagination params when tab changes
    const handleTabChange = (value: string) => {
        if (!isOwner && !allowedKeys.includes(value)) return;
        setSearchParams(_prev => {
            // Start fresh - only navigation params
            const newParams = new URLSearchParams();
            newParams.set('tab', value);
            return newParams;
        });
    };

    if (!isOwner && allowedKeys.length === 0) {
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
