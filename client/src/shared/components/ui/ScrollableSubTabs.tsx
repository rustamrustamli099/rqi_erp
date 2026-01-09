/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-GRADE Scrollable SubTabs Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Reusable scrollable sub-tabs component used across:
 * - System Console → Monitoring
 * - Developer Hub
 * - Billing Configuration
 * - Dictionaries
 * - Roles & Permissions
 * 
 * Features:
 * - X-axis scroll when tabs don't fit
 * - Consistent design across all pages
 * - SAP-grade: renders ONLY provided subTabs (no filtering)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface SubTabItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

interface ScrollableSubTabsProps {
    tabs: SubTabItem[];
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    /** Variant for different styling contexts */
    variant?: 'default' | 'pill' | 'underline';
}

/**
 * ScrollableSubTabs - SAP-Grade Reusable Component
 * 
 * Usage:
 * ```tsx
 * <ScrollableSubTabs
 *   tabs={[
 *     { key: 'pricing', label: 'Qiymət', content: <PricingTab /> },
 *     { key: 'limits', label: 'Limitlər', content: <LimitsTab /> }
 *   ]}
 *   value={currentTab}
 *   onValueChange={setCurrentTab}
 * />
 * ```
 */
export function ScrollableSubTabs({
    tabs,
    value,
    onValueChange,
    className,
    variant = 'default'
}: ScrollableSubTabsProps) {
    if (tabs.length === 0) {
        return null;
    }

    const getTabsTriggerClassName = () => {
        switch (variant) {
            case 'pill':
                return "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background rounded-md px-4 py-2";
            case 'underline':
                return "data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 font-semibold";
            default:
                return "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background";
        }
    };

    return (
        <Tabs value={value} onValueChange={onValueChange} className={cn("space-y-4", className)}>
            {/* Scrollable Tab List Container */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <TabsList className="flex h-auto w-max justify-start gap-2 bg-transparent p-0">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.key}
                            value={tab.key}
                            data-subtab={tab.key}
                            className={getTabsTriggerClassName()}
                        >
                            {tab.icon && <span className="mr-2">{tab.icon}</span>}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            {/* Tab Content Panes */}
            {tabs.map(tab => (
                <TabsContent
                    key={tab.key}
                    value={tab.key}
                    className="space-y-4 m-0"
                >
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
}

/**
 * ScrollableSubTabsFromResolver - For use with ResolvedNavNode
 * 
 * Specifically designed to work with navigationResolver output
 */
import { type ResolvedNavNode } from "@/app/navigation/useMenu";

interface ScrollableSubTabsFromResolverProps {
    tabNode?: ResolvedNavNode;
    value: string;
    onValueChange: (value: string) => void;
    /** Map subTab keys to their content components */
    contentMap: Record<string, React.ReactNode>;
    /** Map subTab keys to their icons */
    iconMap?: Record<string, React.ReactNode>;
    className?: string;
    variant?: 'default' | 'pill' | 'underline';
}

/**
 * ScrollableSubTabsFromResolver - SAP-Grade with Resolver Integration
 * 
 * Usage:
 * ```tsx
 * <ScrollableSubTabsFromResolver
 *   tabNode={monitoringTabNode}
 *   value={currentSubTab}
 *   onValueChange={handleSubTabChange}
 *   contentMap={{
 *     dashboard: <MonitoringDashboard />,
 *     alerts: <AlertsTab />,
 *     logs: <LogsTab />
 *   }}
 *   iconMap={{
 *     dashboard: <Activity className="h-4 w-4" />,
 *     alerts: <AlertTriangle className="h-4 w-4" />
 *   }}
 * />
 * ```
 */
export function ScrollableSubTabsFromResolver({
    tabNode,
    value,
    onValueChange,
    contentMap,
    iconMap = {},
    className,
    variant = 'underline'
}: ScrollableSubTabsFromResolverProps) {
    const subTabs = tabNode?.children ?? [];

    if (subTabs.length === 0) {
        return null;
    }

    // Convert ResolvedNavNode children to SubTabItem format
    const tabs: SubTabItem[] = subTabs.map(node => ({
        key: node.subTabKey || node.id,
        label: node.label,
        icon: iconMap[node.subTabKey || node.id],
        content: contentMap[node.subTabKey || node.id] || <div>Content not found</div>
    }));

    return (
        <ScrollableSubTabs
            tabs={tabs}
            value={value}
            onValueChange={onValueChange}
            className={className}
            variant={variant}
        />
    );
}

export default ScrollableSubTabs;
