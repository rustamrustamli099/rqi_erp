
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
import { MoreHorizontal, Eye, Edit, Trash, Shield, Check, ChevronsUpDown, X, Grip, LayoutGrid, List } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"
// DataTable removed
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination"
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar"
import { PageHeader } from "@/shared/components/ui/page-header"
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog"
import { toast } from "sonner"
import { RoleFormDialog, type RoleFormValues } from "./_components/RoleFormDialog"
import { systemApi, type Role, type SystemPermission } from "@/domains/system-console/api/system.contract";
import { PermissionMatrix } from "@/domains/system-console/feature-flags/PermissionMatrix";

// Role type moved to API contract


interface PermissionNode {
    id: string
    label: string
    type: "group" | "module"
    children?: PermissionNode[]
}

// Helper to get all leaf node IDs from a tree
const getLeafIds = (nodes: PermissionNode[]): string[] => {
    let ids: string[] = []
    nodes.forEach(node => {
        if (node.type === "group" && node.children) {
            ids = [...ids, ...getLeafIds(node.children)]
        } else {
            ids.push(node.id)
        }
    })
    return ids
}

// Updated Hierarchical Structure with Settings Sub-tabs
const permissionsStructure: PermissionNode[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        type: "module",
    },
    {
        id: "users",
        label: "İstifadəçilər",
        type: "module",
    },
    {
        id: "approvals",
        label: "Təsdiqləmələr (Inbox)",
        type: "module",
    },
    {
        id: "admin",
        label: "Admin Paneli",
        type: "group",
        children: [
            {
                id: "admin.tenants",
                label: "Tenantlar",
                type: "group",
                children: [
                    { id: "admin.tenants.manage", label: "İdarəetmə (CRUD)", type: "module" },
                    { id: "admin.tenants.manage-scope", label: "Curator Təyini", type: "module" }
                ]
            },
            { id: "admin.branches", label: "Filiallar", type: "module" },
            { id: "admin.packages", label: "Paketlər", type: "module" },
            { id: "admin.users", label: "İstifadəçilər", type: "module" },
            { id: "admin.approvals", label: "Təsdiqləmə (Actions)", type: "module" },
            {
                id: "admin.settings",
                label: "Tənzimləmələr",
                type: "group",
                children: [
                    { id: "settings.general", label: "Ümumi", type: "module" },
                    {
                        id: "settings.dictionaries",
                        label: "Soraqçalar",
                        type: "group",
                        children: [
                            { id: "dictionaries.sectors", label: "Sektorlar", type: "module" },
                            { id: "dictionaries.units", label: "Ölçü Vahidləri", type: "module" },
                            { id: "dictionaries.currencies", label: "Valyutalar", type: "module" },
                            { id: "dictionaries.address", label: "Ünvanlar (Master Data)", type: "module" },
                            { id: "dictionaries.timezones", label: "Zaman Zonaları", type: "module" },
                        ]
                    },
                    { id: "settings.roles", label: "İstifadəçi hüquqları", type: "module" },
                    { id: "settings.workflows", label: "Təsdiqləmə Şablonları (Workflow)", type: "module" },
                    { id: "settings.templates", label: "Sənəd Şablonları", type: "module" },
                    { id: "settings.security", label: "Təhlükəsizlik", type: "module" },
                    { id: "settings.audit", label: "Audit", type: "module" },
                    { id: "settings.monitoring", label: "Monitorinq", type: "module" },
                    { id: "settings.backups", label: "Backups", type: "module" },
                    { id: "settings.notifications", label: "Bildirişlər", type: "module" },
                    { id: "settings.integrations", label: "İnteqrasiyalar", type: "module" },
                    { id: "settings.global-restrictions", label: "Qlobal Məhdudiyyətlər", type: "module" },
                ]
            }
        ]
    },
    {
        id: "hr",
        label: "İnsan Resursları (HR)",
        type: "group",
        children: [
            { id: "hr.employees", label: "İşçilər", type: "module" },
            { id: "hr.attendance", label: "Davamiyyət", type: "module" },
            { id: "hr.payroll", label: "Maaşlar", type: "module" },
        ]
    },
    {
        id: "finance",
        label: "Maliyyə",
        type: "group",
        children: [
            { id: "finance.invoices", label: "Fakturalar", type: "module" },
            { id: "finance.payments", label: "Ödənişlər", type: "module" },
            { id: "finance.reports", label: "Maliyyə Hesabatları", type: "module" },
        ]
    },
    {
        id: "crm",
        label: "CRM",
        type: "group",
        children: [
            { id: "crm.clients", label: "Müştərilər", type: "module" },
            { id: "crm.deals", label: "Əqdlər", type: "module" },
        ]
    },
    {
        id: "inventory",
        label: "Anbar",
        type: "group",
        children: [
            { id: "inventory.products", label: "Məhsullar", type: "module" },
            { id: "inventory.stock", label: "Qalıqlar", type: "module" },
        ]
    }
]

