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
import { MoreHorizontal, User as UserIcon, Edit, Trash, ArrowUpDown, ShieldCheck, Lock, Unlock, Mail, CheckCircle2, XCircle, Timer, ShieldAlert, Link as LinkIcon } from "lucide-react";
import { RestrictionsDialog } from "@/components/ui/restrictions-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { UserFormDialog } from "@/shared/components/ui/UserFormDialog";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import { identityApi, type User } from "../api/identity.contract";
import { useImpersonate } from "@/app/auth/hooks/useImpersonate";
import { LogIn } from "lucide-react";
// PHASE 14G: Import canonical action keys
import { ACTION_KEYS, type ActionsMap } from "@/app/navigation/action-keys";

const roleOptions = [
    { label: "Super Admin", value: "SuperAdmin" },
    { label: "Tenant Admin", value: "TenantAdmin" },
    { label: "Manager", value: "Manager" },
    { label: "Finance User", value: "FinanceUser" },
    { label: "HR Manager", value: "HRManager" },
    { label: "User", value: "User" },
    { label: "Viewer", value: "Viewer" },
    { label: "System Auditor", value: "SystemAuditor" },
]

const statusOptions = [
    { label: "Aktiv", value: "Active" },
    { label: "Deaktiv", value: "Inactive" },
]

// PHASE 14G: Props interface
interface UsersListTabProps {
    actions?: ActionsMap;
}

