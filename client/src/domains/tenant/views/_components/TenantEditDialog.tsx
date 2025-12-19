import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Tenant } from "@/types/schema"
import { useEffect, useState } from "react"

interface TenantEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenant: Tenant | null
    onSave: (tenant: Tenant) => void
}

export function TenantEditDialog({ open, onOpenChange, tenant, onSave }: TenantEditDialogProps) {
    const [formData, setFormData] = useState<Partial<Tenant>>({})

    useEffect(() => {
        if (tenant) {
            setFormData(tenant)
        }
    }, [tenant])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (tenant && formData) {
            onSave({ ...tenant, ...formData } as Tenant)
        }
    }

    if (!tenant) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tenanta Düzəliş Et: {tenant.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Şirkət Adı</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>VÖEN</Label>
                        <Input
                            value={formData.tin || ''}
                            onChange={e => setFormData({ ...formData, tin: e.target.value })}
                        />
                    </div>
                    {/* Add more fields as needed */}
                    <DialogFooter>
                        <Button type="submit">Yadda Saxla</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
