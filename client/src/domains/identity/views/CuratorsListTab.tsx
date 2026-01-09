import { useState } from "react";
import { toast } from "sonner";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, User as UserIcon, ArrowUpDown, Edit, Trash, Eye, Copy, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { CuratorAssignmentForm } from "./CuratorAssignmentForm";
// PHASE 14G: Import canonical action keys
import { ACTION_KEYS, type ActionsMap } from "@/app/navigation/action-keys";
// SAP Fiori Style: Read-only detail view
import { CuratorDetailSheet } from "../components/CuratorDetailSheet";

// Mock Data
const MOCK_ASSIGNMENTS = [
    {
        id: "1",
        user: "Ali Aliyev",
        scopeLevel: "TENANT_PANEL",
        targetType: "BRANCH",
        targetId: "Baku-HQ",
        mode: "READ",
        visibility: "ALL_READ"
    },
    {
        id: "2",
        user: "Vali Valiyev",
        scopeLevel: "ADMIN_PANEL",
        targetType: "SYSTEM",
        targetId: "Global",
        mode: "WRITE",
        visibility: "OWN_ONLY"
    },
    {
        id: "3",
        user: "Sara Mammadova",
        scopeLevel: "TENANT_PANEL",
        targetType: "DEPARTMENT",
        targetId: "HR",
        mode: "WRITE",
        visibility: "ALL_READ"
    }
];

// PHASE 14G: Props interface
interface CuratorsListTabProps {
    actions?: Partial<ActionsMap>;
}

