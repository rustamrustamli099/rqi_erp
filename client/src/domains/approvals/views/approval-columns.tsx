
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, ArrowRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ApprovalRequest } from "../constants/workflows"

// IMPORTANT: We need to ensure ApprovalRequest type is imported correctly.
// It seems "workflows" constants file might also be missing or moved.
// Let's assume a basic shape or use 'any' if types are fuzzy, but better to be typed.

/* 
  If `ApprovalRequest` is not available, we can define a local interface matches the mock data in ApprovalsPage.
*/

export const createColumns = ({
    onApprove,
    onReject,
    onForward,
    permissions
}: {
    onApprove: (request: ApprovalRequest) => void
    onReject: (request: ApprovalRequest) => void
    onForward: (request: ApprovalRequest) => void
    permissions: {
        canApprove: boolean
        canReject: boolean
        canForward: boolean
    }
}): ColumnDef<ApprovalRequest>[] => [
        {
            accessorKey: "id",
            header: "Sorğu ID",
            cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
        },
        {
            accessorKey: "requesterName",
            header: "Göndərən",
        },
        {
            accessorKey: "eventId",
            header: "Tip",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("eventId")}</Badge>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={status === 'APPROVED' ? 'default' : status === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Tarix",
            cell: ({ row }) => <div className="text-xs text-muted-foreground">{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>,
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const request = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {permissions.canApprove && (
                                <DropdownMenuItem onClick={() => onApprove(request)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Təsdiqlə
                                </DropdownMenuItem>
                            )}
                            {permissions.canReject && (
                                <DropdownMenuItem onClick={() => onReject(request)}>
                                    <XCircle className="mr-2 h-4 w-4" /> İmtina
                                </DropdownMenuItem>
                            )}
                            {permissions.canForward && (
                                <DropdownMenuItem onClick={() => onForward(request)}>
                                    <ArrowRight className="mr-2 h-4 w-4" /> Yönləndir
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
