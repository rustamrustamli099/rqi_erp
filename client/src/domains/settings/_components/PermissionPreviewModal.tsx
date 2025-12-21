
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import { PermissionPreviewSimulator } from "./PermissionPreviewSimulator"
import { Eye } from "lucide-react"

interface PermissionPreviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    permissions: string[]
    context?: 'admin' | 'tenant'
}

export function PermissionPreviewModal({ open, onOpenChange, permissions, context = 'admin' }: PermissionPreviewModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                <div className="bg-white rounded-lg shadow-xl border overflow-hidden flex flex-col h-[85vh]">
                    <DialogHeader className="p-6 pb-4 border-b bg-white shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-primary" />
                            İcazə Simulyatoru (Permission Preview)
                        </DialogTitle>
                        <DialogDescription>
                            Seçilmiş {permissions.length} icazə əsasında istifadəçinin görəcəyi menyu və səhifələrin simulyasiyası.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden bg-slate-50 p-6">
                        <PermissionPreviewSimulator
                            permissions={permissions}
                            context={context}
                            className="h-full bg-white border shadow-sm"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
