import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldAlert } from "lucide-react";
import { UsersListTab } from "./UsersListTab";
import { CuratorsListTab } from "./CuratorsListTab";
import { useSearchParams } from "react-router-dom";

import { useHelp } from "@/app/context/HelpContext";
import { useEffect } from "react";

export default function UsersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "users";
    const { setPageKey } = useHelp();

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
                            <TabsTrigger
                                value="users"
                                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    İstifadəçilər
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="curators"
                                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 font-medium"
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    Kuratorlar
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="users" className="flex-1 mt-4 overflow-hidden data-[state=inactive]:hidden">
                        <UsersListTab />
                    </TabsContent>

                    <TabsContent value="curators" className="flex-1 mt-4 overflow-hidden data-[state=inactive]:hidden">
                        <CuratorsListTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
