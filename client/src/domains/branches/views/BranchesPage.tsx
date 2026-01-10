import { useState, useEffect } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from "@tanstack/react-table";
import type {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, GitBranch, MapPin, Edit, Trash, Eye, ArrowUpDown, User } from "lucide-react";
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { BranchFormDialog } from "../components/BranchFormDialog";
import { toast } from "sonner";
import { useHelp } from "@/app/context/HelpContext";
// PHASE 100% PFCG: Backend Decision Center
import { usePageState } from "@/app/security/usePageState";

interface Branch {
    id: number;
    name: string;
    code: string;
    location: string;
    manager: string;
    status: string;
}

export default function BranchesPage() {
    const navigate = useNavigate();
    const { setPageKey } = useHelp();

    // PHASE 100% PFCG: Backend-driven action visibility
    const { actions } = usePageState('Z_BRANCHES');
    const canCreate = actions?.GS_BRANCHES_CREATE ?? false;
    const canUpdate = actions?.GS_BRANCHES_UPDATE ?? false;
    const canDelete = actions?.GS_BRANCHES_DELETE ?? false;
    const canReadDetails = actions?.GS_BRANCHES_READ_DETAILS ?? false;

    const [data] = useState<Branch[]>([
        { id: 1, name: "Baş Ofis", code: "HQ-001", location: "Bakı, AZ", manager: "Elvin Məmmədov", status: "Active" },
        { id: 2, name: "Gəncə Filialı", code: "BR-002", location: "Gəncə, AZ", manager: "Vəli Əliyev", status: "Active" },
        { id: 3, name: "Sumqayıt Ofisi", code: "BR-003", location: "Sumqayıt, AZ", manager: "Leyla Məmmədova", status: "Maintenance" },
    ]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any>(null);

    const columns: ColumnDef<Branch>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Bölmə Adı
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-medium">
                        <GitBranch className="h-4 w-4 text-primary" />
                        {row.getValue("name")}
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">{row.original.code}</span>
                </div>
            ),
        },
        {
            accessorKey: "location",
            header: "Ünvan / Region",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {row.getValue("location")}
                </div>
            )
        },

        {
            accessorKey: "manager",
            header: "Rəhbər / Müdir",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {row.getValue("manager")}
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {status === 'Active' ? 'Aktiv' : status === 'Maintenance' ? 'Təmirdə' : 'Deaktiv'}
                    </span>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Menyu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canReadDetails && (
                                <DropdownMenuItem onClick={() => navigate(`/admin/branches/${row.original.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" /> Ətraflı Bax
                                </DropdownMenuItem>
                            )}
                            {canUpdate && (
                                <DropdownMenuItem onClick={() => {
                                    setEditingBranch({ ...row.original, region: "baku" }); // Mock parsing
                                    setIsCreateOpen(true);
                                }}>
                                    <Edit className="mr-2 h-4 w-4" /> Redaktə Et
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canDelete && (
                                <DropdownMenuItem className="text-red-600">
                                    <Trash className="mr-2 h-4 w-4" /> Deaktiv Et
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
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

    const handleSave = (data: any) => {
        console.log("Saving branch:", data);
        toast.success(editingBranch ? "Bölmə yeniləndi" : "Yeni bölmə yaradıldı");
        setEditingBranch(null);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">Bölmələr və Filiallar</h2>
                </div>
                <p className="text-muted-foreground">Təşkilati strukturu (Filiallar, Anbarlar, Regionlar) idarə edin.</p>
            </div>



            {/* Refactor loop to fix double render issue above */}
            <Card>
                <CardContent className="p-4">
                    <DataTableToolbar
                        table={table}
                        onAddClick={canCreate ? () => {
                            setEditingBranch(null);
                            setIsCreateOpen(true);
                        } : undefined}
                        addLabel="Yeni Bölmə"
                    />
                    <div className="rounded-md border mt-4">
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
                    <DataTablePagination table={table} />
                </CardContent>
            </Card>

            <BranchFormDialog
                open={isCreateOpen}
                onOpenChange={(val) => {
                    setIsCreateOpen(val);
                    if (!val) setEditingBranch(null);
                }}
                initialData={editingBranch}
                onSubmit={handleSave}
            />
        </div>
    );
}
