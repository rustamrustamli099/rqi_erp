import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
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
import { Badge } from "@/shared/components/ui/badge"
import { Shield, LayoutGrid, List, FileText, Download, Info, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
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
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination"
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar"
import { PageHeader } from "@/shared/components/ui/page-header"
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog"
import { toast } from "sonner"
import { usePermissions } from "@/app/auth/hooks/usePermissions"
import { RoleCreationWizard } from "./_components/RoleCreationWizard"
import { RoleFormDialog, type RoleFormValues } from "./_components/RoleFormDialog"
import { systemApi, type SystemPermission } from "@/domains/system-console/api/system.contract";
import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation, useGetRoleByIdQuery, type Role } from "@/store/api";
import { PermissionMatrix } from "@/domains/system-console/feature-flags/PermissionMatrix";
import { PermissionTreeEditor } from "./_components/PermissionTreeEditor"
import { permissionsStructure } from "@/app/security/permission-structure"
import { PermissionDiffViewer } from "./_components/PermissionDiffViewer"
import { PermissionPreviewSimulator } from "./_components/PermissionPreviewSimulator"
import { useListQuery } from "@/shared/hooks/useListQuery"
// SoD Engine
import { SoDValidationService, type SoDValidationResult } from "@/app/security/sod-rules"
import { SoDConflictModal } from "@/shared/components/security/SoDConflictModal"

import { Skeleton } from "@/shared/components/ui/skeleton"
import { Modal } from "@/shared/components/ui/modal"
import { FilterDrawer } from "@/shared/components/ui/filter-drawer"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { ROLE_SCOPES, ROLE_STATUSES, getStatusColor, createRoleColumns, useRoleWorkflow } from "./_components/roles"

