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

    const allowedKeys = useMemo(() => allowedTabs.map(t => t.key), [allowedTabs]);

    // SAP-GRADE: Read tab from URL (already canonicalized by ProtectedRoute)
    // NO useEffect URL sync - ProtectedRoute is sole canonicalizer
    const currentParam = searchParams.get("tab");
    const activeTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : allowedKeys[0] || "";

    useEffect(() => {
        setPageKey("users");
    }, [setPageKey]);

    // SAP-GRADE: MERGE params, don't replace
    const handleTabChange = (val: string) => {
        if (!allowedKeys.includes(val)) return;
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('tab', val);
            newParams.delete('subTab');
            return newParams;
        });
    };

    if (allowedKeys.length === 0) {
        return (
            <div className="p-8">
                <p className="text-sm text-muted-foreground">You do not have permission to view Users.</p>
            </div>
        );
    }

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
                    {/* Reusable Scrollable Tabs - Pill Style */}
                    <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent border-b">
                        <TabsList className="flex h-auto w-max justify-start gap-2 bg-transparent p-0">
                            {allowedTabs.map(tab => {
                                const Icon = TAB_ICONS[tab.key] || Users;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background rounded-md px-4 py-2"
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

                    {/* SAP-GRADE: Only render ALLOWED TabsContent */}
                    {allowedKeys.includes('users') && (
                        <TabsContent value="users" className="flex-1 overflow-auto pt-4 min-h-0">
                            <UsersListTab />
                        </TabsContent>
                    )}
                    {allowedKeys.includes('curators') && (
                        <TabsContent value="curators" className="flex-1 overflow-auto pt-4 min-h-0">
                            <CuratorsListTab />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

