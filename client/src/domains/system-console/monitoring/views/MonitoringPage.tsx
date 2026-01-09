/**
 * MonitoringPage Wrapper
 * 
 * SAP-GRADE: Passes tabNode prop to MonitoringTab
 */

import MonitoringTab from "./MonitoringTab";
import { PageHeader } from "@/shared/components/ui/page-header";
import { type ResolvedNavNode } from "@/app/navigation/useMenu";

interface MonitoringPageProps {
    tabNode: ResolvedNavNode;
}

export default function MonitoringPage({ tabNode }: MonitoringPageProps) {
    return (
        <div className="flex flex-col min-h-[80vh] h-auto bg-background animate-in fade-in-50 duration-500">
            <div className="px-8 pt-6 flex-shrink-0">
                <PageHeader
                    heading="Sistem Monitorinqi"
                    text="Performans, təhlükəsizlik və sistem sağlamlığı göstəriciləri."
                />
            </div>
            <div className="flex-1 p-8 pt-4 overflow-hidden min-w-0">
                <div className="h-full overflow-y-auto">
                    {/* SAP-GRADE: Pass tabNode to MonitoringTab */}
                    <MonitoringTab tabNode={tabNode} />
                </div>
            </div>
        </div>
    )
}
