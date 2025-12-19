import AccessMonitoringTab from "./MonitoringTab"; // Assuming export default is AccessMonitoringTab or similar
// Wait, step 5308 imported it as `MonitoringPage`.
// I need to check the export of MonitoringTab.tsx
// I will check it in next step before assuming the import name.
// But mostly it's default export.

import { PageHeader } from "@/shared/components/ui/page-header";

export default function MonitoringPage() {
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
                    <AccessMonitoringTab />
                </div>
            </div>
        </div>
    )
}
