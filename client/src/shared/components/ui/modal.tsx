import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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
            <DialogContent className={className}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="grid gap-4 py-4 flex-1 min-h-0">{children}</div>
                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}
