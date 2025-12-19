import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpRight, AlertCircle, CheckCircle2, User } from "lucide-react"

// Audit Log Type Definition
type AuditLog = {
    id: string
    transactionId: string
    action: string
    module: string
    user: string
    details: string
    status: 'SUCCESS' | 'FAILURE' | 'WARNING'
    timestamp: string
    ip: string
}

// Mock Data simulating SAP-style transaction logs
const auditData: AuditLog[] = [
    {
        id: "log_1",
        transactionId: "TXN-8832",
        action: "Payment Method Update",
        module: "Billing",
        user: "Admin (Ali V.)",
        details: "Stripe configuration updated (API Key)",
        status: "SUCCESS",
        timestamp: "2024-12-12T14:30:00",
        ip: "192.168.1.15"
    },
    {
        id: "log_2",
        transactionId: "TXN-8833",
        action: "Subscription Cancel",
        module: "Subscriptions",
        user: "System",
        details: "Tenant 'Global Corp' subscription auto-cancelled due to non-payment",
        status: "FAILURE",
        timestamp: "2024-12-12T10:15:00",
        ip: "System"
    },
    {
        id: "log_3",
        transactionId: "TXN-8834",
        action: "Invoice Created",
        module: "Invoicing",
        user: "System",
        details: "Monthly invoice #INV-2024-001 generated for 'Tech Solutions'",
        status: "SUCCESS",
        timestamp: "2024-12-11T09:00:00",
        ip: "System"
    },
    {
        id: "log_4",
        transactionId: "TXN-8835",
        action: "Plan Modification",
        module: "Packages",
        user: "Admin (Ali V.)",
        details: "Enterprise Plan price changed: $199 -> $249",
        status: "WARNING",
        timestamp: "2024-12-10T16:45:00",
        ip: "192.168.1.15"
    },
    {
        id: "log_5",
        transactionId: "TXN-8836",
        action: "Manual Refund",
        module: "Billing",
        user: "Support (Leyla M.)",
        details: "Refund issued for TXN-8820 ($50.00)",
        status: "SUCCESS",
        timestamp: "2024-12-09T11:20:00",
        ip: "192.168.1.20"
    }
]

export const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: "transactionId",
        header: "T-Code / ID",
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.transactionId}</span>
    },
    {
        accessorKey: "timestamp",
        header: "Vaxt",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{format(new Date(row.original.timestamp), "dd.MM.yyyy HH:mm")}</span>
    },
    {
        accessorKey: "user",
        header: "İstifadəçi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">{row.original.user}</span>
            </div>
        )
    },
    {
        accessorKey: "module",
        header: "Modul",
        cell: ({ row }) => <Badge variant="outline" className="text-xs">{row.original.module}</Badge>
    },
    {
        accessorKey: "action",
        header: "Əməliyyat",
        cell: ({ row }) => <span className="font-medium">{row.original.action}</span>
    },
    {
        accessorKey: "details",
        header: "Detallar",
        cell: ({ row }) => <span className="text-sm text-muted-foreground truncate max-w-[300px] block" title={row.original.details}>{row.original.details}</span>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <div className="flex items-center gap-1">
                    {status === 'SUCCESS' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {status === 'FAILURE' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {status === 'WARNING' && <ArrowUpRight className="h-4 w-4 text-orange-500" />}
                    <span className={`text-xs font-medium ${status === 'SUCCESS' ? 'text-green-600' : status === 'FAILURE' ? 'text-red-600' : 'text-orange-600'}`}>
                        {status}
                    </span>
                </div>
            )
        }
    }
]

export function PaymentLogsTab() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Audit və Əməliyyat Jurnalı</CardTitle>
                <CardDescription>Sistemdə baş verən bütün maliyyə və konfiqurasiya əməliyyatlarının tam siyahısı (SAP-style Audit Trail).</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={auditData}
                    searchKey="action" // allowing search by operation name
                    filterPlaceholder="Əməliyyat axtar..."
                />
            </CardContent>
        </Card>
    )
}
