
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, FileWarning, KeyRound } from "lucide-react"

interface TerminateContractDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenantName: string
    onConfirm: (reason: string) => void
}

export function TerminateContractDialog({ open, onOpenChange, tenantName, onConfirm }: TerminateContractDialogProps) {
    const [reason, setReason] = useState("")

    const handleConfirm = () => {
        onConfirm(reason)
        setReason("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <FileWarning className="w-5 h-5" />
                        Müqaviləni Sonlandır
                    </DialogTitle>
                    <DialogDescription>
                        <strong>{tenantName}</strong> ilə müqaviləni sonlandırmaq istədiyinizə əminsiniz?
                        Bu əməliyyat geri qaytarıla bilməz və tenant "CANCELLED" statusuna keçəcək.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Sonlandırma Səbəbi *</Label>
                        <Textarea
                            id="reason"
                            placeholder="Məs: Ödəniş edilmədi, Qanun pozuntusu..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>İmtina</Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={reason.length < 5}
                    >
                        Müqaviləni Sonlandır
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface SuspendTenantDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenantName: string
    onConfirm: () => void
}

export function SuspendTenantDialog({ open, onOpenChange, tenantName, onConfirm }: SuspendTenantDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-5 h-5" />
                        Tenantı Dayandır
                    </DialogTitle>
                    <DialogDescription>
                        <strong>{tenantName}</strong> tenantını dayandırmaq istəyirsiniz?
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-sm text-amber-800 space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                        <KeyRound className="w-4 h-4" /> Nə baş verəcək?
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                        <li>Bütün aktiv sessiyalar sonlandırılacaq.</li>
                        <li>İstifadəçilər sistemə daxil ola bilməyəcək.</li>
                        <li>API açarları deaktiv ediləcək.</li>
                    </ul>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Ləğv Et</Button>
                    <Button
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => {
                            onConfirm()
                            onOpenChange(false)
                        }}
                    >
                        Təsdiqlə və Dayandır
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
