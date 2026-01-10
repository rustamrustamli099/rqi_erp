"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
// import type { Tenant } from "@/types/schema" // REMOVED
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
    type RowSelectionState,
    flexRender,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/shared/components/ui/page-header"
import { toast } from "sonner"
import { tenantApi, type Tenant } from "../api/tenant.contract"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { TenantUsersDialog } from "./_components/TenantUsersDialog"
import { SuspendTenantDialog, TerminateContractDialog } from "./_components/TenantContractDialogs"
import { TenantBillingDialog, TenantModulesDialog } from "./_components/TenantAdvancedDialogs"
import { TenantRestrictionsDialog } from "./_components/TenantRestrictionsDialog"
import { OnboardingWizard } from "./_components/OnboardingWizard"
import { TenantEditDialog } from "./_components/TenantEditDialog"
import { TenantDetailSheet } from "./_components/TenantDetailSheet"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { FilterDrawer } from "@/components/ui/filter-drawer"
import { MOCK_SECTORS } from "@/shared/constants/reference-data"
import { createColumns } from "./_components/tenants-columns"
import { MOCK_TENANTS } from "@/shared/constants/reference-data"
// PHASE 14G: Import page state hook
import { usePageState } from "@/app/security/usePageState"
import { ACTION_KEYS } from "@/app/navigation/action-keys"
import { ExportModal } from "@/shared/components/ui/export-modal"

const sectorOptions = MOCK_SECTORS.map(s => ({ label: s.name, value: s.id }))

const statusOptions = [
    { label: "Aktiv", value: "ACTIVE" },
    { label: "Ləğv edilib", value: "CANCELLED" },
    { label: "Dayandırılıb", value: "SUSPENDED" },
]

