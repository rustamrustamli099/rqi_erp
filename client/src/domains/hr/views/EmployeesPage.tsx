import { useState } from "react";
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
import { MoreHorizontal, User, Edit, Trash, Eye, ArrowUpDown } from "lucide-react";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ContextHelp } from "@/shared/components/ui/ContextHelp";
// PHASE 100% PFCG: Backend Decision Center
import { usePageState } from "@/app/security/usePageState";

interface Employee {
    id: number;
    name: string;
    position: string;
    department: string;
    email: string;
    status: string;
}

export default function EmployeesPage() {
    // PHASE 100% PFCG: Backend-driven action visibility
    const { actions } = usePageState('Z_EMPLOYEES');
    const canCreate = actions?.GS_EMPLOYEES_CREATE ?? false;
    const canUpdate = actions?.GS_EMPLOYEES_UPDATE ?? false;
    const canDelete = actions?.GS_EMPLOYEES_DELETE ?? false;

    const [data] = useState<Employee[]>([
        { id: 1, name: "Ali Vəliyev", position: "Software Engineer", department: "IT", email: "ali@example.com", status: "Active" },
        { id: 2, name: "Ayşə Məmmədova", position: "HR Manager", department: "HR", email: "ayse@example.com", status: "Active" },
        { id: 3, name: "Samir Quliyev", position: "Accountant", department: "Finance", email: "samir@example.com", status: "On Leave" },
    ]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const columns: ColumnDef<Employee>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 opacity-50" />
                    </div>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "position",
            header: "Position",
        },
        {
            accessorKey: "department",
            header: "Department",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {status}
                    </span>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const employee = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(employee.email)}>
                                Copy Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            {canUpdate && (
                                <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                </DropdownMenuItem>
                            )}
                            {canDelete && (
                                <DropdownMenuItem className="text-red-600">
                                    <Trash className="mr-2 h-4 w-4" /> Delete
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

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
                    <ContextHelp
                        title="İşçilər Modulu"
                        description="Bütün işçilərin siyahısı, vəzifələri və statusları burada idarə olunur. Yeni işçi əlavə etmək üçün 'Add Employee' düyməsindən istifadə edin."
                        videoUrl="https://youtube.com/example"
                    />
                </div>
                <p className="text-muted-foreground">Manage your organization's workforce.</p>
            </div>

            <Card>
                <CardContent className="p-4">
                    <DataTableToolbar table={table} onAddClick={canCreate ? () => { } : undefined} addLabel="Add Employee" />
                    <div className="rounded-md border">
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
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <DataTablePagination table={table} />
                </CardContent>
            </Card>
        </div>
    );
}
