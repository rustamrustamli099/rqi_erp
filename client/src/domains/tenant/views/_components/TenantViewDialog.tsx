import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Tenant } from "@/types/schema"
import { Badge } from "@/components/ui/badge"

interface TenantViewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenant: Tenant | null
}

export function TenantViewDialog({ open, onOpenChange, tenant }: TenantViewDialogProps) {
    if (!tenant) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{tenant.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                        <h4 className="font-semibold mb-1">Əlaqə</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>Email: {tenant.contactEmail}</p>
                            <p>Tel: {tenant.contactPhone}</p>
                            <p>Web: {tenant.website}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1">Müqavilə</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>Başlayır: {tenant.createdAt}</p>
                            <p>Bitir: {tenant.contractEndDate}</p>
                            <div className="flex items-center gap-1">Plan: <Badge variant="outline">{tenant.plan}</Badge></div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
