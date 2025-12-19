import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, FileText, Ban, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define the shape of our Subscription data
// TODO: Use shared type definition
export type Subscription = {
    id: string
    tenantId: string
    status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED' | 'TRIALING'
    startDate: string
    nextBillingDate: string
    tenant?: {
        name: string
    }
    package?: {
        name: string
        priceMonthly: number
        currency: string
    }
    items?: {
        name: string
        quantity: number
    }[]
}

const SubscriptionActionCell = ({ subscription }: { subscription: Subscription }) => {
    const [open, setOpen] = useState(false)

    const handleCancel = () => {
        // Here you would call the API to cancel
        toast.success(`Abunəlik ləğv edildi: ${subscription.tenant?.name}`)
        setOpen(false)
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(subscription.id)}
                    >
                        ID kopyala
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> Fakturalara bax
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" /> Planı Dəyiş
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-orange-600">
                        <Ban className="mr-2 h-4 w-4" /> Dayandır (Suspend)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setOpen(true)}
                    >
                        <Ban className="mr-2 h-4 w-4" /> Abunəliyi ləğv et
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Abunəliyi ləğv etmək istədiyinizə əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu əməliyyat geri qaytarıla bilməz. <b>{subscription.tenant?.name}</b> üçün xidmət dayandırılacaq.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İmtina</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                            Ləğv et
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export const columns: ColumnDef<Subscription>[] = [
    {
        accessorKey: "tenant.name",
        header: "Tenant",
        cell: ({ row }) => {
            const name = row.original.tenant?.name || "Naməlum"
            return <span className="font-medium">{name}</span>
        }
    },
    {
        accessorKey: "package.name",
        header: "Paket",
        cell: ({ row }) => {
            const pkgName = row.original.package?.name || "-"
            return (
                <Badge variant="outline" className="font-normal bg-primary/10 text-primary border-primary/20">
                    {pkgName}
                </Badge>
            )
        }
    },
    {
        accessorKey: "renewal",
        header: "Yenilənmə",
        cell: () => {
            // Mock data assumption - in real app would come from package/sub
            return (
                <div className="flex items-center gap-1">
                    <span className="text-sm">Auto-renew</span>
                </div>
            )
        }
    },
    {
        accessorKey: "items", // Virtual column for items
        header: "Əlavələr (Add-ons)",
        cell: ({ row }) => {
            // Mock logic - check if items exist
            const items = row.original.items || []
            if (items.length === 0) return <span className="text-muted-foreground">-</span>

            return (
                <div className="flex flex-col gap-1">
                    {items.map((item, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs w-fit">
                            {item.name} x{item.quantity}
                        </Badge>
                    ))}
                </div>
            )
        }
    },
    {
        accessorKey: "price",
        header: "Qiymət Detalları",
        cell: ({ row }) => {
            const pkg = row.original.package
            if (!pkg) return "-"

            return (
                <div className="flex flex-col text-sm">
                    <span className="font-semibold">{pkg.priceMonthly} {pkg.currency} <span className="text-muted-foreground font-normal">/ ay</span></span>
                    <span className="text-xs text-muted-foreground">+ Əlavələr</span>
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            const variant = status === 'ACTIVE' ? 'default' :
                status === 'SUSPENDED' ? 'destructive' : 'secondary'
            const className = status === 'ACTIVE' ? 'bg-green-600' : ''

            return (
                <Badge variant={variant} className={className}>
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "startDate",
        header: "Başlanğıc",
        cell: ({ row }) => {
            try {
                return format(new Date(row.original.startDate), "yyyy-MM-dd")
            } catch (e) {
                return "-"
            }
        }
    },
    {
        accessorKey: "nextBillingDate",
        header: "Növbəti Ödəniş",
        cell: ({ row }) => {
            try {
                return format(new Date(row.original.nextBillingDate), "yyyy-MM-dd")
            } catch (e) {
                return "-"
            }
        }
    },
    {
        id: "actions",
        header: "Əməliyyatlar",
        cell: ({ row }) => <SubscriptionActionCell subscription={row.original} />
    },
]
