import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, Database, Eye, MoreHorizontal, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/shared/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { RetentionEditDialog } from "./RetentionEditDialog";

// Mock Data
const MOCK_POLICIES = [
    {
        id: "1",
        entity: "Audit Logs",
        scope: "TENANT",
        duration: "5 Years",
        action: "ARCHIVE (S3)",
        status: "ACTIVE",
        nextRun: "Tonight 01:00",
        stats: { eligible: 12500, size: "450 MB" }
    },
    {
        id: "2",
        entity: "Deleted Files",
        scope: "GLOBAL",
        duration: "30 Days",
        action: "DELETE PERMANENTLY",
        status: "ACTIVE",
        nextRun: "Tonight 02:00",
        stats: { eligible: 54, size: "1.2 GB" }
    },
    {
        id: "3",
        entity: "User Sessions",
        scope: "TENANT",
        duration: "24 Hours",
        action: "DELETE",
        status: "PAUSED",
        nextRun: "-",
        stats: { eligible: 0, size: "0 KB" }
    }
];

type Policy = typeof MOCK_POLICIES[0];

export default function RetentionPage() {
    const [mockData, setMockData] = useState(MOCK_POLICIES);
    const [previewPolicy, setPreviewPolicy] = useState<Policy | null>(null);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

    const handleUpdate = (updated: Partial<Policy>) => {
        setMockData(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
        setEditingPolicy(null);
    };

    const handleArchive = (policy: Policy) => {
        setMockData(prev => prev.map(p => p.id === policy.id ? { ...p, status: "ARCHIVED" } : p));
    };

    const columns = useMemo<ColumnDef<Policy>[]>(
        () => [
            {
                accessorKey: "entity",
                header: "Entity",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 font-medium">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        {row.original.entity}
                    </div>
                ),
            },
            {
                accessorKey: "scope",
                header: "Scope",
                cell: ({ row }) => <Badge variant="outline">{row.original.scope}</Badge>,
            },
            {
                accessorKey: "duration",
                header: "Duration",
                cell: ({ row }) => <span>{row.original.duration}</span>,
            },
            {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }) => (
                    <span className={`text-xs font-mono px-2 py-1 rounded ${row.original.action.includes('DELETE') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {row.original.action}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {row.original.status}
                    </Badge>
                ),
            },
            {
                id: "actions",
                header: "Əməliyyatlar",
                cell: ({ row }) => {
                    const policy = row.original;
                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setPreviewPolicy(policy)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Sınaq İcra (Dry Run)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEditingPolicy(policy)}>
                                        <Settings2 className="w-4 h-4 mr-2" />
                                        Düzəliş et (Edit)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleArchive(policy)} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Arxivlə (Disable)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        []
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Archive className="w-5 h-5 text-primary" />
                        Retention Policies
                    </h3>
                    <p className="text-sm text-muted-foreground">Məlumatların saxlanma müddəti və təmizlənmə qaydaları.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Saxlanma Qaydaları (Policy Rules)</CardTitle>
                    <CardDescription>Aktiv təmizləmə və arxivləmə qaydaları</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={mockData}
                        filterColumn="entity"
                        filterPlaceholder="Entity axtar..."
                    />
                </CardContent>
            </Card>

            <Dialog open={!!previewPolicy} onOpenChange={(open) => !open && setPreviewPolicy(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sınaq İcra: {previewPolicy?.entity}</DialogTitle>
                        <DialogDescription>
                            Bu siyasət icra olunarsa, aşağıdakı məlumatlar təsirlənəcək:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Card className="bg-muted/50 border-dashed">
                            <CardContent className="pt-6 text-center">
                                <div className="text-2xl font-bold">{previewPolicy?.stats.eligible.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Silinəcək Obyektlərin sayı</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/50 border-dashed">
                            <CardContent className="pt-6 text-center">
                                <div className="text-2xl font-bold">{previewPolicy?.stats.size}</div>
                                <div className="text-xs text-muted-foreground">Azad olunacaq yer</div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

            {editingPolicy && (
                <RetentionEditDialog
                    open={!!editingPolicy}
                    onOpenChange={(open) => !open && setEditingPolicy(null)}
                    policy={editingPolicy}
                    onSave={handleUpdate}
                />
            )}
        </div>
    );
}
