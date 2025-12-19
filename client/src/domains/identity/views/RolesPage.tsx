
import { PageHeader } from "@/shared/components/ui/page-header";
import { PermissionMatrix } from "@/shared/components/rbac/PermissionMatrix";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mockRoles = ["Super Admin", "Admin", "HR Manager", "Employee"];

const mockResources = [
    {
        name: "Users (İstifadəçilər)",
        permissions: [
            { action: "users.create", allowedRoles: ["Super Admin", "Admin", "HR Manager"] },
            { action: "users.read", allowedRoles: ["Super Admin", "Admin", "HR Manager", "Employee"] },
            { action: "users.update", allowedRoles: ["Super Admin", "Admin", "HR Manager"] },
            { action: "users.delete", allowedRoles: ["Super Admin"] },
        ]
    },
    {
        name: "Finance (Maliyyə)",
        permissions: [
            { action: "finance.invoices.create", allowedRoles: ["Super Admin", "Admin"] },
            { action: "finance.invoices.read", allowedRoles: ["Super Admin", "Admin"] },
            { action: "finance.salary.view", allowedRoles: ["Super Admin", "HR Manager"] },
        ]
    },
    {
        name: "System (Sistem)",
        permissions: [
            { action: "system.settings", allowedRoles: ["Super Admin"] },
            { action: "system.logs", allowedRoles: ["Super Admin", "Admin"] },
        ]
    }
];

export default function RolesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                heading="Rollarda İcazələr (Permission Matrix)"
                text="Sistemdəki rolların icazə matrisi və təhlükəsizlik qaydaları."
            />

            <Card>
                <CardHeader>
                    <CardTitle>İcazə Cədvəli</CardTitle>
                    <CardDescription>Rollara görə hansı əməliyyatların mümkün olduğunu göstərən cədvəl.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PermissionMatrix roles={mockRoles} resources={mockResources} />
                </CardContent>
            </Card>
        </div>
    );
}
