import { useState, useMemo, useCallback } from "react"
import { PageHeader } from "@/shared/components/ui/page-header"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Inbox,
    History,
    Archive,
    CheckCircle2,
    ShieldCheck,
    Smartphone,
    Mail,
    XCircle
} from "lucide-react"


import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Label } from "@/shared/components/ui/label"
import type { ApprovalRequest } from "../constants/workflows"
import { DataTable } from "@/shared/components/ui/data-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table"
import { flexRender } from "@tanstack/react-table"
import { createColumns } from "./approval-columns";
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar"
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination"
import {
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from "@tanstack/react-table"
import type { SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table"
// PHASE 100% PFCG: Backend Decision Center
import { usePageState } from "@/app/security/usePageState"

// Extended Mock Data with Priority and Security Settings
// Define MockRequest type locally for reuse
type MockRequest = ApprovalRequest & {
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    securityRequired?: '2FA' | 'SMS' | 'EMAIL' | 'NONE'
}

const MOCK_REQUESTS: MockRequest[] = [
    {
        id: "REQ-2024-001",
        eventId: "TENANT_CREATE",
        workflowId: "wf-tenant-simple",
        requesterId: "u-1",
        requesterName: "Elvin Məmmədov",
        status: "PENDING",
        currentStepIndex: 0,
        createdAt: new Date().toISOString(),
        history: [],
        priority: "HIGH",
        securityRequired: "NONE", // Default
        payload: {
            name: "Mega Sənaye MMC",
            tin: "1234567890",
            contactEmail: "info@mega.az",
            plan: "Enterprise"
        }
    },
    {
        id: "REQ-2024-002",
        eventId: "INVOICE_APPROVE",
        workflowId: "wf-invoice-basic",
        requesterId: "u-2",
        requesterName: "Aygün Səlimova",
        status: "PENDING",
        currentStepIndex: 0,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        history: [],
        priority: "MEDIUM",
        securityRequired: "2FA", // Example of security requirement
        payload: {
            invoiceId: "INV-2024-001",
            amount: 5000,
            currency: "AZN",
            vendor: "Office Supply Ltd"
        }
    },
    {
        id: "REQ-2024-003",
        eventId: "CONTRACT_SIGN",
        workflowId: "wf-contract",
        requesterId: "u-3",
        requesterName: "Samir Kərimov",
        status: "APPROVED",
        currentStepIndex: 1,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        history: [],
        priority: "LOW",
        securityRequired: "NONE",
        payload: {
            contractId: "CTR-999"
        }
    }
]

export default function ApprovalsPage() {
    // PHASE 100% PFCG: Backend-driven action visibility
    const { actions } = usePageState('Z_APPROVALS');
    const canApprove = actions?.GS_APPROVALS_APPROVE ?? false;
    const canReject = actions?.GS_APPROVALS_REJECT ?? false;
    const canBulkApprove = actions?.GS_APPROVALS_BULK_APPROVE ?? false;
    const canBulkReject = actions?.GS_APPROVALS_BULK_REJECT ?? false;
    const canForward = actions?.GS_APPROVALS_FORWARD ?? false;

    const [activeTab, setActiveTab] = useState("inbox")
    const [requests, setRequests] = useState<MockRequest[]>(MOCK_REQUESTS)

    // Table State
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    // Dialog State
    const [isSecurityCheckOpen, setIsSecurityCheckOpen] = useState(false)
    const [pendingRequest, setPendingRequest] = useState<MockRequest | null>(null)
    const [securityCode, setSecurityCode] = useState("")

    const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false)
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
    const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'BULK_APPROVE' | 'BULK_REJECT' | null>(null)
    const [confirmationComment, setConfirmationComment] = useState("")

    // Sidebar Items (Operational Only)
    const sidebarItems = [
        { id: "inbox", label: "Gözləyən (Inbox)", icon: Inbox, count: requests.filter(r => r.status === 'PENDING').length },
        { id: "history", label: "Tarixçə", icon: History, count: requests.filter(r => r.status !== 'PENDING').length },
        { id: "archive", label: "Arxiv", icon: Archive },
    ]

    // Action Handlers
    const handleApproveClick = useCallback((request: MockRequest) => { // Updated type
        setPendingRequest(request)
        setActionType('APPROVE')
        setConfirmationComment("")
        setIsConfirmationOpen(true)
    }, [])

    const handleRejectClick = useCallback((request: MockRequest) => { // Updated type
        setPendingRequest(request)
        setActionType('REJECT')
        setConfirmationComment("")
        setIsConfirmationOpen(true)
    }, [])

    const handleBulkApprove = () => {
        const selectedIds = Object.keys(rowSelection)
        if (selectedIds.length === 0) return
        setActionType('BULK_APPROVE')
        setConfirmationComment("")
        setIsConfirmationOpen(true)
    }

    const handleBulkReject = () => {
        const selectedIds = Object.keys(rowSelection)
        if (selectedIds.length === 0) return
        setActionType('BULK_REJECT')
        setConfirmationComment("")
        setIsConfirmationOpen(true)
    }

    const handleProceedWithAction = () => {
        if (!actionType) return

        setIsConfirmationOpen(false)

        if (actionType === 'APPROVE') {
            // Check Security
            if (pendingRequest?.securityRequired && pendingRequest.securityRequired !== 'NONE') {
                setIsSecurityCheckOpen(true)
                setSecurityCode("")
                return
            }
            if (pendingRequest) {
                updateRequestStatus(pendingRequest.id, 'APPROVED')
                toast.success(`Sorğu #${pendingRequest.id} təsdiqləndi.`, { description: confirmationComment })
            }
        } else if (actionType === 'REJECT') {
            if (pendingRequest) {
                updateRequestStatus(pendingRequest.id, 'REJECTED')
                toast.info(`Sorğu #${pendingRequest.id} imtina edildi.`, { description: confirmationComment })
            }
        } else if (actionType === 'BULK_APPROVE') {
            // Mock Bulk Action
            const selectedIds = Object.keys(rowSelection).map(idx => filteredData[parseInt(idx)]?.id).filter(Boolean)
            setRequests(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status: 'APPROVED' } : r))
            setRowSelection({})
            toast.success(`${selectedIds.length} sorğu təsdiqləndi.`, { description: confirmationComment })
        } else if (actionType === 'BULK_REJECT') {
            const selectedIds = Object.keys(rowSelection).map(idx => filteredData[parseInt(idx)]?.id).filter(Boolean)
            setRequests(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status: 'REJECTED' } : r))
            setRowSelection({})
            toast.info(`${selectedIds.length} sorğu imtina edildi.`, { description: confirmationComment })
        }

        setPendingRequest(null)
    }

    const handleSecurityVerify = () => {
        if (securityCode === "123456") { // Mock check
            if (pendingRequest) {
                updateRequestStatus(pendingRequest.id, 'APPROVED')
                toast.success(`Sorğu #${pendingRequest.id} təhlükəsizlik təsdiqi ilə icra edildi.`, {
                    description: confirmationComment ? `Rəy: ${confirmationComment}` : undefined
                })
            }
            setIsSecurityCheckOpen(false)
            setPendingRequest(null)
        } else {
            toast.error("Yanlış təhlükəsizlik kodu!")
        }
    }

    const handleForwardClick = useCallback((request: MockRequest) => { // Updated type
        setPendingRequest(request)
        setIsForwardDialogOpen(true)
    }, [])

    const updateRequestStatus = (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    }

    // Filter Data based on Tab


    const filteredData = useMemo(() => {
        if (activeTab === 'inbox') return requests.filter(r => r.status === 'PENDING')
        if (activeTab === 'history') return requests.filter(r => r.status !== 'PENDING')
        return [] // Archive mock empty
    }, [requests, activeTab])

    const columns = useMemo(() => createColumns({
        onApprove: (r) => handleApproveClick(r as MockRequest),
        onReject: (r) => handleRejectClick(r as MockRequest),
        onForward: (r) => handleForwardClick(r as MockRequest)
    }), [handleApproveClick, handleRejectClick, handleForwardClick])

    const table = useReactTable({
        data: filteredData,
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
    })

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <div className="px-8 pt-6">
                <PageHeader heading="Təsdiqləmələr" />
            </div>

            <div className="flex flex-1 p-8 pt-4 gap-6">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 space-y-2">
                    {sidebarItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeTab === item.id ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start",
                                activeTab === item.id && "bg-muted font-medium"
                            )}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                            {item.count !== undefined && item.count > 0 && (
                                <span className="ml-auto bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs">
                                    {item.count}
                                </span>
                            )}
                        </Button>
                    ))}
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            {/* Operational Views Only */}
                            <>
                                <DataTable
                                    columns={columns}
                                    data={filteredData}
                                    searchKey="id"
                                    onRowSelectionChange={setRowSelection}
                                    rowSelection={rowSelection}
                                    toolbarContent={(table) => (
                                        <>
                                            {Object.keys(rowSelection).length > 0 && (
                                                <div className="flex items-center gap-2 ml-4 animate-in fade-in slide-in-from-left-2">
                                                    {canBulkApprove && (
                                                        <Button size="sm" onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700 text-white">
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            Seçilənləri Təsdiqlə ({Object.keys(rowSelection).length})
                                                        </Button>
                                                    )}
                                                    {canBulkReject && (
                                                        <Button size="sm" variant="destructive" onClick={handleBulkReject}>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            İmtina
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                />
                            </>

                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog with Comment */}
            <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType?.includes('APPROVE') ? 'Təsdiqləməni Tamamla' : 'İmtina Et'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'BULK_APPROVE' && `Seçilmiş ${Object.keys(rowSelection).length} sorğunu təsdiqləmək istəyirsiniz?`}
                            {actionType === 'BULK_REJECT' && `Seçilmiş ${Object.keys(rowSelection).length} sorğudan imtina etmək istəyirsiniz?`}
                            {actionType === 'APPROVE' && 'Bu əməliyyatı təsdiqləmək istədiyinizə əminsiniz? Şərh yaza bilərsiniz.'}
                            {actionType === 'REJECT' && 'Bu əməliyyatdan imtina səbəbini qeyd edin.'}
                        </DialogDescription>
                    </DialogHeader>

                    {pendingRequest && !actionType?.includes('BULK') && (
                        <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sorğu ID:</span>
                                <span className="font-mono">{pendingRequest.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tip:</span>
                                <span className="font-medium">{pendingRequest.eventId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Göndərən:</span>
                                <span>{pendingRequest.requesterName}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 py-2">
                        <Label>Şərh / Qeyd {actionType?.includes('REJECT') && <span className="text-red-500">*</span>}</Label>
                        <Textarea
                            placeholder={actionType?.includes('APPROVE') ? "Təsdiq üçün şərfiniz (opsional)..." : "İmtina səbəbini yazın..."}
                            value={confirmationComment}
                            onChange={(e) => setConfirmationComment(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmationOpen(false)}>Ləğv et</Button>
                        <Button
                            variant={actionType?.includes('REJECT') ? "destructive" : "default"}
                            onClick={handleProceedWithAction}
                            disabled={actionType?.includes('REJECT') && !confirmationComment.trim()}
                        >
                            {actionType?.includes('APPROVE') ? 'Təsdiqlə' : 'İmtina Et'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Security Verification Dialog */}
            <Dialog open={isSecurityCheckOpen} onOpenChange={setIsSecurityCheckOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            Təhlükəsizlik Təsdiqi Tələb Olunur
                        </DialogTitle>
                        <DialogDescription>
                            Bu əməliyyatı tamamlamaq üçün {pendingRequest?.securityRequired} təsdiq kodu tələb olunur.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg">
                            {pendingRequest?.securityRequired === '2FA' ? (
                                <Smartphone className="h-12 w-12 text-muted-foreground opacity-50" />
                            ) : (
                                <Mail className="h-12 w-12 text-muted-foreground opacity-50" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Təsdiq Kodu</Label>
                            <Input
                                placeholder="123456"
                                className="text-center text-lg tracking-widest font-mono"
                                value={securityCode}
                                onChange={(e) => setSecurityCode(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground text-center">Demo Kodu: 123456</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSecurityCheckOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleSecurityVerify}>Təsdiqlə</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Forward Dialog (Mock) */}
            <Dialog open={isForwardDialogOpen} onOpenChange={setIsForwardDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sorğunu Yönləndir</DialogTitle>
                        <DialogDescription>
                            Bu sorğunu başqa bir icraçıya təyin edin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>İcraçı Seçin</Label>
                            <Input placeholder="Ad və ya E-poçt axtar..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Qeyd</Label>
                            <Input placeholder="Yönləndirmə səbəbi..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsForwardDialogOpen(false)}>Ləğv et</Button>
                        <Button onClick={() => {
                            toast.success("Sorğu uğurla yönləndirildi.")
                            setIsForwardDialogOpen(false)
                        }}>
                            Yönləndir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

