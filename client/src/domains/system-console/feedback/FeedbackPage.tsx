
import { useState } from "react";
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type VisibilityState,
    type SortingState,
    type ColumnFiltersState,
    type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { MoreHorizontal, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/page-header";

interface FeedbackItem {
    id: string;
    type: "bug" | "suggestion" | "ux" | "other";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    url: string;
    status: "new" | "in_review" | "in_progress" | "resolved" | "closed";
    createdAt: string;
    user: string;
}

const mockFeedback: FeedbackItem[] = [
    {
        id: "FB-1024",
        type: "bug",
        severity: "high",
        message: "İşçilər səhifəsində filtr işləmir",
        url: "/hr/employees",
        status: "new",
        createdAt: "2024-03-15T10:30:00Z",
        user: "Ali Hasanov"
    },
    {
        id: "FB-1025",
        type: "suggestion",
        severity: "low",
        message: "Dark mode üçün daha açıq rənglər ola bilərdi",
        url: "/dashboard",
        status: "in_review",
        createdAt: "2024-03-15T11:15:00Z",
        user: "Leyla M."
    },
    {
        id: "FB-1026",
        type: "ux",
        severity: "medium",
        message: "Mobil versiyada menu çətin açılır",
        url: "/mobile",
        status: "resolved",
        createdAt: "2024-03-14T09:00:00Z",
        user: "Admin User"
    },
    {
        id: "FB-1027",
        type: "bug",
        severity: "critical",
        message: "Sistem xətası: 500 error when saving invoice",
        url: "/finance/invoices",
        status: "new",
        createdAt: "2024-03-16T14:20:00Z",
        user: "Rashad V."
    }
];

export default function FeedbackPage() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const columns: ColumnDef<FeedbackItem>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("id")}</span>,
        },
        {
            accessorKey: "type",
            header: "Növ",
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                if (type === 'bug') variant = "destructive";
                if (type === 'suggestion') variant = "secondary";

                return <Badge variant={variant} className="capitalize">{type}</Badge>;
            }
        },
        {
            accessorKey: "severity",
            header: "Vaciblik",
            cell: ({ row }) => {
                const severity = row.getValue("severity") as string;
                const colors = {
                    low: "text-green-500",
                    medium: "text-yellow-500",
                    high: "text-orange-500",
                    critical: "text-red-600 font-bold"
                };
                return (
                    <div className={`flex items-center gap-2 ${colors[severity as keyof typeof colors]}`}>
                        <AlertTriangle className="w-3 h-3" />
                        <span className="capitalize text-xs">{severity}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "message",
            header: "Rəy",
            cell: ({ row }) => (
                <div className="max-w-[400px]">
                    <div className="truncate font-medium">{row.getValue("message")}</div>
                    <div className="text-xs text-muted-foreground truncate">{row.original.url}</div>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return <Badge variant="outline" className="capitalize">{status.replace('_', ' ')}</Badge>;
            }
        },
        {
            accessorKey: "user",
            header: "İstifadəçi",
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row: _row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> Detallara bax
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" /> Həll olundu et
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" /> Ləğv et
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];

    const table = useReactTable({
        data: mockFeedback,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
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
        <div className="space-y-6">
            <PageHeader
                heading="Feedback İdarəetməsi"
                text="İsitfadəçilərdən gələn rəy, təklif və xəta bildirişləri."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Gələn Rəylər</CardTitle>
                    <CardDescription>Son 30 gündə daxil olan istifadəçi rəyləri.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <DataTableToolbar
                            table={table}
                            filterColumn="message"
                            filterPlaceholder="Rəylərdə axtar..."
                        />
                        <div className="rounded-md border overflow-x-auto">
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
