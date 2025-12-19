import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Trash2, Clock, AlertTriangle, Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";

interface RetentionRule {
    id: string;
    entity: string;
    condition: string;
    action: 'archive' | 'delete';
    status: 'active' | 'paused';
}

const mockRules: RetentionRule[] = [
    { id: '1', entity: 'Audit Logs', condition: 'Older than 90 days', action: 'archive', status: 'active' },
    { id: '2', entity: 'System Notifications', condition: 'Older than 30 days', action: 'delete', status: 'active' },
    { id: '3', entity: 'User Sessions', condition: 'Older than 7 days', action: 'delete', status: 'paused' },
];

export default function RetentionPolicyPage() {
    const [rules, setRules] = useState<RetentionRule[]>(mockRules);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<string | null>(null);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRule, setNewRule] = useState<Partial<RetentionRule>>({ status: "active", action: "archive" });

    // Confirmation States
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
    const [simConfirmOpen, setSimConfirmOpen] = useState(false);

    // Table State
    const [sorting, setSorting] = useState<SortingState>([]);

    const confirmSimulation = () => {
        setSimConfirmOpen(true);
    };

    const handleSimulation = () => {
        setIsSimulating(true);
        setSimConfirmOpen(false); // Close dialog
        // Mock simulation delay
        setTimeout(() => {
            setIsSimulating(false);
            setSimulationResult("Simulyasiya tamamlandı: 154 element (Audit: 102, Notifs: 52) təmizlənməyə namizəddir.");
        }, 1500);
    };

    const handleSaveRule = () => {
        if (!newRule.entity || !newRule.condition) {
            toast.error("Zəhmət olmasa bütün sahələri doldurun");
            return;
        }

        const rule: RetentionRule = {
            id: Date.now().toString(),
            entity: newRule.entity!,
            condition: newRule.condition!,
            action: newRule.action as 'archive' | 'delete' || 'archive',
            status: newRule.status as 'active' | 'paused' || 'active'
        };

        setRules([...rules, rule]);
        setIsDialogOpen(false);
        setNewRule({ status: "active", action: "archive" }); // reset
        toast.success("Yeni qayda əlavə edildi");
    };

    const confirmDelete = (id: string) => {
        setRuleToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteRule = () => {
        if (ruleToDelete) {
            setRules(rules.filter(r => r.id !== ruleToDelete));
            toast.success("Qayda silindi");
            setRuleToDelete(null);
            setDeleteConfirmOpen(false);
        }
    }

    const columns: ColumnDef<RetentionRule>[] = [
        {
            accessorKey: "entity",
            header: "Entity",
            cell: ({ row }) => <span className="font-medium">{row.getValue("entity")}</span>
        },
        {
            accessorKey: "condition",
            header: "Şərt",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {row.getValue("condition")}
                </div>
            )
        },
        {
            accessorKey: "action",
            header: "Əməliyyat Tipi",
            cell: ({ row }) => {
                const action = row.getValue("action") as string;
                return action === 'archive' ? (
                    <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-0">
                        <Archive className="w-3 h-3" /> Archive
                    </Badge>
                ) : (
                    <Badge variant="destructive" className="gap-1 bg-red-100 text-red-700 hover:bg-red-100/80 border-0">
                        <Trash2 className="w-3 h-3" /> Soft Delete
                    </Badge>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'outline'}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => confirmDelete(row.original.id)} className="text-red-600 focus:text-red-600">
                            Sil
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const table = useReactTable({
        data: rules,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <PageHeader
                        heading="Data Retention Policy"
                        text="Məlumatların saxlanma və arxivlənmə qaydalarını idarə edin."
                        className="pb-2 border-none mb-0"
                    />
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Yeni Qayda
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-2 shadow-sm">
                    <CardHeader className="px-6">
                        <CardTitle>Aktiv Qaydalar</CardTitle>
                        <CardDescription>
                            Sistem bu qaydaları avtomatik olaraq icra edir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </TableHead>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                Nəticə tapılmadı.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="px-4 py-4 border-t">
                            <DataTablePagination table={table} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/10 border-dashed h-fit sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Dry Run (Preview)
                        </CardTitle>
                        <CardDescription>
                            Bu həftə silinəcək təxmini məlumatlar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span>Audit Logs</span>
                            <span className="font-mono text-muted-foreground">~12.4 MB</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span>Notifications</span>
                            <span className="font-mono text-muted-foreground">~450 items</span>
                        </div>

                        {simulationResult && (
                            <div className="bg-background border p-3 rounded-md text-xs text-green-700 font-medium animate-in fade-in slide-in-from-top-2">
                                {simulationResult}
                            </div>
                        )}

                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            size="sm"
                            onClick={confirmSimulation} // Updated handler
                            disabled={isSimulating}
                        >
                            {isSimulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isSimulating ? "Hesablanır..." : "Simulyasiya Et"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Retention Qaydası</DialogTitle>
                        <DialogDescription>
                            Avtomatik təmizləmə qaydası yaradın.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Entity (Obyekt)</Label>
                            <Select onValueChange={(v) => setNewRule({ ...newRule, entity: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Audit Logs">Audit Logs</SelectItem>
                                    <SelectItem value="System Notifications">System Notifications</SelectItem>
                                    <SelectItem value="User Sessions">User Sessions</SelectItem>
                                    <SelectItem value="Temporary Files">Temporary Files</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Şərt (Condition)</Label>
                            <Select onValueChange={(v) => setNewRule({ ...newRule, condition: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Older than 7 days">Older than 7 days</SelectItem>
                                    <SelectItem value="Older than 30 days">Older than 30 days</SelectItem>
                                    <SelectItem value="Older than 90 days">Older than 90 days</SelectItem>
                                    <SelectItem value="Older than 1 year">Older than 1 year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Əməliyyat</Label>
                            <Select defaultValue="archive" onValueChange={(v) => setNewRule({ ...newRule, action: v as any })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="archive">Archive (Saxla)</SelectItem>
                                    <SelectItem value="delete">Delete (Sil)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveRule}>Yarat</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Qaydanı silmək istədiyinizə əminsiniz?"
                description="Bu əməliyyat geri qaytarıla bilməz."
                actionLabel="Sil"
                onAction={handleDeleteRule}
                variant="destructive"
            />

            <ConfirmationDialog
                open={simConfirmOpen}
                onOpenChange={setSimConfirmOpen}
                title="Simulyasiyanı başlatmaq istədiyinizə əminsiniz?"
                description="Bu proses sistem resurslarını istifadə edə bilər."
                actionLabel="Başlat"
                onAction={handleSimulation}
            />
        </div>
    );
}
