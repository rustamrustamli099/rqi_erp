import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Users, Shield, Warehouse, BarChart } from "lucide-react";
import { DataTable } from "@/shared/components/ui/data-table";

// Mock Data
const MOCK_USERS = [
    { id: "1", name: "Elvin Məmmədov", role: "Manager", status: "active" },
    { id: "2", name: "Aysel Əliyeva", role: "HR", status: "active" },
];

export default function BranchDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/branches")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Sumqayıt Filialı</h2>
                    <p className="text-muted-foreground">Kodu: BR-002 • Region: Sumqayıt • Status: Aktiv</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline">Redaktə Et</Button>
                    <Button variant="destructive">Deaktiv Et</Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                        <BarChart className="w-4 h-4 mr-2" /> İcmal
                    </TabsTrigger>
                    <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                        <Users className="w-4 h-4 mr-2" /> İstifadçilər
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                        <Shield className="w-4 h-4 mr-2" /> Rollar & İcazələr
                    </TabsTrigger>
                    <TabsTrigger value="warehouse" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                        <Warehouse className="w-4 h-4 mr-2" /> Anbarlar
                    </TabsTrigger>
                </TabsList>

                <div className="pt-6">
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">İşçilərin Sayı</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12</div>
                                    <p className="text-xs text-muted-foreground">+2 new since last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Aylıq Gəlir (Attr.)</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₼45,231.89</div>
                                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Anbar Doluluğu</CardTitle>
                                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">85%</div>
                                    <p className="text-xs text-muted-foreground">Kritik həddə yaxınlaşır</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <div>
                                        <CardTitle>Filial İstifadçiləri</CardTitle>
                                        <CardDescription>Bu filiala təhkim olunmuş istifadəçilər.</CardDescription>
                                    </div>
                                    <Button size="sm">+ İşçi Təyin Et</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">User table placeholder...</div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="roles">
                        <div className="text-center py-8 text-muted-foreground">Branch specific role overrides coming soon.</div>
                    </TabsContent>

                    <TabsContent value="warehouse">
                        <div className="text-center py-8 text-muted-foreground">Warehouse linkage module coming soon.</div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
