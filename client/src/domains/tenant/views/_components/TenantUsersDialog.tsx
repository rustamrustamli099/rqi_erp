
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash, Mail, Shield, Edit, UserPlus, CheckCircle2, XCircle, MoreHorizontal, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState
} from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserFormDialog } from "@/shared/components/ui/UserFormDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

interface TenantUser {
    id: string
    name: string
    email: string
    role: string
    status: "Active" | "Inactive" // Matched to UserFormDialog
}

interface TenantUsersDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenantId: string
    tenantName: string
}

const MOCK_USERS: TenantUser[] = [
    { id: "1", name: "Əli Həsənov", email: "ali@example.com", role: "TenantAdmin", status: "Active" },
    { id: "2", name: "Vəli Vəliyev", email: "vali@example.com", role: "User", status: "Active" },
    { id: "3", name: "Həsən Məmmədov", email: "hasan@example.com", role: "Viewer", status: "Inactive" },
]

export function TenantUsersDialog({ open, onOpenChange, tenantId: _tenantId, tenantName }: TenantUsersDialogProps) {
    const [users, setUsers] = useState<TenantUser[]>(MOCK_USERS)
    const [sorting, setSorting] = useState<SortingState>([])

    // Form Dialog State
    const [isUserFormOpen, setIsUserFormOpen] = useState(false)
    const [userFormMode, setUserFormMode] = useState<"create" | "edit">("create")
    const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null)

    // Confirmation State
    const [actionUser, setActionUser] = useState<TenantUser | null>(null)
    const [actionType, setActionType] = useState<'delete' | 'toggle' | null>(null)

    const handleCreateUser = (values: any) => {
        const newUser: TenantUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: values.name,
            email: values.email,
            role: values.role,
            status: values.status
        }
        setUsers([...users, newUser])
        setIsUserFormOpen(false)
        toast.success("İstifadəçi əlavə edildi")
    }

    const handleUpdateUser = (values: any) => {
        if (!selectedUser) return
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...values } : u))
        setIsUserFormOpen(false)
        setSelectedUser(null)
        toast.success("Məlumatlar yeniləndi")
    }

    const openCreateDialog = () => {
        setSelectedUser(null)
        setUserFormMode("create")
        setIsUserFormOpen(true)
    }

    const openEditDialog = (user: TenantUser) => {
        setSelectedUser(user)
        setUserFormMode("edit")
        setIsUserFormOpen(true)
    }

    const confirmDelete = (user: TenantUser) => {
        setActionUser(user)
        setActionType('delete')
    }

    const confirmToggle = (user: TenantUser) => {
        setActionUser(user)
        setActionType('toggle')
    }

    const handleConfirmAction = () => {
        if (!actionUser || !actionType) return

        if (actionType === 'delete') {
            setUsers(users.filter(u => u.id !== actionUser.id))
            toast.success("İstifadəçi silindi")
        } else if (actionType === 'toggle') {
            const newStatus = actionUser.status === "Active" ? "Inactive" : "Active"
            setUsers(users.map(u => u.id === actionUser.id ? { ...u, status: newStatus } : u))
            toast.success(`Status dəyişdirildi: ${newStatus}`)
        }

        setActionUser(null)
        setActionType(null)
    }

    const columns: ColumnDef<TenantUser>[] = [
        {
            accessorKey: "name",
            header: "Ad Soyad",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-4 w-4 opacity-50" />
                    </div>
                    <div>
                        <div className="font-medium">{row.getValue("name")}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{row.original.email}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {row.getValue("email")}</div>
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => <Badge variant="outline" className="gap-1"><Shield className="w-3 h-3" /> {row.getValue("role")}</Badge>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={status === 'Active' ? 'default' : 'secondary'} className={`gap-1 ${status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : ''}`}>
                        {status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {status === 'Active' ? 'Aktiv' : 'Deaktiv'}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
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
                            <DropdownMenuItem onClick={() => confirmToggle(user)}>
                                {user.status === 'Active' ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {user.status === 'Active' ? 'Deaktiv Et' : 'Aktiv Et'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" /> Düzəliş Et
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => confirmDelete(user)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Sil
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        }
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Tenant İstifadəçiləri: {tenantName}</DialogTitle>
                    <DialogDescription>
                        Bu tenanta aid olan istifadəçilərin idarə edilməsi.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-between items-center py-2">
                    <h3 className="text-sm font-medium text-muted-foreground">İstifadəçi Siyahısı ({users.length})</h3>
                    <Button size="sm" onClick={openCreateDialog}>
                        <UserPlus className="mr-2 h-4 w-4" /> Yeni İstifadəçi
                    </Button>
                </div>

                <div className="border rounded-md flex-1 overflow-auto">
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

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Bağla</Button>
                </DialogFooter>
            </DialogContent>

            <UserFormDialog
                open={isUserFormOpen}
                onOpenChange={setIsUserFormOpen}
                mode={userFormMode}
                initialData={selectedUser}
                onSubmit={userFormMode === 'create' ? handleCreateUser : handleUpdateUser}
                allowedRoles={["TenantAdmin", "User", "Viewer"]}
            />

            <ConfirmationDialog
                open={!!actionUser}
                onOpenChange={(open: boolean) => { if (!open) setActionUser(null) }}
                title={actionType === 'delete' ? "İstifadəçini Sil" : "Statusu Dəyişdir"}
                description={actionType === 'delete'
                    ? `"${actionUser?.name}" istifadəçisini silmək istədiyinizə əminsiniz?`
                    : `"${actionUser?.name}" istifadəçisinin statusunu dəyişmək istədiyinizə əminsiniz?`}
                onAction={handleConfirmAction}
                variant={actionType === 'delete' ? "destructive" : "default"}
                actionLabel="Təsdiqlə"
                cancelLabel="Ləğv et"
            />
        </Dialog>
    )
}
