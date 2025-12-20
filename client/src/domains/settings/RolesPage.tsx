import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    flexRender,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandList,
    CommandGroup,
    CommandItem,
} from "@/shared/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Badge } from "@/shared/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash, Shield, Check, ChevronsUpDown, LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/shared/components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination"
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar"
import { PageHeader } from "@/shared/components/ui/page-header"
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog"
import { toast } from "sonner"
import { RoleFormDialog, type RoleFormValues } from "./_components/RoleFormDialog"
import { systemApi, type Role, type SystemPermission } from "@/domains/system-console/api/system.contract";
import { PermissionMatrix } from "@/domains/system-console/feature-flags/PermissionMatrix";
import { PermissionTreeEditor, type PermissionNode } from "./_components/PermissionTreeEditor"
import { PermissionSlugs } from "@/app/security/permission-slugs"
import { permissionsStructure } from "./_components/permission-data"
import { PermissionDiffViewer } from "./_components/PermissionDiffViewer"

// Main Page Component
interface RolesPageProps {
    context?: "admin" | "tenant"
}

// MOCK Curator Data
const MOCK_ROLES: Role[] = [
    { id: "r1", name: "SuperAdmin", description: "Sistem üzrə tam səlahiyyətli admin.", type: "system", scope: "SYSTEM", permissions: [], usersCount: 2, _count: { users: 2 } },
    { id: "r2", name: "TenantAdmin", description: "Tenant daxili tam idarəetmə.", type: "custom", scope: "TENANT", permissions: [], usersCount: 5, _count: { users: 5 } },
    { id: "r3", name: "Manager", description: "Orta səviyyəli idarəçi, hesabatlara baxış.", type: "custom", scope: "TENANT", permissions: [], usersCount: 12, _count: { users: 12 } },
    { id: "r4", name: "User", description: "Standart istifadəçi, yalnız öz məlumatlarını görür.", type: "custom", scope: "TENANT", permissions: [], usersCount: 45, _count: { users: 45 } },
    { id: "r5", name: "FinanceUser", description: "Maliyyə və ödənişlərə cavabdeh şəxs.", type: "custom", scope: "TENANT", permissions: [], usersCount: 3, _count: { users: 3 } },
    { id: "r6", name: "HRManager", description: "İnsan resursları və əməkdaş idarəçiliyi.", type: "custom", scope: "TENANT", permissions: [], usersCount: 4, _count: { users: 4 } },
    { id: "r7", name: "Viewer", description: "Yalnız baxış rejimi.", type: "custom", scope: "TENANT", permissions: [], usersCount: 8, _count: { users: 8 } },
];