export function CuratorsListTab({ actions = {} as ActionsMap }: CuratorsListTabProps) {
    // State Hoisting
    const [data] = useState(MOCK_ASSIGNMENTS);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // Actions State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCurator, setEditingCurator] = useState<typeof MOCK_ASSIGNMENTS[0] | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    // SAP Fiori: Read-only detail view state
    const [viewingCurator, setViewingCurator] = useState<typeof MOCK_ASSIGNMENTS[0] | null>(null);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

    // Handlers
    const handleCreate = (newData: any) => {
        // Mock Implementation
        console.log("Created:", newData);
        setIsAddOpen(false); // Close dialog
        toast.success("Təyinat yaradıldı");
    };

    const handleUpdate = (updatedData: any) => {
        // Mock Implementation
        console.log("Updated:", updatedData);
        setEditingCurator(null);
        toast.success("Təyinat yeniləndi");
    }

    const handleDelete = () => {
        if (!deletingId) return;
        // Mock Implementation
        console.log("Deleted:", deletingId);
        setDeletingId(null);
        toast.success("Təyinat silindi");
    }

    const columns: ColumnDef<typeof MOCK_ASSIGNMENTS[0]>[] = [
        {
            accessorKey: "user",
            header: ({ column }) => (
                <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    İstifadəçi
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-4 w-4 opacity-50" />
                    </div>
                    <span className="font-medium">{row.getValue("user")}</span>
                </div>
            ),
        },
        {
            accessorKey: "scopeLevel",
            header: "Səviyyə",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("scopeLevel")}</Badge>
        },
        {
            accessorKey: "targetType",
            header: "Hədəf Növü",
            cell: ({ row }) => <Badge variant="secondary">{row.getValue("targetType")}</Badge>
        },
        {
            accessorKey: "targetId",
            header: "Hədəf ID",
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("targetId")}</span>
        },
        {
            accessorKey: "mode",
            header: "Rejim",
            cell: ({ row }) => {
                const mode = row.getValue("mode") as string;
                return (
                    <Badge variant={mode === 'WRITE' ? 'destructive' : 'default'} className="text-[10px]">
                        {mode}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const curator = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* PHASE 14G: Row actions - conditional rendering */}
                            {/* SAP-GRADE: READ permission allows viewing details */}
                            {actions[ACTION_KEYS.CURATORS_READ] && (
                                <DropdownMenuItem onClick={() => {
                                    setViewingCurator(curator);
                                    setIsDetailSheetOpen(true);
                                }}>
                                    <Eye className="mr-2 h-4 w-4" /> Detallara Bax
                                </DropdownMenuItem>
                            )}
                            {actions[ACTION_KEYS.CURATORS_COPY_ID] && (
                                <DropdownMenuItem onClick={() => {
                                    navigator.clipboard.writeText(curator.id);
                                    toast.success("ID kopyalandı");
                                }}>
                                    <Copy className="mr-2 h-4 w-4" /> ID kopyala
                                </DropdownMenuItem>
                            )}
                            {actions[ACTION_KEYS.CURATORS_CHANGE_STATUS] && (
                                <DropdownMenuItem onClick={() => {
                                    toast.info("Status dəyişmə funksiyası tezliklə aktiv olacaq");
                                }}>
                                    <RefreshCcw className="mr-2 h-4 w-4" /> Status Dəyiş
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {actions[ACTION_KEYS.CURATORS_UPDATE] && (
                                <DropdownMenuItem onClick={() => setEditingCurator(curator)}>
                                    <Edit className="mr-2 h-4 w-4" /> Düzəliş et
                                </DropdownMenuItem>
                            )}
                            {actions[ACTION_KEYS.CURATORS_DELETE] && (
                                <DropdownMenuItem className="text-red-600" onClick={() => setDeletingId(curator.id)}>
                                    <Trash className="mr-2 h-4 w-4" /> Sil
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu >
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="space-y-4">
            <Card className="border-none shadow-none bg-transparent flex flex-col overflow-hidden">
                <CardContent className="p-0 flex flex-col overflow-hidden">
                    <DataTableToolbar
                        table={table}
                        // PHASE 14G: Conditional rendering based on actions
                        onAddClick={actions[ACTION_KEYS.CURATORS_CREATE] ? () => setIsAddOpen(true) : undefined}
                        addLabel="Yeni Təyinat"
                        searchPlaceholder="Axtarış..."
                        onExportClick={actions[ACTION_KEYS.CURATORS_EXPORT] ? () => {
                            const headers = ['İstifadəçi', 'Səviyyə', 'Hədəf Növü', 'Hədəf ID', 'Rejim'];
                            const csvRows = [
                                headers.join(','),
                                ...data.map((c) => [
                                    `"${c.user || ''}"`,
                                    `"${c.scopeLevel || ''}"`,
                                    `"${c.targetType || ''}"`,
                                    `"${c.targetId || ''}"`,
                                    c.mode || 'N/A'
                                ].join(','))
                            ];
                            const csvContent = csvRows.join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `curators_export_${new Date().toISOString().slice(0, 10)}.csv`;
                            link.click();
                            URL.revokeObjectURL(url);
                            toast.success('Kuratorlar CSV olaraq ixrac edildi');
                        } : undefined}
                    />
                    <div className="rounded-md border bg-card overflow-auto mt-2">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
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
                    <div className="py-2">
                        <DataTablePagination table={table} />
                    </div>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Yeni Kurator Təyinatı</DialogTitle>
                        <DialogDescription>
                            İstifadəçiyə yeni məsuliyyət sahəsi təyin edin.
                        </DialogDescription>
                    </DialogHeader>
                    <CuratorAssignmentForm
                        onSuccess={handleCreate}
                        onCancel={() => setIsAddOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingCurator} onOpenChange={(val: boolean) => !val && setEditingCurator(null)}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Təyinatı Düzəliş Et</DialogTitle>
                    </DialogHeader>
                    {editingCurator && (
                        <CuratorAssignmentForm
                            initialData={editingCurator as any}
                            onSuccess={handleUpdate}
                            onCancel={() => setEditingCurator(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={!!deletingId}
                onOpenChange={(open: boolean) => !open && setDeletingId(null)}
                title="Təyinatı Sil"
                description="Bu kurator təyinatını silmək istədiyinizə əminsiniz?"
                variant="destructive"
                onConfirm={handleDelete}
            />

            {/* SAP Fiori Style: Read-only Detail Sheet */}
            <CuratorDetailSheet
                curator={viewingCurator}
                open={isDetailSheetOpen}
                onOpenChange={setIsDetailSheetOpen}
            />
        </div>
    )
}

// Helper to make deletion work in the columns definition
// We need to move columns DEFINITION inside the component to access state functions
// OR pass callbacks to columns but columns are defined inside component in current file structure

