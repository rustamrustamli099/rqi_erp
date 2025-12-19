import AuditLogsTab from "./AuditLogsTab";
import { PageHeader } from "@/shared/components/ui/page-header";

export default function AuditPage() {
    return (
        <div className="flex flex-col min-h-[80vh] h-auto bg-background animate-in fade-in-50 duration-500">
            <div className="px-8 pt-6 flex-shrink-0">
                <PageHeader
                    heading="Audit və Uyğunluq"
                    text="Sistem əməliyyatlarının izlənməsi və arxivləşdirilməsi."
                />
            </div>
            <div className="flex-1 p-8 pt-4 overflow-hidden min-w-0">
                <div className="h-full overflow-y-auto">
                    {/* Wrapping in Card to match Settings look if desired, or just raw tab content */}
                    {/* User said "bg ver settingsdeki kimi", which usually implies the white card background if Settings has it. Settings has Card inside tabs. */}
                    {/* AuditLogsTab returns a div with "border rounded-md". */}
                    {/* If I wrap it in Card, it might double border. */}
                    {/* But SettingsPage renders AuditLogsTab directly inside `activeTab === 'audit'`. */}
                    {/* SettingsPage doesn't wrap AuditLogsTab in Card (lines 285). */}
                    {/* So raw import is fine, but wrapper provides the scroll container. */}
                    <AuditLogsTab />
                </div>
            </div>
        </div>
    )
}