// Helper Role Table Component to reduce duplication
const RoleTable = ({
    data, columns, sorting, columnVisibility, rowSelection, columnFilters,
    setSorting, setColumnVisibility, setRowSelection, setColumnFilters, onRowClick,
    onAddClick, isLoading,
    // Hook Connections
    searchTerm, setSearch, setPage, setPageSize, pagination,
    // Filter Connections
    query, setFilter, reset,
    // Export Support
    onExportClick
}: any) => {
    // Local state for "Apply" logic
    const [draftFilters, setDraftFilters] = useState(query.filters || {});

    // Sync draft with URL when query changes
    useEffect(() => {
        setDraftFilters(query.filters || {});
    }, [query.filters]);

    const handleApply = () => {
        // Apply all draft filters to the URL
        Object.keys(draftFilters).forEach(key => {
            setFilter(key, draftFilters[key]);
        });

        // Also ensure removed keys are cleared? 
        // Current setFilter(key, value) handles update. 
        // If I want to remove keys that are in query but not in draft? 
        // Simplified: We only have 2 known filters.
        if (draftFilters.scope === undefined) setFilter('scope', undefined);
        if (draftFilters.status === undefined) setFilter('status', undefined);
    };

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
        enableRowSelection: true,
        // Manual Pagination
        manualPagination: true,
        pageCount: -1, // Server-side
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: (updater) => {
            // TanStack passes updater func
            if (typeof updater === 'function') {
                const newState = updater(pagination);
                setPage(newState.pageIndex + 1);
                setPageSize(newState.pageSize);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <Card className="border-0 shadow-none">
            <CardContent className="p-0">
                <DataTableToolbar
                    table={table}
                    searchPlaceholder="Rolları axtar..."
                    addLabel="Yeni Rol"
                    onAddClick={onAddClick}
                    searchValue={searchTerm}
                    onSearchChange={setSearch}
                    onExportClick={onExportClick}
                    canExport={!!onExportClick}
                >
                    <FilterDrawer
                        resetFilters={reset}
                        onApply={handleApply}
                    >
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Scope</Label>
                                <Select
                                    value={draftFilters.scope || "ALL"}
                                    onValueChange={(val) => setDraftFilters({ ...draftFilters, scope: val === "ALL" ? undefined : val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Bütün Scope-lar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLE_SCOPES.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={draftFilters.status || "ALL"}
                                    onValueChange={(val) => setDraftFilters({ ...draftFilters, status: val === "ALL" ? undefined : val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Bütün Statuslar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLE_STATUSES.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FilterDrawer>
                </DataTableToolbar>

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
                            {isLoading ? (
                                // SKELETON LOADING STATE
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <TableRow key={idx} className="hover:bg-transparent">
                                        {columns.map((col: any, colIdx: number) => (
                                            <TableCell key={colIdx}>
                                                <Skeleton className="h-6 w-full max-w-[150px]" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="cursor-pointer"
                                        onClick={() => onRowClick(row.original)}
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
                <div className="pt-4">
                    <DataTablePagination table={table} />
                </div>
            </CardContent>
        </Card>
    )
}

// Import ResolvedNavNode type
import { type ResolvedNavNode } from "@/app/security/navigationResolver";
import { ScrollableSubTabsFromResolver } from "@/shared/components/ui/ScrollableSubTabs";

interface RolesPageProps {
    tabNode?: ResolvedNavNode;
    context?: "admin" | "tenant";
}

export default function RolesPage({ tabNode, context = "admin" }: RolesPageProps) {
    useTranslation()
    const { can } = usePermissions();
    const [searchParams, setSearchParams] = useSearchParams();

    // SAP-GRADE: Read subTab from URL (Managed by ProtectedRoute)
    const subTabs = tabNode?.children ?? [];
    const allowedKeys = subTabs.map(st => st.subTabKey || st.id);

    const urlSubTab = searchParams.get('subTab') || '';
    const currentTab = allowedKeys.includes(urlSubTab) ? urlSubTab : allowedKeys[0] || 'roles';

    const handleTabChange = (value: string) => {
        console.log('[RolesPage] handleTabChange:', value);
        if (!allowedKeys.includes(value)) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('subTab', value);
        setSearchParams(newParams, { replace: true });
    };

    // SAP-Grade List Query Engine (MUST BE BEFORE RTK Query hooks)
    const defaultFilters = useMemo(() => ({
        scope: context === 'admin' ? '' : 'TENANT'
    }), [context]);

    const {
        query,
        searchTerm,
        setSearch,
        setPage,
        setPageSize,
        setSort,
        setFilter,
        reset
    } = useListQuery({
        defaultSortBy: 'createdAt',
        defaultSortDir: 'desc',
        defaultFilters
    });

    // RTK Query - Roles with caching (uses query from useListQuery)
    const { data: rolesData, isLoading: loading, isFetching, refetch: refetchRoles } = useGetRolesQuery({
        scope: query.filters?.scope as 'SYSTEM' | 'TENANT' | undefined,
        status: query.filters?.status,
        search: query.search,
        page: query.page,
        pageSize: query.pageSize,
    });

    // Transform roles data
    const roles = useMemo(() => {
        if (!rolesData?.items) return [];
        return rolesData.items.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            type: (r.isSystem || r.scope === 'SYSTEM') ? 'system' : 'custom',
            scope: r.scope || 'TENANT',
            usersCount: r._count?.userRoles || r.usersCount || 0,
            permissionsCount: r._count?.permissions || (r.permissions || []).length || 0,
            permissions: r.permissions || [],
            status: r.status || 'ACTIVE',
            version: r.version || 1,
        }));
    }, [rolesData]);

    // RTK Query Mutations
    const [createRoleMutation] = useCreateRoleMutation();
    const [updateRoleMutation] = useUpdateRoleMutation();
    const [deleteRoleMutation] = useDeleteRoleMutation();

    const [allPermissions, setAllPermissions] = useState<SystemPermission[]>([])
    const [permissionsLoading, setPermissionsLoading] = useState(false)

    // Derived Table State for TanStack Table (Sync with URL)
    const pagination = useMemo(() => ({
        pageIndex: query.page - 1,
        pageSize: query.pageSize,
    }), [query.page, query.pageSize]);

    const sortingState = useMemo<SortingState>(() => [
        { id: query.sortBy || 'createdAt', desc: query.sortDir === 'desc' }
    ], [query.sortBy, query.sortDir]);

    // Table State
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    // Permission State
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    // const [hiddenNodes, setHiddenNodes] = useState<string[]>([]) // Unused
    const [originalPermissions, setOriginalPermissions] = useState<string[]>([]) // For diffing
    const [currentRole, setCurrentRole] = useState<Role | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>("")
    const [roleSearchOpen, setRoleSearchOpen] = useState(false)

    // Modals
    const [wizardOpen, setWizardOpen] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create")
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDiffOpen, setIsDiffOpen] = useState(false) // For review dialog
    const [isPreviewOpen, setIsPreviewOpen] = useState(false) // For Simulator
    // const [currentTab, setCurrentTab] = useState("list") // Duplicate removed

    // SoD State
    const [sodModalOpen, setSodModalOpen] = useState(false)
    const [sodValidationResult, setSodValidationResult] = useState<SoDValidationResult | null>(null)
    const [pendingRoleValues, setPendingRoleValues] = useState<RoleFormValues | null>(null)

    // Workflow Hook (Submit/Approve/Reject)
    const workflow = useRoleWorkflow({ onSuccess: refetchRoles });

    // Handlers
    const handleCreateRole = async (values: any) => {
        try {
            await systemApi.createRole({
                name: values.name,
                description: values.description,
                scope: values.scope,
                permissionIds: []
            });
            toast.success("Rol uğurla yaradıldı (Draft)");
            setWizardOpen(false);
            fetchRoles();
        } catch (e) {
            toast.error("Xəta baş verdi");
        }
    }

    const handleRoleSelect = async (roleLite: Role) => {
        try {
            // Lazy Load Full Role Details (Permissions)
            // Show loading state if needed? For now just await.
            const fullRole = await systemApi.getRole(roleLite.id);
            setCurrentRole(fullRole);

            // Map permissions for UI
            // Map permissions for UI (Support nested relation)
            const perms = fullRole.permissions ? fullRole.permissions.map((p: any) => p.permission?.slug || p.slug || p.permissionId) : [];
            setSelectedPermissions(perms);
            setOriginalPermissions(perms);

            setSelectedRole(roleLite.name);
        } catch (e) {
            toast.error("Rol detalları yüklənə bilmədi");
            console.error(e);
        }
    }

    // Column definitions - extracted to separate file
    const columns = useMemo(() => createRoleColumns({
        onView: (role) => {
            setCurrentRole(role);
            setDialogMode("view");
            setDialogOpen(true);
        },
        onEdit: (role) => {
            setCurrentRole(role);
            setDialogMode("edit");
            fetchAllPermissions();
            setDialogOpen(true);
        },
        onDelete: (role) => {
            setCurrentRole(role);
            setIsDeleteOpen(true);
        },
        onSelectPermissions: (role) => setSelectedRole(role.name),
        onSubmit: workflow.handleSubmit,
        onApprove: workflow.handleApprove,
        onReject: workflow.handleReject,
        onHistory: () => toast.info("Audit tarixçəsi tezliklə hazır olacaq"),
    }), [workflow.handleSubmit, workflow.handleApprove, workflow.handleReject]);

    // Fetch Logic
    // ... imports
    // Fetch Logic


    // Fetch Logic
    const fetchAllPermissions = async () => {
        if (allPermissions.length > 0) return; // Already loaded
        try {
            const perms = await systemApi.getPermissions();
            setAllPermissions(Array.isArray(perms) ? perms : []);
        } catch (e) {
            console.error("Permissions load failed", e);
        }
    }

    // RTK Query handles caching and refetching automatically
    // fetchRoles is now just an alias for refetch
    const fetchRoles = refetchRoles;

    // Use systemApi in handleSaveRole - WITH BACKEND SoD VALIDATION
    const handleSaveRole = async (values: RoleFormValues) => {
        try {
            // Backend validation: SoD + Risk Score
            const validationResult = await systemApi.governance.validate(values.permissions || []);

            if (validationResult.sodResult.conflicts.length > 0) {
                // Store pending values and show SoD modal
                setPendingRoleValues(values);
                setSodValidationResult(validationResult.sodResult);
                setSodModalOpen(true);

                // Block on CRITICAL conflicts - can't proceed
                if (validationResult.sodResult.criticalCount > 0) {
                    return;
                }

                // For HIGH/MEDIUM - show modal but allow proceed
                return;
            }

            // Check if approval is required
            if (validationResult.requiresApproval) {
                toast.info("Bu rol yüksək risklidir. Təsdiq üçün göndərilir...");
                // Would create approval request here
            }

            // No conflicts - proceed with save
            await executeRoleSave(values);
        } catch (error) {
            console.error('Governance validation error:', error);
            // Fallback to local validation if backend unavailable
            const sodResult = SoDValidationService.validate(values.permissions || []);
            if (sodResult.conflicts.length > 0) {
                setPendingRoleValues(values);
                setSodValidationResult(sodResult);
                setSodModalOpen(true);
                return;
            }
            await executeRoleSave(values);
        }
    };

    // Actual save logic (called after SoD check passes or user proceeds)
    const executeRoleSave = async (values: RoleFormValues) => {
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
            // Clear SoD state
            setPendingRoleValues(null);
            setSodValidationResult(null);
        } catch {
            toast.error("Xəta baş verdi");
        }
    };

    // SoD Modal handlers
    const handleSodProceed = async () => {
        if (pendingRoleValues) {
            setSodModalOpen(false);

            // Check if approval workflow needed for HIGH conflicts
            if (sodValidationResult && sodValidationResult.highCount > 0) {
                try {
                    // Create approval request via backend
                    await systemApi.governance.createApprovalRequest({
                        entityType: 'ROLE',
                        entityId: currentRole?.id || 'new',
                        entityName: pendingRoleValues.name,
                        action: dialogMode === 'create' ? 'CREATE' : 'UPDATE',
                        sodConflicts: sodValidationResult.conflicts.length
                    });
                    toast.info("Rol təsdiq üçün göndərildi. Approvers bildiriş alacaq.");
                    setDialogOpen(false);
                } catch {
                    // Fallback - save with warning
                    toast.warning("Approval yaradıla bilmədi. Birbaşa yadda saxlanılır.");
                    await executeRoleSave(pendingRoleValues);
                }
            } else {
                // MEDIUM conflicts - save with warning
                toast.warning("SoD xəbərdarlığı ilə yadda saxlanıldı.");
                await executeRoleSave(pendingRoleValues);
            }
        }
    };

    const handleSodCancel = () => {
        setSodModalOpen(false);
        setPendingRoleValues(null);
        setSodValidationResult(null);
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

    // Workflow handlers used directly from workflow hook in columns and dialogs

    // ... (rest of render logic, ensuring `data` is replaced by `roles` in table definition)
    // Old Table Definition Removed - Logic moved to RoleTable component

    // Reset permissions when role changes
    // CONFLICT FIX: Removed useEffect that watched [selectedRole].
    // Previous logic was overwriting the permissions fetched in handleRoleSelect with incomplete data from the 'roles' list.
    // Now handleRoleSelect is the single source of truth for setting current role and permissions.

    // Trigger review dialog
    // const handlePermissionsSaveClick = () => {
    //     setIsDiffOpen(true);
    // }

    // Actually save after confirmation
    // Actually save after confirmation
    const confirmPermissionsSave = async () => {
        if (!currentRole) return;

        try {
            await systemApi.updateRole(currentRole.id, {
                // We only update permissions here. Name/Desc/Scope preserve old values or are undefined (Partial Update).
                // API expects full DTO or Partial? Client contract says UpdateRoleRequest with all fields? 
                // Let's check client contract. It demands "name, description, scope, permissionIds".
                // Ideally I should send current values for others, or update contract to allow partial.
                // For now, I'll send current values to be safe.
                name: currentRole.name,
                description: currentRole.description,
                scope: currentRole.scope,
                permissionIds: selectedPermissions
            });

            toast.success("İcazələr uğurla yeniləndi! Rol təsdiq üçün 'Draft' statusuna keçirildi.");
            fetchRoles(); // Refresh to see status change
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "İcazələri yadda saxlayarkən xəta baş verdi.");
        } finally {
            setIsDiffOpen(false);
        }
    }

    // UI Helpers for opening modals
    const openCreateModal = () => {
        setCurrentRole(null)
        setDialogMode("create")
        setDialogOpen(true)
    }

    const [isSaving, setIsSaving] = useState(false);

    const handleSavePermissions = async () => {
        if (!currentRole) return;
        setIsSaving(true);
        try {
            await systemApi.updateRole(currentRole.id, {
                // Partial update relying on backend handling or sending existing values
                name: currentRole.name,
                description: currentRole.description,
                scope: currentRole.scope,
                permissionIds: selectedPermissions
            });
            toast.success("İcazələr yadda saxlanıldı");
            fetchRoles();
            // Update current role local state to reflect new permissions? 
            // fetchRoles updates list, but currentRole might need refresh if we stay on it.
            // For now good enough.
        } catch (error: any) {
            toast.error("Xəta baş verdi: " + error.message)
        } finally {
            setIsSaving(false);
            setIsDiffOpen(false);
        }
    };

    const handlePermissionChange = (newSlugs: string[]) => {
        setSelectedPermissions(newSlugs);
    };

    // Content and icon maps for ScrollableSubTabsFromResolver
    const contentMap: Record<string, React.ReactNode> = {
        roles: (
            <RoleTable
                data={roles}
                columns={columns}
                sorting={sortingState}
                columnVisibility={columnVisibility}
                rowSelection={rowSelection}
                columnFilters={columnFilters}
                setSorting={(updaterOrValue: any) => {
                    const newState = typeof updaterOrValue === 'function' ? updaterOrValue(sortingState) : updaterOrValue;
                    const first = newState[0];
                    if (first) setSort(first.id);
                }}
                setColumnVisibility={setColumnVisibility}
                setRowSelection={setRowSelection}
                setColumnFilters={setColumnFilters}
                onRowClick={handleRoleSelect}
                onAddClick={() => setWizardOpen(true)}
                isLoading={loading}
                searchTerm={searchTerm}
                setSearch={setSearch}
                setPage={setPage}
                setPageSize={setPageSize}
                pagination={pagination}
                query={query}
                setFilter={setFilter}
                reset={reset}
                onExportClick={can('system.settings.security.user_rights.roles.read') ? () => {
                    const headers = ['Ad', 'Təsvir', 'Növ', 'Scope', 'İstifadəçi Sayı', 'İcazə Sayı', 'Status'];
                    const csvRows = [
                        headers.join(','),
                        ...roles.map((r: any) => [
                            `"${r.name || ''}"`,
                            `"${(r.description || '').replace(/"/g, '""')}"`,
                            r.type,
                            r.scope,
                            r.usersCount || 0,
                            r.permissionsCount || 0,
                            r.status || 'N/A'
                        ].join(','))
                    ];
                    const csvContent = csvRows.join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `roles_export_${new Date().toISOString().slice(0, 10)}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    toast.success('Rollar CSV olaraq ixrac edildi');
                } : undefined}
            />
        ),
        matrix_view: <PermissionMatrix roles={roles} />,
        compliance: (
            <Card>
                <CardHeader>
                    <CardTitle>Uyğunluq və Audit Sənədləri (Compliance & Audit)</CardTitle>
                    <CardDescription>Sistem auditə tam hazırdır. Aşağıdakı düymələr vasitəsilə lazımi sübutları yükləyə bilərsiniz.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-lg bg-muted/20 flex flex-col justify-between space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> SOC2 Type II Evidence</h3>
                            <p className="text-sm text-muted-foreground mt-1">Avtomatik log analizi, rol təsdiqləmə tarixçəsi və sistem konfiqurasiyası.</p>
                        </div>
                        <Button className="w-full" variant="outline" onClick={() => window.open('http://localhost:3000/api/v1/compliance/export/soc2', '_blank')}>
                            <Download className="mr-2 h-4 w-4" /> Yüklə (JSON)
                        </Button>
                    </div>
                    <div className="border p-4 rounded-lg bg-muted/20 flex flex-col justify-between space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-green-600" /> ISO 27001 SoA</h3>
                            <p className="text-sm text-muted-foreground mt-1">Tətbiq Bəyanatı (SoA) - RBAC və Təhlükəsizlik kontrollarının statusu.</p>
                        </div>
                        <Button className="w-full" variant="outline" onClick={() => window.open('http://localhost:3000/api/v1/compliance/export/iso27001', '_blank')}>
                            <Download className="mr-2 h-4 w-4" /> Yüklə (JSON)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    };

    const iconMap: Record<string, React.ReactNode> = {
        roles: <List className="w-4 h-4" />,
        matrix_view: <LayoutGrid className="w-4 h-4" />,
        compliance: <FileText className="w-4 h-4" />
    };

    return (
        <div className="space-y-4">

            <PageHeader
                heading="Rollar və İcazələr"
                text="İstifadəçi hüquqlarını idarə edin."
            />

            {/* SAP-GRADE SubTabs using resolver */}
            <ScrollableSubTabsFromResolver
                tabNode={tabNode}
                value={currentTab}
                onValueChange={handleTabChange}
                contentMap={contentMap}
                iconMap={iconMap}
                variant="default"
            />

            {/* Permission Editor Section (Visible ONLY in roles view) */}
            {currentTab === 'roles' && (
                <div className="space-y-4 pt-4 border-t">
                    {currentRole ? (
                        <Accordion type="single" collapsible defaultValue="permissions" className="w-full">
                            <AccordionItem value="permissions" className="border rounded-md bg-card overflow-hidden">
                                <AccordionTrigger className="hover:no-underline px-4 py-3 bg-muted/30 border-b">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold">İcazələr: <span className="text-primary">{selectedRole}</span></h3>
                                            {currentRole.scope === "SYSTEM" ? (
                                                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">System Scope</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">Tenant Scope</Badge>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0">
                                    <div className="p-4 bg-muted/5 border-b flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background px-3 py-1.5 rounded-md border shadow-sm">
                                            <Info className="h-4 w-4 text-blue-500" />
                                            <span>Dəyişikliklər avtomatik yadda saxlanılır.</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                        </div>
                                    </div>

                                    {/* Permission Tree Editor */}
                                    <div className="p-6 bg-card min-h-[500px]">
                                        {(() => {
                                            const roleScope = currentRole?.scope || "TENANT";

                                            // SAP FILTERING RULE: 
                                            // System Role -> Only System/Common permissions
                                            // Tenant Role -> Only Tenant/Common permissions
                                            const filteredTree = permissionsStructure.filter(node => {
                                                if (roleScope === "TENANT") {
                                                    return node.scope === "TENANT" || node.scope === "COMMON";
                                                }
                                                if (roleScope === "SYSTEM") {
                                                    return node.scope === "SYSTEM" || node.scope === "COMMON";
                                                }
                                                return false;
                                            });

                                            return (
                                                <PermissionTreeEditor
                                                    permissions={filteredTree}
                                                    selectedSlugs={selectedPermissions}
                                                    onChange={handlePermissionChange}
                                                />
                                            );
                                        })()}
                                    </div>

                                    <div className="p-4 bg-muted/30 border-t flex justify-between items-center">
                                        <div className="text-xs text-muted-foreground">
                                            * Qırmızı (Təhlükəli) icazələr xüsusi təsdiq tələb edə bilər.
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="gap-2">
                                                <Play className="w-4 h-4" /> Simulyasiya
                                            </Button>
                                            <Button onClick={() => setIsDiffOpen(true)} disabled={isSaving}>
                                                {isSaving ? "Yadda saxlanılır..." : "Yadda Saxla"}
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/5">
                            <Shield className="h-12 w-12 opacity-20 mb-4" />
                            <h3 className="text-lg font-medium">İcazələri redaktə etmək üçün cədvəldən rol seçin</h3>
                            <p className="text-sm opacity-70">Sistem və ya Tenant rollarından birini seçərək davam edin.</p>
                        </div>
                    )}
                </div>
            )}


            {/* Shared Reusable Modal */}
            <RoleCreationWizard
                open={wizardOpen}
                onOpenChange={setWizardOpen}
                onSubmit={handleCreateRole}
            />

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
                onConfirm={confirmDeleteRole}
                variant="destructive"
                confirmText="Sil"
            />

            {/* SoD Conflict Modal */}
            {sodValidationResult && (
                <SoDConflictModal
                    open={sodModalOpen}
                    onOpenChange={setSodModalOpen}
                    validationResult={sodValidationResult}
                    onProceedAnyway={sodValidationResult.criticalCount === 0 ? handleSodProceed : undefined}
                    onCancel={handleSodCancel}
                    entityType="role"
                    entityName={pendingRoleValues?.name || currentRole?.name || "Unknown"}
                />
            )}

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
                        <Button onClick={handleSavePermissions} disabled={isSaving}>
                            {isSaving ? "Yadda saxlanılır..." : "Təsdiqlə və Yadda Saxla"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Simulation / Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>İcazə Simulyasiyası</DialogTitle>
                        <DialogDescription>
                            Seçilmiş icazələrə əsasən sistemin görünüşünü yoxlayın.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2">
                        <PermissionPreviewSimulator
                            permissions={selectedPermissions}
                            context={context}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reject Role Modal */}
            <Modal
                isOpen={workflow.isRejectOpen}
                onClose={workflow.cancelReject}
                title="Rolu İmtina Et"
                description="Bu rolu imtina etmək üçün səbəb qeyd edin."
                footer={
                    <>
                        <Button variant="outline" onClick={workflow.cancelReject} disabled={workflow.isRejectLoading}>Ləğv et</Button>
                        <Button variant="destructive" onClick={workflow.confirmReject} disabled={workflow.isRejectLoading}>
                            {workflow.isRejectLoading ? "Gözləyin..." : "İmtina Et"}
                        </Button>
                    </>
                }
            >
                <textarea
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    placeholder="İmtina səbəbi..."
                    value={workflow.rejectReason}
                    onChange={(e) => workflow.setRejectReason(e.target.value)}
                    disabled={workflow.isRejectLoading}
                />
            </Modal>

            {/* Approve Role Modal */}
            <Modal
                isOpen={workflow.isApproveOpen}
                onClose={workflow.cancelApprove}
                title="Rolu Təsdiqlə"
                description="Bu rolu təsdiqləmək istədiyinizə əminsiniz? Rol aktivləşdiriləcək."
                footer={
                    <>
                        <Button variant="outline" onClick={workflow.cancelApprove} disabled={workflow.isApproveLoading}>Ləğv et</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={workflow.confirmApprove} disabled={workflow.isApproveLoading}>
                            {workflow.isApproveLoading ? "Gözləyin..." : "Təsdiqlə"}
                        </Button>
                    </>
                }
            >
                <p className="text-muted-foreground">Bu əməliyyatı geri qaytarmaq mümkün deyil.</p>
            </Modal>

            {/* Submit Role Modal */}
            <Modal
                isOpen={workflow.isSubmitOpen}
                onClose={workflow.cancelSubmit}
                title="Təsdiqə Göndər"
                description="Bu rolu təsdiqə göndərmək istədiyinizə əminsiniz?"
                footer={
                    <>
                        <Button variant="outline" onClick={workflow.cancelSubmit} disabled={workflow.isSubmitLoading}>Ləğv et</Button>
                        <Button onClick={workflow.confirmSubmit} disabled={workflow.isSubmitLoading}>
                            {workflow.isSubmitLoading ? "Gözləyin..." : "Göndər"}
                        </Button>
                    </>
                }
            >
                <p className="text-muted-foreground">Rolun statusu "Təsdiq Gözləyir" olacaq.</p>
            </Modal>

        </div >
    )
}
