import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { Zap, FileText, Activity, AlertTriangle } from "lucide-react";
import { MonitoringDashboard } from "./MonitoringDashboard";
import { AlertRulesTab } from "./AlertRulesTab";
import { AnomalyDetectionTab } from "./AnomalyDetectionTab";
import { SystemLogsTab } from "./SystemLogsTab";
import { Inline403 } from "@/shared/components/security/Inline403";

// SAP-GRADE: Import ResolvedNavNode type
import { type ResolvedNavNode } from "@/app/security/navigationResolver";

/**
 * SAP-GRADE MONITORING TAB
 * 
 * Rules:
 * - Receives tabNode from parent (ConsolePage)
 * - ONLY renders subTabs from tabNode.children (resolver output)
 * - NO getAllowedSubTabs call - UI is pure renderer
 * - NO prop shadowing
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

interface MonitoringPageProps {
    tabNode: ResolvedNavNode;
}

export default function MonitoringPage({ tabNode }: MonitoringPageProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    // SAP-GRADE: Get subTabs from tabNode.children (NOT from helper call)
    // This is the SINGLE source of truth - no recomputation
    const resolvedSubTabs = useMemo(() => {
        return tabNode?.children ?? [];
    }, [tabNode]);

    const allowedKeys = useMemo(() => resolvedSubTabs.map(st => st.subTabKey || st.id), [resolvedSubTabs]);

    // SAP-GRADE: Read subTab from URL (already canonicalized by ProtectedRoute)
    const urlSubTab = searchParams.get('subTab') || '';
    const currentSubTab = allowedKeys.includes(urlSubTab) ? urlSubTab : allowedKeys[0] || '';

    // User-initiated tab change (onClick only, not auto-sync)
    const handleTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;

        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('subTab', value);
            return newParams;
        }, { replace: true });
    };

    // SAP-GRADE: Terminal 403 if no allowed subTabs
    if (allowedKeys.length === 0) {
        return (
            <div className="p-8">
                <Inline403 message="Bu bölməni görmək üçün icazəniz yoxdur." />
            </div>
        );
    }

    // DEV assertion: verify all subTabs are rendered
    if (import.meta.env?.DEV && resolvedSubTabs.length > 0) {
        console.log('[MonitoringPage] DEBUG - resolvedSubTabs:', resolvedSubTabs.map(st => st.subTabKey || st.id));
        console.log('[MonitoringPage] DEBUG - allowedKeys:', allowedKeys);
        const uniqueKeys = new Set(allowedKeys);
        if (uniqueKeys.size !== resolvedSubTabs.length) {
            console.error('[MonitoringPage] SAP VIOLATION: Duplicate subTab keys detected! Keys:', allowedKeys);
        }
    }

    return (
        <div className="flex flex-col space-y-6 h-full">
            <Tabs value={currentSubTab} onValueChange={handleTabChange} className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* SAP-GRADE: Render ALL allowed triggers from resolver output */}
                <TabsList className="shrink-0 w-full justify-start bg-transparent p-0 gap-2">
                    {resolvedSubTabs.map(subTab => {
                        const subTabKey = subTab.subTabKey || subTab.id;
                        return (
                            <TabsTrigger
                                key={subTabKey}
                                value={subTabKey}
                                data-subtab={subTabKey}
                                className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 font-semibold"
                            >
                                {SUBTAB_ICONS[subTabKey]}
                                {subTab.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {/* SAP-GRADE: Render ALL allowed content panes */}
                <div className="flex-1 overflow-auto min-h-0">
                    {resolvedSubTabs.map(subTab => {
                        const subTabKey = subTab.subTabKey || subTab.id;
                        return (
                            <TabsContent
                                key={subTabKey}
                                value={subTabKey}
                                className="space-y-4 h-full m-0 p-1"
                            >
                                {SUBTAB_COMPONENTS[subTabKey]}
                            </TabsContent>
                        );
                    })}
                </div>
            </Tabs>
        </div>
    );
}
