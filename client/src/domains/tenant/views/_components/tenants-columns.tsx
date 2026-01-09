import type { ColumnDef } from "@tanstack/react-table"
import type { Tenant } from "../../api/tenant.contract"

import {
    MoreHorizontal,
    CheckCircle2,
    XCircle,

    AlertCircle,
    ShieldAlert,
    Building,
    Eye,
    Users,
    Key,
    Lock,
    LogIn,
    Settings,
    Database,
    CreditCard,
    Activity,
    FileSignature,
    FileX,
    Ban
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ApprovalStatus } from "@/components/ui/status-badge"
import { MOCK_SECTORS, MOCK_PLANS } from "@/shared/constants/reference-data"
// PHASE 14G: Import canonical keys
import { ACTION_KEYS, type ActionsMap } from "@/app/navigation/action-keys"



// Handler Interfaces
interface TenantsActionsProps {
    row: Tenant

    onView: (t: Tenant) => void
    onEdit: (t: Tenant) => void
    onUsers: (t: Tenant) => void
    onLoginAs: (t: Tenant) => void
    onModules: (t: Tenant) => void
    onBilling: (t: Tenant) => void
    onRestrictions: (t: Tenant) => void
    onSignContract: (t: Tenant) => void
    onTerminate: (t: Tenant) => void
    onSuspend: (t: Tenant) => void
    onDelete: (t: Tenant) => void
    on2FAToggle: (t: Tenant) => void
    onResetPassword: (t: Tenant) => void
    onAuditLogs: (t: Tenant) => void
    onResourceLimits: (t: Tenant) => void
}