export default function TenantList() {
    console.log('[TenantList] Mounting/Rendering');
    useEffect(() => {
        console.log('[TenantList] Mounted');
        return () => console.log('[TenantList] Unmounted');
    }, []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS as any)

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isRestrictionsDialogOpen, setIsRestrictionsDialogOpen] = useState(false)
    const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
    const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false)
    const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false)
    const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false)
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const fetchTenants = useCallback(async () => {
        try {
            const data = await tenantApi.getTenants()
            setTenants(data)
        } catch (_error) {
            toast.error("Məlumatları yükləyərkən xəta baş verdi")
        }
    }, [])

    useEffect(() => {
        fetchTenants()
    }, [fetchTenants])

    const handleCreateTenant = useCallback(async (data: Partial<Tenant>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newTenant = await tenantApi.createTenant(data as any)
            setTenants(prev => [...prev, newTenant])
            setIsCreateDialogOpen(false)
            toast.success("Yeni tenant yaradıldı")
        } catch (_error) {
            toast.error("Tenant yaradılarkən xəta")
        }
    }, [])

    const handleSuspend = useCallback(async (t: Tenant) => {
        try {
            // await tenantApi.suspendTenant(t.id, reason)
            setTenants(prev => prev.map(item => item.id === t.id ? { ...item, status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : item))
            toast.success(`Tenant ${t.status === 'ACTIVE' ? 'dayandırıldı' : 'aktivləşdirildi'}`)
            setIsSuspendDialogOpen(false)
        } catch (_error) {
            toast.error("Xəta baş verdi")
        }
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdateTenant = useCallback(async (data: any) => {
        if (!currentTenant) return;
        try {
            const updated = await tenantApi.updateTenant(currentTenant.id, data);
            setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, ...updated } : t))
            setIsEditDialogOpen(false)
            toast.success("Tenant yeniləndi")
        } catch (e) {
            toast.error("Xəta baş verdi")
        }
    }, [currentTenant])



    // Update handleDeleteConfirm to use API
    const handleDeleteClick = useCallback(async (tenant: Tenant) => {
        if (tenant) {
            try {
                await tenantApi.deleteTenant(tenant.id);
                setTenants(prev => prev.filter(t => t.id !== tenant.id))
                setIsDeleteDialogOpen(false)
                toast.success("Tenant silindi")
            } catch (e) {
                toast.error("Silinmə zamanı xəta")
            }
        }
    }, [])


    // --- New Handlers ---
    const handle2FAToggle = useCallback((tenant: Tenant) => {
        // Mock toggle logic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentStatus = (tenant as any)['note']?.includes("[2FA:ENABLED]")
        const newStatus = !currentStatus

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const note = (tenant as any)['note'] || ""
        const newNote = newStatus ? note + " [2FA:ENABLED]" : note.replace(" [2FA:ENABLED]", "")

        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, ['note']: newNote } : t))

        toast.success(newStatus
            ? `2FA bütün ${tenant.name} istifadəçiləri üçün aktivləşdirildi.`
            : `2FA ${tenant.name} üçün ləğv edildi.`
        )
    }, [])

    const handleResetPassword = useCallback((tenant: Tenant) => {
        // In a real app, this would open a dialog or send an email
        toast.success(`ROOT şifrə sıfırlama linki ${tenant.contactEmail} ünvanına göndərildi.`)
    }, [])

    const handleAuditLogs = useCallback((tenant: Tenant) => {
        toast.info(`${tenant.name} üçün audit logları açılır... (Demo)`)
        // Navigation logic would go here
    }, [])

    const handleResourceLimits = useCallback((tenant: Tenant) => {
        toast.info(`${tenant.name} resurs limitləri paneli açılır... (Demo)`)
        // Open specific dialog
    }, [])

    const prepareRestrictions = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsRestrictionsDialogOpen(true);
    }, [])

    const handleTerminate = useCallback((tenant: Tenant) => {
        // Mock terminate
        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: "CANCELLED" } : t))
        toast.error(`${tenant.name} müqaviləsi ləğv edildi.`);
        setIsTerminateDialogOpen(false);
    }, []);

    const prepareView = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsViewDialogOpen(true);
    }, []);

    const prepareEdit = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsEditDialogOpen(true);
    }, []);

    const prepareUsers = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsUsersDialogOpen(true);
    }, []);

    const handleLoginAsAdmin = useCallback((tenant: Tenant) => {
        toast.info("Zəhmət olmasa admin istifadəçisini siyahıdan seçin.");
        prepareUsers(tenant);
    }, [prepareUsers]);

    const handleModulesClick = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsModulesDialogOpen(true);
    }, []);

    const handleBillingClick = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsBillingDialogOpen(true);
    }, []);

    const handleSignContract = useCallback((tenant: Tenant) => {
        toast.success(`${tenant.name} müqavilə imzalandı (Demo)`);
    }, []);

    const confirmTerminate = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsTerminateDialogOpen(true);
    }, []);

    const confirmSuspend = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsSuspendDialogOpen(true);
    }, []);

    const deleteTenant = useCallback((tenant: Tenant) => {
        setCurrentTenant(tenant);
        setIsDeleteDialogOpen(true);
    }, []);

    // --- Filtering Logic ---
    const filteredTenants = useMemo(() => {
        return tenants;
    }, [tenants])

    const getRowClassName = (row: Tenant) => {
        if (row.status === 'SUSPENDED') return "bg-muted/30 opacity-60 data-[state=selected]:bg-muted"
        if (row.status === 'CANCELLED') return "opacity-70 bg-red-50/10 dark:bg-red-900/10"
        return ""
    }

    // PHASE 14G: Tenant Permissions Binding
    const { actions } = usePageState('Z_TENANTS');
    console.log('DEBUG TENANT ACTIONS:', actions);

    // --- Handlers ---
    const handleExport = async (mode: 'CURRENT' | 'ALL') => {
        setIsExporting(true)
        // Mock export simulation
        await new Promise(resolve => setTimeout(resolve, 1500))
        toast.success(`${mode === 'CURRENT' ? 'Cari səhifə' : 'Bütün nəticələr'} müvəffəqiyyətlə ixrac edildi.`)
        setIsExporting(false)
        setIsExportModalOpen(false)
    }

    // --- Table Configuration ---



    // --- Table Configuration ---
    const columns = useMemo(() => createColumns({
        prepareView,
        prepareEdit,
        prepareUsers,
        handleLoginAsAdmin,
        handleModulesClick,
        handleBillingClick,
        handleSignContract,
        confirmTerminate,
        confirmSuspend,
        deleteTenant: deleteTenant,
        handle2FAToggle,
        handleResetPassword,
        handleAuditLogs,
        handleResourceLimits,
        prepareRestrictions
    }, actions), [ // PHASE 14G: Pass actions dependency
        prepareView, prepareEdit, prepareUsers,
        handleLoginAsAdmin, handleModulesClick, handleBillingClick, handleSignContract,
        confirmTerminate, confirmSuspend, deleteTenant,
        handle2FAToggle, handleResetPassword, handleAuditLogs, handleResourceLimits, prepareRestrictions,
        actions
    ])

    const table = useReactTable({
        data: filteredTenants,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // autoResetSorting removed
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        autoResetPageIndex: false,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <div className="px-8 pt-6">
                <PageHeader
                    heading="Tenantlar"
                    text="Sistemdəki bütün şirkətlərin idarə olunması."
                />
            </div>

            {/* ADDED min-w-0 to prevent flex item expansion causing layout shift */}
            <div className="flex-1 flex flex-col space-y-4 p-8 pt-4 overflow-hidden min-w-0">
                <Card className="border-none shadow-none bg-transparent flex flex-col flex-1 overflow-hidden">
                    <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">

                        <DataTableToolbar
                            table={table}
                            onAddClick={actions[ACTION_KEYS.TENANTS_CREATE] ? () => setIsCreateDialogOpen(true) : undefined}
                            addLabel="Yeni Tenant Əlavə Et"
                            searchPlaceholder="Axtarış..."
                            filterColumn="name"
                            onExportClick={actions[ACTION_KEYS.TENANTS_EXPORT] ? () => setIsExportModalOpen(true) : undefined}
                        >
                            <FilterDrawer
                                open={isFilterDrawerOpen}
                                onOpenChange={setIsFilterDrawerOpen}
                                resetFilters={() => table.resetColumnFilters()}
                            >
                                {table.getColumn("status") && (
                                    <div className="space-y-2">
                                        <Label>Status üzrə</Label>
                                        <DataTableFacetedFilter
                                            column={table.getColumn("status")}
                                            title="Status"
                                            options={statusOptions}
                                        />
                                    </div>
                                )}
                                {table.getColumn("sectorId") && (
                                    <div className="space-y-2">
                                        <Label>Sektor üzrə</Label>
                                        <DataTableFacetedFilter
                                            column={table.getColumn("sectorId")}
                                            title="Sektor"
                                            options={sectorOptions}
                                        />
                                    </div>
                                )}
                            </FilterDrawer>
                        </DataTableToolbar>

                        {/* ADDED w-full and min-w-0 for table container */}
                        <div className="rounded-md border bg-card flex-1 overflow-auto relative mt-2 w-full">
                            <Table className="min-w-full">
                                <TableHeader className="sticky top-0 z-20 bg-card">
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
                                                className={getRowClassName(row.original)}
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
            </div>

            {/* CREATE DIALOG -> ONBOARDING WIZARD */}
            {isCreateDialogOpen && (
                <OnboardingWizard
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSubmit={handleCreateTenant}
                    sectors={MOCK_SECTORS}
                />
            )}

            {/* EDIT DIALOG */}
            {isEditDialogOpen && currentTenant && (
                <TenantEditDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    tenant={currentTenant as any}
                    onSave={handleUpdateTenant}
                />
            )}

            {/* VIEW DIALOG (DETAIL SHEET) */}
            {isViewDialogOpen && currentTenant && (
                <TenantDetailSheet
                    open={isViewDialogOpen}
                    onOpenChange={setIsViewDialogOpen}
                    tenant={currentTenant as any}
                />
            )}

            {/* USERS DIALOG */}
            {isUsersDialogOpen && currentTenant && (
                <TenantUsersDialog
                    open={isUsersDialogOpen}
                    onOpenChange={setIsUsersDialogOpen}
                    tenantId={currentTenant.id}
                    tenantName={currentTenant.name}
                />
            )}

            {/* CONTRACT DIALOGS */}
            {isRestrictionsDialogOpen && currentTenant && (
                <TenantRestrictionsDialog
                    open={isRestrictionsDialogOpen}
                    onOpenChange={setIsRestrictionsDialogOpen}
                    tenantName={currentTenant.name}
                />
            )}
            {isSuspendDialogOpen && currentTenant && (
                <SuspendTenantDialog
                    open={isSuspendDialogOpen}
                    onOpenChange={setIsSuspendDialogOpen}
                    tenantName={currentTenant.name}
                    onConfirm={() => handleSuspend(currentTenant)}
                />
            )}

            {isTerminateDialogOpen && currentTenant && (
                <TerminateContractDialog
                    open={isTerminateDialogOpen}
                    onOpenChange={setIsTerminateDialogOpen}
                    tenantName={currentTenant.name}
                    onConfirm={() => handleTerminate(currentTenant)}
                />
            )}
            {/* TENANT BILLING DIALOG */}
            {isBillingDialogOpen && currentTenant && (
                <TenantBillingDialog
                    open={isBillingDialogOpen}
                    onOpenChange={setIsBillingDialogOpen}
                />
            )}

            {/* TENANT MODULES DIALOG */}
            {isModulesDialogOpen && currentTenant && (
                <TenantModulesDialog
                    open={isModulesDialogOpen}
                    onOpenChange={setIsModulesDialogOpen}
                    onSave={(modules: Record<string, boolean>) => {
                        const countActiveModules = Object.values(modules).filter(Boolean).length;
                        toast.success(`Modul konfiqurasiyası yeniləndi. Aktiv modullar: ${countActiveModules}`);
                    }}
                />
            )}

            {/* EXPORT MODAL */}
            <ExportModal
                open={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
                isExporting={isExporting}
                currentCount={table.getRowModel().rows.length}
                totalCount={MOCK_TENANTS.length}
                entityName="tenant"
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Tenantı Sil"
                description={`${currentTenant?.name} tenantını silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`}
                onConfirm={() => currentTenant && handleDeleteClick(currentTenant)}
                variant="destructive"
                confirmText="Sil"
            />
        </div>
    )
}
