import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    templateName: string
}

export function TemplateVersionHistoryDialog({ open, onOpenChange, templateName }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Version History: {templateName}</DialogTitle>
                    <DialogDescription>
                        View previous versions of this template.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-4 text-sm text-muted-foreground">
                    No history available.
                </div>
            </DialogContent>
        </Dialog>
    )
}
