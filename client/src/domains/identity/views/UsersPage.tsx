import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldAlert } from "lucide-react";
import { UsersListTab } from "./UsersListTab";
import { CuratorsListTab } from "./CuratorsListTab";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/domains/auth/context/AuthContext";
import { useMenu, type ResolvedNavNode } from "@/app/navigation/useMenu";
import { useHelp } from "@/app/context/HelpContext";
import { useEffect, useMemo } from "react";
// PHASE 14G: Import usePageState for action rendering
import { usePageState } from "@/app/security/usePageState";

// Tab icons
const TAB_ICONS: Record<string, React.ComponentType<any>> = {
    users: Users,
    curators: ShieldAlert,
};

export default function UsersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageKey } = useHelp();
    const { permissions } = useAuth();

    // PHASE 14G: Get page state from Decision Center
    // This is the ONLY source for action visibility
    const { actions: usersActions } = usePageState('Z_USERS');
    const { actions: curatorsActions } = usePageState('Z_CURATORS');

    // PHASE 14H: Use backend menu for tab visibility
    const { menu } = useMenu();



    const findNode = (nodes: ResolvedNavNode[], key: string): ResolvedNavNode | undefined => {
        for (const node of nodes) {
            // FIX: Check ID as well (Backend parity: 'users_group')
            if (node.pageKey === key || node.key === key || node.id === key) return node;
            if (node.children) {
                const found = findNode(node.children, key);
                if (found) return found;
            }
        }
        return undefined;
    };
    // Fix: Search by ID 'users_group' which matches backend definition
    const pageNode = useMemo(() => findNode(menu, 'users_group') || findNode(menu, 'admin.users'), [menu]);

    const allowedTabs = useMemo(() => pageNode?.children ?? [], [pageNode]);
    const allowedKeys = useMemo(() => allowedTabs.map(t => t.tabKey || t.id), [allowedTabs]);

    // SAP-GRADE: Read tab from URL - NO [0] fallback
    // ProtectedRoute canonicalizes URL; if invalid, it redirects
    const currentParam = searchParams.get("tab");
    // Only allow if key is in allowed list
    const activeTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : '';

    useEffect(() => {
        setPageKey("users");
    }, [setPageKey]);

    // SAP-GRADE: Clear pagination params when tab changes
    const handleTabChange = (val: string) => {
        // Strict: only allow if in allowedKeys
        if (!allowedKeys.includes(val)) return;
        setSearchParams(_prev => {
            // Start fresh - only navigation params
            const newParams = new URLSearchParams();
            newParams.set('tab', val);
            return newParams;
        });
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
                    {/* Reusable Scrollable Tabs - Pill Style */}
                    <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent border-b">
                        <TabsList className="flex h-auto w-max justify-start gap-2 bg-transparent p-0">
                            {allowedTabs.map(tab => {
                                const tabKey = tab.tabKey || tab.id;
                                const Icon = TAB_ICONS[tabKey] || Users;
                                return (
                                    <TabsTrigger
                                        key={tabKey}
                                        value={tabKey}
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

                    {/* PHASE 14G: Pass actions to child components */}
                    {allowedKeys.includes('users') && (
                        <TabsContent value="users" className="flex-1 overflow-auto pt-4 min-h-0">
                            <UsersListTab actions={usersActions} />
                        </TabsContent>
                    )}
                    {allowedKeys.includes('curators') && (
                        <TabsContent value="curators" className="flex-1 overflow-auto pt-4 min-h-0">
                            <CuratorsListTab actions={curatorsActions} />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