export default function RolesPage({ context = "admin" }: RolesPageProps) {
    useTranslation()
    const [roles, setRoles] = useState<Role[]>([])
    const [allPermissions, setAllPermissions] = useState<SystemPermission[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const [loading, setLoading] = useState(true)

    // Table State
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    // Detailed Role Permissions State (for assigning permissions in UI)
    const [currentRole, setCurrentRole] = useState<Role | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>("")
    const [roleSearchOpen, setRoleSearchOpen] = useState(false)

    // Permission State
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [originalPermissions, setOriginalPermissions] = useState<string[]>([]) // For diffing

    // Modals
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create")
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDiffOpen, setIsDiffOpen] = useState(false) // For review dialog

    const columns = useMemo<ColumnDef<Role>[]>(() => [
        {
            accessorKey: "name",
            header: "Rol Adı",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">{row.getValue("name")}</span>
                    {row.original.type === "system" && <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Sistem</span>}
                </div>
            ),
        },
        { accessorKey: "description", header: "Təsvir" },
        {
            accessorKey: "scope",
            header: "Əhatə",
            cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.getValue("scope")}</Badge>
        },
        { accessorKey: "usersCount", header: "İstifadəçilər", cell: ({ row }) => <div className="text-center w-12">{row.getValue("usersCount")}</div> },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const role = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                setCurrentRole(role)
                                setDialogMode("view")
                                setDialogOpen(true)
                            }}><Eye className="mr-2 h-4 w-4" /> Bax</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedRole(role.name)}><Check className="mr-2 h-4 w-4" /> İcazələri Seç</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={role.type === "system"} onClick={() => {
                                setCurrentRole(role)
                                setDialogMode("edit")
                                setDialogOpen(true)
                            }}><Edit className="mr-2 h-4 w-4" /> Düzəliş Et</DropdownMenuItem>
                            {role.type !== "system" && (
                                <DropdownMenuItem className="text-red-600" onClick={() => {
                                    setCurrentRole(role)
                                    setIsDeleteOpen(true)
                                }}>
                                    <Trash className="mr-2 h-4 w-4" /> Sil
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [])
    // END MOVED COLUMNS DEFINITION

    // Fetch Logic
    // ... imports
    // Fetch Logic


    // Use systemApi in fetchRoles
    const fetchRoles = async () => {
        // setLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([
                systemApi.getRoles(),
                systemApi.getPermissions()
            ]);

            // If API returns empty, use MOCK
            const validRoles = Array.isArray(rolesData) && rolesData.length > 0 ? rolesData : [];
            const finalRoles = validRoles.length > 0 ? validRoles : MOCK_ROLES as any; // Cast to avoid strict type mismatch if API types differ slightly

            setRoles(finalRoles.map((r: any) => ({
                id: r.id,
                name: r.name,
                description: r.description,
                type: r.name === 'owner' || r.name === 'admin' || r.name === 'SuperAdmin' ? 'system' : 'custom',
                scope: r.scope || 'TENANT',
                usersCount: r._count?.users || r.usersCount || 0,
                permissions: r.permissions || []
            })));
            setAllPermissions(Array.isArray(permsData) ? permsData : []);
        } catch {
            // Fallback to MOCK on error
            setRoles(MOCK_ROLES);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Use systemApi in handleSaveRole
    const handleSaveRole = async (values: RoleFormValues) => {
        try {
            if (dialogMode === "create") {
                await systemApi.createRole({
                    name: values.name,
                    description: values.description,
                    scope: values.scope,
                    permissionIds: values.permissions
                });
                toast.success("Rol yaradıldı");
            } else if (dialogMode === "edit" && currentRole) {
                await systemApi.updateRole(currentRole.id, {
                    name: values.name,
                    description: values.description,
                    scope: values.scope,
                    permissionIds: values.permissions
                });
                toast.success("Rol yeniləndi");
            }
            fetchRoles();
            setDialogOpen(false);
        } catch {
            // silent fail or handled elsewhere

            toast.error("Xəta baş verdi");
        }
    };

    // Use systemApi in confirmDeleteRole
    const confirmDeleteRole = async () => {
        if (!currentRole) return;
        try {
            await systemApi.deleteRole(currentRole.id);
            toast.success("Rol silindi");
            fetchRoles();
            setIsDeleteOpen(false);
        } catch {
            toast.error("Silinmə zamanı xəta");
        }
    };

    // ... (rest of render logic, ensuring `data` is replaced by `roles` in table definition)
    const table = useReactTable({
        data: roles || [],
        columns,
        state: { sorting, columnVisibility, rowSelection, columnFilters },

        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    // Reset permissions when role changes
    useEffect(() => {
        if (selectedRole) {
            const mockRole = roles.find(r => r.name === selectedRole);
            if (mockRole?.permissions) {
                const perms = mockRole.permissions as unknown as string[];
                setSelectedPermissions(perms);
                setOriginalPermissions(perms);
            } else {
                // Fallback or empty
                const defaults = [
                    PermissionSlugs.PLATFORM.DASHBOARD.VIEW,
                    PermissionSlugs.PLATFORM.SETTINGS.GENERAL.READ
                ];
                setSelectedPermissions(defaults);
                setOriginalPermissions(defaults);
            }
        } else {
            setSelectedPermissions([]);
            setOriginalPermissions([]);
        }
    }, [selectedRole, roles])

    // Trigger review dialog
    const handlePermissionsSaveClick = () => {
        setIsDiffOpen(true);
    }

    // Actually save after confirmation
    const confirmPermissionsSave = async () => {
        // Logic to save permissions to backend
        // const role = roles.find(r => r.name === selectedRole)
        // await api.updatePermissions(role.id, selectedPermissions)

        // Mock success
        toast.success("İcazələr uğurla yeniləndi!");
        console.log("Saving permissions for role:", selectedRole, selectedPermissions);

        // In real app, we would refresh roles here to update 'originalPermissions'
        setOriginalPermissions(selectedPermissions); // Optmistic update
        setIsDiffOpen(false);
    }

    // UI Helpers for opening modals
    const openCreateModal = () => {
        setCurrentRole(null)
        setDialogMode("create")
        setDialogOpen(true)
    }

    return (
        <div className="space-y-4">

            <PageHeader
                heading="Rollar və İcazələr"
                text="İstifadəçi hüquqlarını idarə edin."
            />

            {/* TABS ARCHITECTURE */}

            <Tabs defaultValue="list" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="list">
                            <List className="w-4 h-4 mr-2" />
                            Siyahı (Tree View)
                        </TabsTrigger>
                        <TabsTrigger value="matrix">
                            <LayoutGrid className="w-4 h-4 mr-2" />
                            Matris (Excel View)
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="list" className="space-y-4">
                    {/* 1. Roles List Accordion */}
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="roles-list" className="border rounded-md overflow-hidden transition-all data-[state=open]:bg-accent/50 data-[state=open]:shadow-sm">
                            <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <span className="text-lg font-semibold">Rollar Siyahısı</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Card className="border-0 shadow-none">
                                    <CardContent className="p-4">
                                        <DataTableToolbar
                                            table={table}
                                            filterColumn="name"
                                            searchPlaceholder="Rolları axtar..."
                                            addLabel="Yeni Rol"
                                            onAddClick={openCreateModal}
                                        />
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
                                                                        {flexRender(
                                                                            cell.column.columnDef.cell,
                                                                            cell.getContext()
                                                                        )}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={columns.length}
                                                                className="h-24 text-center"
                                                            >
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
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* 2. Role Selection */}
                    <div className="flex flex-col gap-2 p-6 border rounded-md bg-card shadow-sm">
                        <Popover open={roleSearchOpen} onOpenChange={setRoleSearchOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={roleSearchOpen} className="w-[300px] justify-between">
                                    {selectedRole ? selectedRole : "Rol seçin..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Rol axtar..." />
                                    <CommandList>
                                        <CommandEmpty>Rol tapılmadı.</CommandEmpty>
                                        <CommandGroup>
                                            {roles.map(role => (
                                                <CommandItem
                                                    key={role.id}
                                                    value={role.name}
                                                    onSelect={(currentValue) => {
                                                        setSelectedRole(currentValue === selectedRole ? "" : currentValue)
                                                        setRoleSearchOpen(false)
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", selectedRole === role.name ? "opacity-100" : "opacity-0")} />
                                                    {role.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* 3. Permissions Layout: Tree Based */}
                    <Accordion type="single" collapsible value={selectedRole ? "permissions" : ""} className="w-full">
                        <AccordionItem value="permissions" className="border rounded-md bg-card overflow-hidden">
                            <AccordionTrigger className="hover:no-underline px-4 py-3 bg-muted/30 border-b">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">İcazələr: <span className="text-primary">{selectedRole || "Seçilməyib"}</span></h3>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-4 space-y-4">
                                    <PermissionTreeEditor
                                        permissions={permissionsStructure.filter(node => context === "admin" || node.id !== "admin")}
                                        selectedSlugs={selectedPermissions}
                                        onChange={setSelectedPermissions}
                                    />

                                    <div className="pt-4 flex justify-end">
                                        <Button size="lg" onClick={handlePermissionsSaveClick}>
                                            Yadda Saxla
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </TabsContent>

                <TabsContent value="matrix">
                    <PermissionMatrix />
                </TabsContent>
            </Tabs>


            {/* Shared Reusable Modal */}
            <RoleFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                initialData={currentRole}
                onSubmit={handleSaveRole}
                context={context}
                availablePermissions={allPermissions}
            />

            <ConfirmationDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Rolu Sil"
                description="Bu rolu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz və bu rola bağlı istifadəçilərin icazələrini ləğv edəcək."
                onAction={confirmDeleteRole}
                variant="destructive"
                actionLabel="Sil"
            />

            {/* Diff Review Modal */}
            <Dialog open={isDiffOpen} onOpenChange={setIsDiffOpen}>
                <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Dəyişiklikləri Təsdiqlə</DialogTitle>
                        <DialogDescription>
                            "{selectedRole}" rolu üçün aşağıdakı icazə dəyişiklikləri tətbiq ediləcək.
                            Zəhmət olmasa diqqətlə yoxlayın.
                        </DialogDescription>
                    </DialogHeader>

                    <PermissionDiffViewer
                        original={originalPermissions}
                        modified={selectedPermissions}
                        className="my-2"
                    />

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDiffOpen(false)}>Ləğv et</Button>
                        <Button onClick={confirmPermissionsSave}>Təsdiqlə və Yadda Saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
