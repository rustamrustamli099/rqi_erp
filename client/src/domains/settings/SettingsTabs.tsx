import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Server, FileText, History, Key, Shield } from "lucide-react";
import NotificationRulesPage from "./NotificationRulesPage";
import { ApprovalSecurityTab as SecurityTabComponent } from "@/domains/approvals/views/ApprovalSecurityTab";
import SSOPage from "@/domains/settings/security/SSOPage";


// Settings Components (Moved)
import { EmailSettingsForm } from "./_components/settings/communication/EmailSettingsForm";
import { SmsSettingsForm } from "./_components/settings/communication/SmsSettingsForm";
import { SecuritySettingsForm } from "./_components/settings/SecuritySettingsForm";
import { ApiKeysForm } from "./_components/settings/ApiKeysForm";
// import { AuditLogsTab as RealAuditLogsTab } from "./_components/settings/audit/AuditLogsTab"; // Moved to Compliance Domain
// import MonitoringTab from "./_components/settings/monitoring/MonitoringTab"; // Moved to Monitoring Domain
// import FilesManagerPage from "./_components/settings/files/FilesManagerPage"; // Moved to Documents Domain

const PlaceholderTab = ({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg m-6">
            <Hammer className="h-8 w-8 mb-2 opacity-50" />
            <p>Bu bölmə başqa modula köçürüldü</p>
        </CardContent>
    </Card>
);

export const AuditLogsFilter = () => <div className="p-4 border rounded">Audit Logs Filter</div>;

// Monitoring Wrapper (Deprecated)
export const AdvancedMonitoringTab = () => <PlaceholderTab title="Monitoring" description="Moved to dedicated module" icon={Server} />;

// Files Manager
export const FilesManagerTab = () => (
    <div className="h-full">
        <PlaceholderTab title="Files Manager" description="Moved to Documents module" icon={FileText} />
    </div>
);

export const AuditLogsTab = () => <PlaceholderTab title="Audit Logs" description="Moved to Audit & Compliance module" icon={History} />;

export const ApiKeysTab = () => (
    <div className="h-full">
        <ApiKeysForm />
    </div>
);

export const SmsSettingsTab = () => (
    <div className="h-full">
        <SmsSettingsForm />
    </div>
);

export const EmailSettingsTab = () => (
    <div className="h-full">
        <EmailSettingsForm />
    </div>
);


export const SecuritySettingsTab = ({ tabNode }: { tabNode: ResolvedNavNode }) => (
    <div className="h-full">
        <SecuritySettingsForm tabNode={tabNode} />
    </div>
);

export const ApprovalRulesTab = () => <PlaceholderTab title="Approval Rules" description="Moved to Approvals module" icon={Key} />;

export const ApprovalSecurityTab = () => (
    <div className="h-full">
        <SecurityTabComponent />
    </div>
);

export const NotificationsTab = () => (
    <div className="h-full">
        <NotificationRulesPage />
    </div>
);

import DocumentTemplatesPage from "@/domains/documents/views/DocumentTemplatesPage";
import { BillingConfigForm } from "./_components/settings/BillingConfigForm";

import { type ResolvedNavNode } from "@/app/navigation/useMenu";

export const BillingConfigTab = ({ tabNode }: { tabNode: ResolvedNavNode }) => (
    <div className="h-full">
        <BillingConfigForm tabNode={tabNode} />
    </div>
);


export const DocumentTemplatesTab = () => (
    <div className="h-full">
        <DocumentTemplatesPage />
    </div>
);

export const SSOSettingsTab = () => (
    <div className="h-full">
        <SSOPage />
    </div>
);




