import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    templateName: string
}

export function TemplatePreviewDialog({ open, onOpenChange, templateName }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Preview: {templateName}</DialogTitle>
                    <DialogDescription>
                        Preview of the document template.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 bg-muted rounded-md flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Preview not available</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