const ActionCell = ({
    row,
    actions,
    onView, onEdit, onUsers, onLoginAs, onModules,
    onBilling, onRestrictions, onSignContract, onTerminate, onSuspend, onDelete,
    on2FAToggle, onResetPassword, onAuditLogs, onResourceLimits
}: TenantsActionsProps & { actions: ActionsMap }) => {
    const isPending = row.status === 'PENDING'
    const isCancelled = row.status === 'CANCELLED'
    const isActive = row.status === 'ACTIVE'

    // Group Visibility Flags (SAP-GRADE UI)
    const hasIdentity = actions[ACTION_KEYS.TENANTS_MANAGE_USERS] || actions[ACTION_KEYS.TENANTS_MANAGE_SECURITY] || actions[ACTION_KEYS.TENANTS_IMPERSONATE];
    const hasOps = actions[ACTION_KEYS.TENANTS_MANAGE_FEATURES] || actions[ACTION_KEYS.TENANTS_MANAGE_BILLING] || actions[ACTION_KEYS.TENANTS_VIEW_AUDIT];
    const hasRestrictions = actions[ACTION_KEYS.TENANTS_MANAGE_RESTRICTIONS];
    const hasLegal = actions[ACTION_KEYS.TENANTS_MANAGE_CONTRACT];
    const hasDestructive = actions[ACTION_KEYS.TENANTS_DELETE];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">

                {/* GROUP 1: General (Always View) */}
                <DropdownMenuItem onClick={() => onView(row)}>
                    <Eye className="mr-2 h-4 w-4" /> Baxış
                </DropdownMenuItem>

                {actions[ACTION_KEYS.TENANTS_UPDATE] && (
                    <DropdownMenuItem onClick={() => onEdit(row)} disabled={isPending}>
                        <Building className="mr-2 h-4 w-4" /> Düzəliş
                    </DropdownMenuItem>
                )}

                {/* GROUP 2: Identity & Security */}
                {hasIdentity && (
                    <>
                        <DropdownMenuSeparator />
                        {actions[ACTION_KEYS.TENANTS_MANAGE_USERS] && (
                            <DropdownMenuItem onClick={() => onUsers(row)} disabled={isPending}>
                                <Users className="mr-2 h-4 w-4" /> İstifadəçilər
                            </DropdownMenuItem>
                        )}
                        {actions[ACTION_KEYS.TENANTS_MANAGE_SECURITY] && (
                            <>
                                <DropdownMenuItem onClick={() => onResetPassword(row)} disabled={isPending}>
                                    <Key className="mr-2 h-4 w-4" /> Şifrəni Sıfırla
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => on2FAToggle(row)} disabled={isPending}>
                                    <Lock className="mr-2 h-4 w-4" /> 2FA Tətbiq/Ləğv Et
                                </DropdownMenuItem>
                            </>
                        )}
                        {actions[ACTION_KEYS.TENANTS_IMPERSONATE] && (
                            <DropdownMenuItem onClick={() => onLoginAs(row)} disabled={isPending}>
                                <LogIn className="mr-2 h-4 w-4 text-blue-600" /> <span className={isPending ? "" : "text-blue-600"}>Admin Kimi Daxil Ol</span>
                            </DropdownMenuItem>
                        )}
                    </>
                )}

                {/* GROUP 3: Operations (Features, Billing, Audit) */}
                {hasOps && (
                    <>
                        <DropdownMenuSeparator />
                        {actions[ACTION_KEYS.TENANTS_MANAGE_FEATURES] && (
                            <>
                                <DropdownMenuItem onClick={() => onModules(row)}>
                                    <Settings className="mr-2 h-4 w-4" /> Modullar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onResourceLimits(row)}>
                                    <Database className="mr-2 h-4 w-4" /> Resurs Limitləri
                                </DropdownMenuItem>
                            </>
                        )}
                        {actions[ACTION_KEYS.TENANTS_MANAGE_BILLING] && (
                            <DropdownMenuItem onClick={() => onBilling(row)}>
                                <CreditCard className="mr-2 h-4 w-4" /> Ödəniş Tarixçəsi
                            </DropdownMenuItem>
                        )}
                        {actions[ACTION_KEYS.TENANTS_VIEW_AUDIT] && (
                            <DropdownMenuItem onClick={() => onAuditLogs(row)}>
                                <Activity className="mr-2 h-4 w-4" /> Audit Loglar
                            </DropdownMenuItem>
                        )}
                    </>
                )}

                {/* GROUP 4: Restrictions (Separate Permission) */}
                {hasRestrictions && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onRestrictions(row)}>
                            <ShieldAlert className="mr-2 h-4 w-4" /> Məhdudiyyətlər
                        </DropdownMenuItem>
                    </>
                )}

                {/* GROUP 5: Legal & Contract */}
                {hasLegal && (
                    <>
                        <DropdownMenuSeparator />
                        {(isCancelled) ? (
                            <DropdownMenuItem onClick={() => onSignContract(row)} className="text-green-600" disabled={isPending}>
                                <FileSignature className="mr-2 h-4 w-4" /> Müqavilə Bağla
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => onTerminate(row)} className="text-orange-600" disabled={isPending}>
                                <FileX className="mr-2 h-4 w-4" /> Müqaviləni Sonlandır
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onSuspend(row)} disabled={isPending}>
                            <Ban className="mr-2 h-4 w-4" /> {isActive ? 'Dayandır' : 'Aktivləşdir'}
                        </DropdownMenuItem>
                    </>
                )}

                {/* GROUP 5: Destructive */}
                {hasDestructive && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-500 hover:text-red-600"
                            onClick={() => onDelete(row)}
                            disabled={isPending}
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Sil
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Define props for creating columns to pass handlers
interface CreateColumnsProps {
    prepareView: (t: Tenant) => void
    prepareEdit: (t: Tenant) => void
    prepareUsers: (t: Tenant) => void
    handleLoginAsAdmin: (t: Tenant) => void
    handleModulesClick: (t: Tenant) => void
    handleBillingClick: (t: Tenant) => void
    handleSignContract: (t: Tenant) => void
    confirmTerminate: (t: Tenant) => void
    confirmSuspend: (t: Tenant) => void
    deleteTenant: (t: Tenant) => void
    // New Handlers
    handle2FAToggle: (t: Tenant) => void
    handleResetPassword: (t: Tenant) => void
    handleAuditLogs: (t: Tenant) => void
    handleResourceLimits: (t: Tenant) => void
    prepareRestrictions: (t: Tenant) => void
}

export const createColumns = ({
    prepareView,
    prepareEdit,
    prepareUsers,
    handleLoginAsAdmin,
    handleModulesClick,
    handleBillingClick,
    handleSignContract,
    confirmTerminate,
    confirmSuspend,
    deleteTenant,
    handle2FAToggle,
    handleResetPassword,
    handleAuditLogs,
    handleResourceLimits,
    prepareRestrictions
}: CreateColumnsProps, actions: ActionsMap): ColumnDef<Tenant>[] => [
        {
            accessorKey: "name",
            header: "Şirkət Adı",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{row.getValue("name")}</span>
                        {(row.original.status as string) === 'PENDING' && (
                            <ShieldAlert className="h-3.5 w-3.5 text-orange-500/70" />
                        )}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "subdomain",
            header: "Subdomain",
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono bg-muted/50">
                    {row.getValue("subdomain")}.rqi-erp.com
                </Badge>
            )
        },
        {
            id: "contract",
            header: "Müqavilə",
            cell: () => <span className="text-muted-foreground text-xs">Müqavilə Yoxdur</span>
        },
        {
            id: "timeLeft",
            header: "Qalıq Müddət",
            cell: () => "-"
        },
        {
            accessorKey: "plan",
            header: "Plan",
            cell: ({ row }) => {
                const plan = MOCK_PLANS.find(p => p.id === row.getValue("plan"))
                return plan ? <Badge variant="secondary">{plan.name}</Badge> : row.getValue("plan")
            }
        },
        {
            accessorKey: "sectorId",
            header: "Sektor",
            cell: ({ row }) => {
                const sector = MOCK_SECTORS.find(s => s.id === row.getValue("sectorId"))
                return sector ? sector.name : row.getValue("sectorId")
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as ApprovalStatus
                return (
                    <div className="flex items-center">
                        <StatusBadge status={status} />
                        {(status as string) === 'PENDING' && (
                            <AlertCircle className="ml-2 h-4 w-4 text-yellow-500 cursor-help" />
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
            cell: ({ row }) => (
                <ActionCell
                    row={row.original}
                    actions={actions}
                    onView={prepareView}
                    onEdit={prepareEdit}
                    onUsers={prepareUsers}
                    onLoginAs={handleLoginAsAdmin}
                    onModules={handleModulesClick}
                    onBilling={handleBillingClick}
                    onRestrictions={prepareRestrictions}
                    onSignContract={handleSignContract}
                    onTerminate={confirmTerminate}
                    onSuspend={confirmSuspend}
                    onDelete={deleteTenant}
                    on2FAToggle={handle2FAToggle}
                    onResetPassword={handleResetPassword}
                    onAuditLogs={handleAuditLogs}
                    onResourceLimits={handleResourceLimits}
                />
            )
        },
    ]