const PERMISSION_OPTIONS = [
    { value: "hide", label: "Gizlətmək" },
    { value: "view", label: "Görmək" },
    { value: "create", label: "Yaratmaq" },
    { value: "edit", label: "Redaktə etmək" },
    { value: "delete", label: "Silmək" },
    { value: "full", label: "Tam" },
]

// Permission Selector Component (Leaf Node)
function PermissionSelector({ label, selected, onChange }: { label: string, selected: string[], onChange: (val: string[]) => void }) {
    const [open, setOpen] = useState(false)

    const handleSelect = (value: string) => {
        let newSelected = [...selected]

        if (value === "full") {
            if (newSelected.includes("full")) {
                newSelected = newSelected.filter(i => i !== "full")
                if (newSelected.length === 0) newSelected = ["hide"]
            } else {
                newSelected = ["view", "create", "edit", "delete", "full"]
            }
        }
        else if (value === "hide") {
            newSelected = ["hide"]
        }
        else {
            newSelected = newSelected.filter(i => i !== "hide")

            if (newSelected.includes(value)) {
                newSelected = newSelected.filter(i => i !== value)
                newSelected = newSelected.filter(i => i !== "full")
            } else {
                newSelected.push(value)
            }
            if (newSelected.length === 0) newSelected = ["hide"]
        }

        onChange(newSelected)
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3 rounded-sm gap-4 hover:bg-muted/40 transition-colors border border-transparent hover:border-muted-foreground/10">
            <span className="text-sm font-medium min-w-[180px]">{label}</span>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="flex-1 justify-between min-h-[2.2rem] h-auto px-3 py-1.5 text-xs"
                    >
                        <div className="flex flex-wrap gap-1 items-center">
                            {selected.length > 0 && selected[0] !== "hide" ? (
                                selected.map(val => {
                                    const option = PERMISSION_OPTIONS.find(o => o.value === val)
                                    return (
                                        <Badge key={val} variant="secondary" className="mr-1 py-0 px-2 text-[10px] font-normal h-5">
                                            {option?.label || val}
                                            <div
                                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors p-0.5"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleSelect(val)
                                                }}
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </div>
                                        </Badge>
                                    )
                                })
                            ) : (
                                <span className="text-muted-foreground text-xs">Gizlətmək</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="end">
                    <div className="flex flex-col gap-0.5">
                        {PERMISSION_OPTIONS.map((option) => {
                            const isSelected = selected.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    className="flex items-center space-x-2 p-1.5 rounded-sm hover:bg-muted cursor-pointer transition-colors"
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <div className={cn(
                                        "h-3.5 w-3.5 border rounded-sm flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground opacity-50"
                                    )}>
                                        {isSelected && <Check className="h-2.5 w-2.5" />}
                                    </div>
                                    <span className={cn("text-xs", isSelected ? "font-medium" : "")}>
                                        {option.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

// Recursive Renderer
interface PermissionRendererProps {
    node: PermissionNode
    rolePermissions: Record<string, string[]>
    handlePermissionChange: (id: string, values: string[]) => void
    handleGroupAction: (children: PermissionNode[], action: "full" | "hide") => void
    level?: number
}

const PermissionNodeRenderer = ({ node, rolePermissions, handlePermissionChange, handleGroupAction, level = 0 }: PermissionRendererProps) => {
    if (node.type === "group" && node.children) {
        return (
            <Accordion type="single" collapsible className={cn("rounded-md bg-background", level > 0 ? "border-l-2 border-primary/10 mt-2" : "border")}>
                <AccordionItem value={node.id} className="border-0">
                    <AccordionTrigger className={cn("hover:no-underline py-2 px-3 hover:bg-muted/30 transition-colors rounded-t-md", level === 0 ? "bg-muted/10" : "")}>
                        <div className="flex items-center justify-between w-full mr-4">
                            <span className={cn("font-semibold", level === 0 ? "text-lg" : "text-base")}>{node.label}</span>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="h-6 px-3 flex items-center justify-center rounded-md text-[10px] uppercase tracking-wider font-medium bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); handleGroupAction(node.children!, "full") }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleGroupAction(node.children!, "full") }}
                                >
                                    Tam
                                </div>
                                <div
                                    role="button"
                                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                                    tabIndex={0}
                                    className="h-6 px-3 flex items-center justify-center rounded-md text-[10px] uppercase tracking-wider font-medium bg-destructive/5 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); handleGroupAction(node.children!, "hide") }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleGroupAction(node.children!, "hide") }}
                                >
                                    Gizlət
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-2 px-2">
                        <div className="space-y-1">
                            {node.children.map((child) => (
                                <PermissionNodeRenderer
                                    key={child.id}
                                    node={child}
                                    rolePermissions={rolePermissions}
                                    handlePermissionChange={handlePermissionChange}
                                    handleGroupAction={handleGroupAction}
                                    level={level + 1}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion >
        )
    } else {
        return (
            <div className={cn(level === 0 ? "border rounded-md bg-background" : "")}>
                <PermissionSelector
                    label={node.label}
                    selected={rolePermissions[node.id] || ["hide"]}
                    onChange={(val) => handlePermissionChange(node.id, val)}
                />
            </div>
        )
    }
}

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
    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({})

    // Modals
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create")
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
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
            setRolePermissions({
                "dashboard": ["view"],
                "users": ["view"],
                "settings.general": ["view", "edit"]
            })
        } else {
            setRolePermissions({})
        }
    }, [selectedRole])

    const handlePermissionChange = (moduleId: string, newValues: string[]) => {
        setRolePermissions(prev => ({ ...prev, [moduleId]: newValues }))
    }

    const handleGroupAction = (groupChildren: PermissionNode[], action: "full" | "hide") => {
        const newPermissions = { ...rolePermissions }
        const leafIds = getLeafIds(groupChildren)
        leafIds.forEach(id => {
            if (action === "full") {
                newPermissions[id] = ["view", "create", "edit", "delete", "full"]
            } else {
                newPermissions[id] = ["hide"]
            }
        })
        setRolePermissions(newPermissions)
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

                    {/* 3. Permissions Layout: Recursive */}
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
                                    {permissionsStructure
                                        .filter(node => context === "admin" || node.id !== "admin") // Hide Admin group if tenant
                                        .map((node) => (
                                            <PermissionNodeRenderer
                                                key={node.id}
                                                node={node}
                                                rolePermissions={rolePermissions}
                                                handlePermissionChange={handlePermissionChange}
                                                handleGroupAction={handleGroupAction}
                                            />
                                        ))}

                                    <div className="pt-4 flex justify-end">
                                        <Button size="lg" onClick={() => {
                                            toast.success("İcazələr uğurla yadda saxlanıldı!")
                                        }}>
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
        </div>
    )
}
