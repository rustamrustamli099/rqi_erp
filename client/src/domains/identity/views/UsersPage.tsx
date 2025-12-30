import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldAlert } from "lucide-react";
import { UsersListTab } from "./UsersListTab";
import { CuratorsListTab } from "./CuratorsListTab";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { evaluateRoute, getAllowedTabs } from "@/app/security/navigationResolver";
import { useHelp } from "@/app/context/HelpContext";
import { useEffect, useMemo, useState } from "react";
import { Inline403 } from "@/shared/components/security/Inline403";

// Tab icons
const TAB_ICONS: Record<string, React.ComponentType<any>> = {
    users: Users,
    curators: ShieldAlert,
};

export default function UsersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageKey } = useHelp();
    const { permissions } = usePermissions();
    const [denyReason, setDenyReason] = useState<string | null>(null);

    // SAP-GRADE: Get allowed tabs from resolver (EXACT match)
    const allowedTabs = useMemo(() => {
        return getAllowedTabs('admin.users', permissions, 'admin');
    }, [permissions]);

    const allowedTabKeys = useMemo(() => allowedTabs.map(t => t.key), [allowedTabs]);

    useEffect(() => {
        const decision = evaluateRoute(
            location.pathname,
            new URLSearchParams(location.search),
            permissions,
            'admin'
        );

        if (decision.decision === 'REDIRECT') {
            navigate(decision.normalizedUrl, { replace: true });
            setDenyReason(null);
        } else if (decision.decision === 'DENY') {
            setDenyReason(decision.reason);
        } else {
            setDenyReason(null);
        }
    }, [location.pathname, location.search, permissions, navigate]);

    const activeTab = searchParams.get("tab") || (allowedTabs[0]?.key || "users");

    useEffect(() => {
        setPageKey("users");
    }, [setPageKey]);

    const handleTabChange = (val: string) => {
        if (!allowedTabKeys.includes(val)) return;
        setSearchParams({ tab: val });
    };

    if (denyReason) {
        return <Inline403 message={denyReason} />;
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

                    {allowedTabKeys.includes('users') && (
                        <TabsContent value="users" className="flex-1 overflow-auto pt-4 min-h-0">
                            <UsersListTab />
                        </TabsContent>
                    )}
                    {allowedTabKeys.includes('curators') && (
                        <TabsContent value="curators" className="flex-1 overflow-auto pt-4 min-h-0">
                            <CuratorsListTab />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
