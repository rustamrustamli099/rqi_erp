import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldAlert } from "lucide-react";
import { UsersListTab } from "./UsersListTab";
import { CuratorsListTab } from "./CuratorsListTab";
import { useSearchParams } from "react-router-dom";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedTabs } from "@/app/security/navigationResolver";
import { useHelp } from "@/app/context/HelpContext";
import { useEffect, useMemo } from "react";

// Tab icons
const TAB_ICONS: Record<string, React.ComponentType<any>> = {
    users: Users,
    curators: ShieldAlert,
};

export default function UsersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageKey } = useHelp();
    const { permissions } = usePermissions();

    // SAP-GRADE: Get allowed tabs from resolver (EXACT match)
    const allowedTabs = useMemo(() => {
        return getAllowedTabs('admin.users', permissions, 'admin');
    }, [permissions]);

    const activeTab = searchParams.get("tab") || (allowedTabs[0]?.key || "users");

    useEffect(() => {
        setPageKey("users");
    }, [setPageKey]);

    const handleTabChange = (val: string) => {
        setSearchParams({ tab: val });
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground animate-in fade-in duration-500">
            <div className="px-8 pt-6">
                <PageHeader
                    heading="İstifadəçi İdarəetmə Paneli"
                    text="Sistem istifadəçiləri və səlahiyyətli kuratorları idarə edin."
                />
            </div>

            <div className="flex-1 p-8 pt-4 overflow-hidden min-w-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
                    <div className="border-b">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 gap-6">
                            {/* SAP-GRADE: Only render ALLOWED tabs */}
                            {allowedTabs.map(tab => {
                                const Icon = TAB_ICONS[tab.key] || Users;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </div>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    <TabsContent value="users" className="flex-1 overflow-auto pt-4 min-h-0">
                        <UsersListTab />
                    </TabsContent>
                    <TabsContent value="curators" className="flex-1 overflow-auto pt-4 min-h-0">
                        <CuratorsListTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
