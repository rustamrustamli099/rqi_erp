import { useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { Zap, FileText, Activity, AlertTriangle } from "lucide-react";
import { MonitoringDashboard } from "./MonitoringDashboard";
import { AlertRulesTab } from "./AlertRulesTab";
import { AnomalyDetectionTab } from "./AnomalyDetectionTab";
import { SystemLogsTab } from "./SystemLogsTab";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedSubTabs } from "@/app/security/navigationResolver";
import { Inline403 } from "@/shared/components/security/Inline403";

/**
 * SAP-GRADE MONITORING TAB
 * 
 * Rules:
 * - ONLY allowed subTabs render (resolver-driven allowlist)
 * - URL subTab clamped to first allowed if unauthorized
 * - No unauthorized triggers/content in DOM
 * - No /access-denied flash
 */

// SubTab component mapping
const SUBTAB_COMPONENTS: Record<string, React.ReactNode> = {
    dashboard: <MonitoringDashboard />,
    alerts: <AlertRulesTab />,
    anomalies: <AnomalyDetectionTab />,
    logs: <SystemLogsTab />,
};

// SubTab icons
const SUBTAB_ICONS: Record<string, React.ReactNode> = {
    dashboard: <Activity className="mr-2 h-4 w-4" />,
    alerts: <AlertTriangle className="mr-2 h-4 w-4" />,
    anomalies: <Zap className="mr-2 h-4 w-4" />,
    logs: <FileText className="mr-2 h-4 w-4" />,
};

export default function MonitoringPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { permissions, isLoading } = usePermissions();

    // SAP-GRADE: Get allowed subTabs from resolver (EXACT match)
    const allowedSubTabs = useMemo(() => {
        return getAllowedSubTabs('admin.console', 'monitoring', permissions, 'admin');
    }, [permissions]);

    const allowedKeys = useMemo(() => allowedSubTabs.map(st => st.key), [allowedSubTabs]);

    // Clamp URL subTab to allowed list
    const urlSubTab = searchParams.get('subTab');
    const currentSubTab = urlSubTab && allowedKeys.includes(urlSubTab)
        ? urlSubTab
        : allowedKeys[0] || '';

    // Sync URL if clamped (replace to avoid history pollution)
    useEffect(() => {
        if (!isLoading && currentSubTab && currentSubTab !== urlSubTab) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('subTab', currentSubTab);
            setSearchParams(newParams, { replace: true });
        }
    }, [currentSubTab, urlSubTab, searchParams, setSearchParams, isLoading]);

    const handleTabChange = (value: string) => {
        // SAP-GRADE: Only allow navigation to allowed subTabs
        if (!allowedKeys.includes(value)) return;
        
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('subTab', value);
            return newParams;
        }, { replace: true });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">İcazələr yoxlanılır...</p>
                </div>
            </div>
        );
    }

    // SAP-GRADE: Terminal 403 if no allowed subTabs
    if (allowedKeys.length === 0) {
        return (
            <div className="p-8">
                <Inline403 message="Bu bölməni görmək üçün icazəniz yoxdur." />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 h-full">
            <Tabs value={currentSubTab} onValueChange={handleTabChange} className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* SAP-GRADE: ONLY allowed triggers render */}
                <TabsList className="shrink-0 w-full justify-start bg-transparent p-0 gap-2">
                    {allowedSubTabs.map(subTab => (
                        <TabsTrigger
                            key={subTab.key}
                            value={subTab.key}
                            data-subtab={subTab.key}
                            className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 font-semibold"
                        >
                            {SUBTAB_ICONS[subTab.key]}
                            {subTab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* SAP-GRADE: ONLY allowed content panes render */}
                <div className="flex-1 overflow-auto min-h-0">
                    {allowedSubTabs.map(subTab => (
                        <TabsContent
                            key={subTab.key}
                            value={subTab.key}
                            className="space-y-4 h-full m-0 p-1"
                        >
                            {SUBTAB_COMPONENTS[subTab.key]}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}
