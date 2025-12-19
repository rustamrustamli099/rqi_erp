import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Download, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

export type Invoice = {
    id: string
    number: string
    amountDue: number
    currency: string
    status: 'PAID' | 'OPEN' | 'VOID' | 'UNCOLLECTIBLE'
    dueDate: string
    createdAt: string
    tenant?: {
        name: string
    }
}

export const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: "number",
        header: "Faktura №",
        cell: ({ row }) => <span className="font-mono font-medium">{row.original.number}</span>
    },
    {
        accessorKey: "tenant.name",
        header: "Tenant",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.tenant?.name || "-"}</span>
    },
    {
        accessorKey: "amountDue",
        header: "Məbləğ",
        cell: ({ row }) => <span className="font-bold">{row.original.amountDue} {row.original.currency || 'AZN'}</span>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            const variant = status === 'PAID' ? 'default' :
                status === 'OPEN' ? 'secondary' : 'destructive'
            const className = status === 'PAID' ? 'bg-green-600' : ''

            return (
                <Badge variant={variant} className={className}>
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: "Tarix",
        cell: ({ row }) => {
            try {
                return format(new Date(row.original.createdAt), "yyyy-MM-dd")
            } catch (e) {
                return "-"
            }
        }
    },
    {
        id: "actions",
        header: "Əməliyyatlar",
        cell: ({ row }) => {
            const invoice = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.number)}>
                            Nömrəni kopyala
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" /> PDF Yüklə
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" /> E-poçt göndər
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            <span className="flex items-center"><span className="mr-2 h-4 w-4 flex items-center justify-center font-bold text-xs border border-red-600 rounded-full">X</span> Ləğv et (Void)</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
