
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionMatrix } from "@/shared/components/rbac/PermissionMatrix";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Key, Shield } from "lucide-react";

// Mock Data for Matrix

// Mock Data for Matrix
const roles = ["Super Admin", "Admin", "HR Manager", "Employee"];
const resources = [
    {
        name: "Users",
        permissions: [
            { action: "users.create", allowedRoles: ["Super Admin", "Admin"] },
            { action: "users.read", allowedRoles: ["Super Admin", "Admin", "HR Manager", "Employee"] },
            { action: "users.update", allowedRoles: ["Super Admin", "Admin", "HR Manager"] },
            { action: "users.delete", allowedRoles: ["Super Admin"] },
        ]
    },
    {
        name: "Finance",
        permissions: [
            { action: "invoices.read", allowedRoles: ["Super Admin", "Admin", "HR Manager"] },
            { action: "invoices.approve", allowedRoles: ["Super Admin", "Admin"] },
        ]
    }
];

export default function SecurityPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                heading="Təhlükəsizlik və Giriş"
                text="Rollar, İcazələr və API Tokenlərinin idarə edilməsi."
            />

            <Tabs defaultValue="roles" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="roles">Rollar (Roles)</TabsTrigger>
                    <TabsTrigger value="permissions">İcazələr (Permissions)</TabsTrigger>
                    <TabsTrigger value="tokens">API Tokenləri</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Rolların İdarə Edilməsi</CardTitle>
                                <CardDescription>Sistemdəki rollar və onların resurslara çıxışı.</CardDescription>
                            </div>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" /> Yeni Rol
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <PermissionMatrix roles={roles} resources={resources} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bütün İcazələr</CardTitle>
                            <CardDescription>Sistemdə mövcud olan bütün atomik icazələrin siyahısı.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 border rounded-md bg-muted/20 text-sm text-muted-foreground text-center">
                                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                İcazələr kod səviyyəsində təyin edilir və burada yalnız oxuma rejimində görünür.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tokens" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Tokenləri</CardTitle>
                            <CardDescription>Xarici inteqrasiyalar üçün tenant-scoped tokenlər.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                <div className="p-4 rounded-full bg-blue-50 text-blue-500">
                                    <Key className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Hələlik Token Yoxdur</h3>
                                    <p className="text-muted-foreground max-w-sm mt-1">
                                        Heç bir aktiv API token tapılmadı. Yeni inteqrasiya üçün token yaradın.
                                    </p>
                                </div>
                                <Button>Token Yarad</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
