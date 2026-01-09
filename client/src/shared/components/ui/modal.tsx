import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ModalProps {
    title: string
    description?: string
    children: React.ReactNode
    isOpen: boolean
    onClose: () => void
    footer?: React.ReactNode
    className?: string
}

export function Modal({
    title,
    description,
    isOpen,
    onClose,
    children,
    footer,
    className
}: ModalProps) {
    const onChange = (open: boolean) => {
        if (!open) {
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onChange}>
            <DialogContent className={cn("max-h-[90vh] flex flex-col", className)}>
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="flex-1 overflow-y-auto min-h-0 py-4 px-1 -mx-1">{children}</div>
                {footer && <DialogFooter className="flex-shrink-0">{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}