export function UsersListTab({ actions = {} as ActionsMap }: UsersListTabProps) {
    const [data, setData] = useState<User[]>([]);
    const { impersonate } = useImpersonate();

    const fetchUsers = async () => {

        try {
            const users = await identityApi.getUsers();
            setData(users);
        } catch {
            // console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ... existing table state ...
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // ... filters, restrictions states ...

    // State for actions
    const [isRestrictionsOpen, setIsRestrictionsOpen] = useState(false);
    const [selectedUserForRestrictions, setSelectedUserForRestrictions] = useState<User | null>(null);
    const [actionUser, setActionUser] = useState<User | null>(null);
    const [actionType, setActionType] = useState<'toggle' | 'invite' | 'delete' | null>(null);
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [userFormMode, setUserFormMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    const handleOpenRestrictions = (user: User) => {
        setSelectedUserForRestrictions(user);
        setIsRestrictionsOpen(true);
    };

    const confirmAction = (user: User, type: 'toggle' | 'invite' | 'delete') => {
        setActionUser(user);
        setActionType(type);
    };

    // Handlers using API
    const handleCreateUser = async (values: any) => {
        try {
            await identityApi.createUser({
                name: values.name,
                email: values.email,
                role: values.roles ? values.roles[0] : values.role, // Handle array or string
                status: values.status,
                sendInvitation: values.sendInvitation
            });
            toast.success("İstifadəçi uğurla yaradıldı");
            fetchUsers();
            setIsUserFormOpen(false);
        } catch {
            toast.error("Xəta baş verdi");
        }
    }

    const handleUpdateUser = async (values: any) => {
        if (!selectedUser) return;
        try {
            await identityApi.updateUser(selectedUser.id, values);
            toast.success("İstifadəçi məlumatları yeniləndi");
            fetchUsers();
            setIsUserFormOpen(false);
            setSelectedUser(null);
        } catch {
            toast.error("Xəta baş verdi");
        }
    }

    const handleDeleteUser = async () => {
        if (!actionUser) return;
        try {
            await identityApi.deleteUser(actionUser.id);
            toast.success("İstifadəçi silindi");
            fetchUsers();
            setActionUser(null);
            setActionType(null);
        } catch {
            toast.error("Xəta baş verdi");
        }
    }

    const openCreateDialog = () => {
        setSelectedUser(null);
        setUserFormMode("create");
        setIsUserFormOpen(true);
    }

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setUserFormMode("edit");
        setIsUserFormOpen(true);
    }

    const confirmDelete = (user: User) => {
        setActionUser(user);
        setActionType('delete');
    }

    const handleConfirmAction = () => {
        if (!actionUser || !actionType) return

        if (actionType === 'toggle') {
            handleToggleStatus(actionUser)
        } else if (actionType === 'invite') {
            handleSendInvitation(actionUser)
        } else if (actionType === 'delete') {
            handleDeleteUser()
        }
        setActionUser(null)
        setActionType(null)
    }

    const handleSaveRestrictions = (restrictionsData: any) => {
        if (!selectedUserForRestrictions) return;

        setData(data.map(u => u.id === selectedUserForRestrictions.id ? { ...u, restrictions: restrictionsData } : u));
        toast.success(`${selectedUserForRestrictions.name} üçün məhdudiyyətlər yeniləndi`);
        setIsRestrictionsOpen(false);
        setSelectedUserForRestrictions(null);
    }

    const handleToggleStatus = (user: User) => {
        const newStatus = user.status === "Active" ? "Inactive" : "Active";
        setData(data.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        toast.success(`İstifadəçi statusu dəyişdirildi: ${newStatus === "Active" ? "Aktiv" : "Deaktiv"}`);
    }

    const handleSendInvitation = (user: User) => {
        toast.success(`Dəvət ${user.email} ünvanına göndərildi`);
    }

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Ad Soyad
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-4 w-4 opacity-50" />
                    </div>
                    <div>
                        <div className="font-medium">{row.getValue("name")}</div>
                        {!row.original.isVerified && <Badge variant="secondary" className="text-[10px] h-4 px-1">Təsdiqlənməyib</Badge>}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    {row.getValue("role")}
                </div>
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {status === 'Active' ? 'Aktiv' : 'Deaktiv'}
                        </span>
                        {row.original.restrictions?.enabled && (
                            <div className="text-orange-500" title="Məhdudiyyətlər tətbiq edilib">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                )
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const user = row.original
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
                            {actions[ACTION_KEYS.USERS_ACTIVATE] && (
                                <DropdownMenuItem onClick={() => confirmAction(user, 'toggle')}>
                                    {user.status === "Active" ? <Lock className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
                                    {user.status === "Active" ? "Deaktiv Et" : "Aktiv Et"}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onClick={() => handleOpenRestrictions(user)}>
                                <Timer className="mr-2 h-4 w-4" /> Məhdudiyyətlər
                            </DropdownMenuItem>

                            {actions[ACTION_KEYS.USERS_IMPERSONATE] && (
                                <DropdownMenuItem onClick={() => impersonate(user.id, user.name)}>
                                    <LogIn className="mr-2 h-4 w-4" /> Simulyasiya Et (Impersonate)
                                </DropdownMenuItem>
                            )}

                            {actions[ACTION_KEYS.USERS_SEND_INVITE] && !user.isVerified && (
                                <DropdownMenuItem onClick={() => confirmAction(user, 'invite')}>
                                    <Mail className="mr-2 h-4 w-4" /> Dəvət Göndər
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => toast.info("İşçi bazasına keçid funksiyası tezliklə aktiv olacaq (User-Employee Link)")}>
                                <LinkIcon className="mr-2 h-4 w-4" /> İşçiyə Bağla
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            {actions[ACTION_KEYS.USERS_UPDATE] && (
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    <Edit className="mr-2 h-4 w-4" /> Düzəliş Et
                                </DropdownMenuItem>
                            )}
                            {actions[ACTION_KEYS.USERS_DELETE] && (
                                <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(user)}>
                                    <Trash className="mr-2 h-4 w-4" /> Sil
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

    const getDialogContent = () => {
        switch (actionType) {
            case 'toggle':
                return {
                    title: "Statusu Dəyişdir",
                    description: `${actionUser?.name} istifadəçisini ${actionUser?.status === 'Active' ? 'deaktiv' : 'aktiv'} etmək istədiyinizə əminsiniz?`,
                    variant: "default" as const
                }
            case 'invite':
                return {
                    title: "Dəvət Göndər",
                    description: `${actionUser?.email} ünvanına dəvət göndərmək istədiyinizə əminsiniz?`,
                    variant: "default" as const
                }
            case 'delete':
                return {
                    title: "İstifadəçini Sil",
                    description: `${actionUser?.name} istifadəçisini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`,
                    variant: "destructive" as const
                }
            default:
                return { title: "", description: "", variant: "default" as const }
        }
    }

    const dialogContent = getDialogContent()

    return (
        <div className="space-y-4">
            <Card className="border-none shadow-none bg-transparent flex flex-col overflow-hidden">
                <CardContent className="p-0 flex flex-col overflow-hidden">

                    <DataTableToolbar
                        table={table}
                        // PHASE 14G: Conditional rendering based on actions
                        onAddClick={actions[ACTION_KEYS.USERS_CREATE] ? openCreateDialog : undefined}
                        addLabel="İstifadəçi Əlavə Et"
                        searchPlaceholder="Axtarış..."
                        onExportClick={actions[ACTION_KEYS.USERS_EXPORT] ? () => {
                            const headers = ['Ad Soyad', 'Email', 'Rol', 'Status'];
                            const csvRows = [
                                headers.join(','),
                                ...data.map((u) => [
                                    `"${u.name || ''}"`,
                                    `"${u.email || ''}"`,
                                    `"${u.role || ''}"`,
                                    u.status || 'N/A'
                                ].join(','))
                            ];
                            const csvContent = csvRows.join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
                            link.click();
                            URL.revokeObjectURL(url);
                            toast.success('İstifadəçilər CSV olaraq ixrac edildi');
                        } : undefined}
                    >
                        <FilterDrawer
                            open={isFilterDrawerOpen}
                            onOpenChange={setIsFilterDrawerOpen}
                            resetFilters={() => table.resetColumnFilters()}
                        >
                            {table.getColumn("status") && (
                                <DataTableFacetedFilter
                                    column={table.getColumn("status")}
                                    title="Status"
                                    options={statusOptions}
                                />
                            )}
                            {table.getColumn("role") && (
                                <DataTableFacetedFilter
                                    column={table.getColumn("role")}
                                    title="Rol"
                                    options={roleOptions}
                                />
                            )}
                        </FilterDrawer>
                    </DataTableToolbar>

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

            {/* Restrictions Dialog */}
            {selectedUserForRestrictions && (
                <RestrictionsDialog
                    open={isRestrictionsOpen}
                    onOpenChange={setIsRestrictionsOpen}
                    title={`${selectedUserForRestrictions.name} - Məhdudiyyətlər`}
                    initialData={selectedUserForRestrictions.restrictions}
                    onSave={handleSaveRestrictions}
                />
            )}

            <ConfirmationDialog
                open={!!actionUser}
                onOpenChange={(open: boolean) => !open && setActionUser(null)}
                title={dialogContent.title}
                description={dialogContent.description}
                onAction={handleConfirmAction}
                variant={dialogContent.variant}
                actionLabel="Təsdiqlə"
                cancelLabel="Ləğv et"
            />

            <UserFormDialog
                open={isUserFormOpen}
                onOpenChange={setIsUserFormOpen}
                mode={userFormMode}
                initialData={selectedUser ? {
                    ...selectedUser,
                    status: selectedUser.status as "Active" | "Inactive"
                } : undefined}
                onSubmit={userFormMode === 'create' ? handleCreateUser : handleUpdateUser}
            />
        </div>
    );
}
