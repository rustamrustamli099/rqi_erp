import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
// PHASE 100% PFCG: Backend Decision Center
import { usePageState } from "@/app/security/usePageState";

export default function DepartmentsPage() {
    // PHASE 100% PFCG: Backend-driven action visibility
    const { actions } = usePageState('Z_DEPARTMENTS');
    const canCreate = actions?.GS_DEPARTMENTS_CREATE ?? false;

    // Mock Data
    const [departments] = useState([
        { id: 1, name: "Information Technology", head: "Rəşad Əliyev", employeeCount: 12 },
        { id: 2, name: "Human Resources", head: "Ayşə Məmmədova", employeeCount: 4 },
        { id: 3, name: "Finance", head: "Leyla Kərimova", employeeCount: 6 },
        { id: 4, name: "Marketing", head: "Nigar Sultanova", employeeCount: 8 },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
                    <p className="text-muted-foreground">Manage company departments and structure.</p>
                </div>
                {canCreate && (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Department
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                    <Card key={dept.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Department</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardHeader>
                            <CardTitle>{dept.name}</CardTitle>
                            <CardDescription>Head: {dept.head}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dept.employeeCount}</div>
                            <p className="text-xs text-muted-foreground">Employees</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
