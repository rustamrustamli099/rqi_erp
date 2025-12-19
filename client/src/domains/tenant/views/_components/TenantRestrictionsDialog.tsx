import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { RestrictionsForm, type RestrictionData, DEFAULT_SCHEDULE } from "@/components/ui/restrictions-form"

interface TenantRestrictionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenantName: string
}

export function TenantRestrictionsDialog({ open, onOpenChange, tenantName }: TenantRestrictionsDialogProps) {
    const [data, setData] = useState<RestrictionData>({
        enabled: true,
        ipRestriction: "",
        schedule: {
            active: true,
            days: DEFAULT_SCHEDULE
        }
    })

    // Reset when opening
    useEffect(() => {
        if (open) {
            setData({
                enabled: true,
                ipRestriction: "",
                schedule: {
                    active: true,
                    days: DEFAULT_SCHEDULE
                }
            })
        }
    }, [open])

    const handleSave = () => {
        // Here you would convert 'data' to your backend format
        // console.log("Saving Tenant restrictions:", data)
        toast.success("Məhdudiyyətlər yeniləndi")
        onOpenChange(false)
    }

    return (
        <Modal
            title={`Məhdudiyyətlər: ${tenantName}`}
            description="Tenant üçün qlobal giriş məhdudiyyətləri (İş saatları və IP)."
            isOpen={open}
            onClose={() => onOpenChange(false)}
        >
            <div className="py-2">
                <RestrictionsForm
                    value={data}
                    onChange={setData}
                />
            </div>

            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Ləğv Et</Button>
                <Button onClick={handleSave}>Yadda Saxla</Button>
            </DialogFooter>
        </Modal>
    )
}
