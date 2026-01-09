/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-GRADE MONITORING TAB
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Uses ScrollableSubTabsFromResolver for consistent UI across all pages.
 * Receives tabNode from parent (ConsolePage) - UI is pure renderer.
 */

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Zap, FileText, Activity, AlertTriangle } from "lucide-react";
import { MonitoringDashboard } from "./MonitoringDashboard";
import { AlertRulesTab } from "./AlertRulesTab";
import { AnomalyDetectionTab } from "./AnomalyDetectionTab";
import { SystemLogsTab } from "./SystemLogsTab";
import { Inline403 } from "@/shared/components/security/Inline403";
import { ScrollableSubTabsFromResolver } from "@/shared/components/ui/ScrollableSubTabs";
import { type ResolvedNavNode } from "@/app/navigation/useMenu";

// SubTab component mapping
const SUBTAB_CONTENT: Record<string, React.ReactNode> = {
    dashboard: <MonitoringDashboard />,
    alerts: <AlertRulesTab />,
    anomalies: <AnomalyDetectionTab />,
    logs: <SystemLogsTab />,
};

// SubTab icons
const SUBTAB_ICONS: Record<string, React.ReactNode> = {
    dashboard: <Activity className="h-4 w-4" />,
    alerts: <AlertTriangle className="h-4 w-4" />,
    anomalies: <Zap className="h-4 w-4" />,
    logs: <FileText className="h-4 w-4" />,
};

interface MonitoringTabProps {
    tabNode: ResolvedNavNode;
}

export default function MonitoringTab({ tabNode }: MonitoringTabProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    // SAP-GRADE: Get subTabs from tabNode.children
    const resolvedSubTabs = useMemo(() => tabNode?.children ?? [], [tabNode]);
    const allowedKeys = useMemo(() => resolvedSubTabs.map(st => st.subTabKey || st.id), [resolvedSubTabs]);

    // SAP-GRADE: Read subTab from URL - NO [0] fallback
    // ProtectedRoute canonicalizes URL; if invalid, it redirects
    const urlSubTab = searchParams.get('subTab') || '';
    const currentSubTab = allowedKeys.includes(urlSubTab) ? urlSubTab : '';

    // User-initiated tab change
    const handleTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('subTab', value);
            return newParams;
        }, { replace: true });
    };

    // Terminal 403 if no allowed subTabs
    if (allowedKeys.length === 0) {
        return (
            <div className="p-8">
                <Inline403 message="Bu bölməni görmək üçün icazəniz yoxdur." />
            </div>
        );
    }

    // DEV debugging
    if (import.meta.env?.DEV) {
        console.log('[MonitoringTab] DEBUG:', {
            allowedKeys,
            urlSubTab,
            currentSubTab,
            subTabsCount: resolvedSubTabs.length,
            firstKey: allowedKeys[0]
        });
    }

    return (
        <div className="flex flex-col space-y-6 h-full">
            <ScrollableSubTabsFromResolver
                tabNode={tabNode}
                value={currentSubTab}
                onValueChange={handleTabChange}
                contentMap={SUBTAB_CONTENT}
                iconMap={SUBTAB_ICONS}
                variant="pill"
            />
        </div>
    );
}
