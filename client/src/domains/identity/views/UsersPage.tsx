import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldAlert } from "lucide-react";
import { UsersListTab } from "./UsersListTab";
import { CuratorsListTab } from "./CuratorsListTab";
import { useSearchParams } from "react-router-dom";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { PermissionSlugs } from "@/app/security/permission-slugs";

import { useHelp } from "@/app/context/HelpContext";
import { useEffect } from "react";

export default function UsersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "users"; // Will be validated by effect
    const { setPageKey } = useHelp();
    const { hasAny } = usePermissions();

    // Permission Logic
    const canViewUsers = hasAny([
        PermissionSlugs.SYSTEM.USERS.READ,
        PermissionSlugs.SYSTEM.USERS.CONNECT_TO_EMPLOYEE
    ]);
    const canViewCurators = hasAny([PermissionSlugs.SYSTEM.CURATORS.READ]);

    // Valid Tabs Calculation
    const validTabs: string[] = [];
    if (canViewUsers) validTabs.push("users");
    if (canViewCurators) validTabs.push("curators");

    useEffect(() => {
        setPageKey("users");
    }, [setPageKey]);

    // Smart Redirect for Tabs
    useEffect(() => {
        if (validTabs.length === 0) return; // Wait for perms or handled by route guard

        // If current activeTab is not valid, switch to the first valid one
        if (!validTabs.includes(activeTab)) {
            setSearchParams({ tab: validTabs[0] }, { replace: true });
        }
    }, [activeTab, validTabs.join(','), setSearchParams]); // validTabs.join to avoid deep dependency issues

    const handleTabChange = (val: string) => {
        setSearchParams({ tab: val });
    };

    // If activeTab is invalid, we are redirecting, so don't render bad state
    if (!validTabs.includes(activeTab) && validTabs.length > 0) return null;

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
                            {canViewUsers && (
                                <TabsTrigger
                                    value="users"
                                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                                >
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        İstifadəçilər
                                    </div>
                                </TabsTrigger>
                            )}
                            {canViewCurators && (
                                <TabsTrigger
                                    value="curators"
                                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                                >
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4" />
                                        Kuratorlar
                                    </div>
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    {canViewUsers && (
                        <TabsContent value="users" className="flex-1 mt-4 overflow-hidden data-[state=inactive]:hidden">
                            <UsersListTab />
                        </TabsContent>
                    )}

                    {canViewCurators && (
                        <TabsContent value="curators" className="flex-1 mt-4 overflow-hidden data-[state=inactive]:hidden">
                            <CuratorsListTab />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
