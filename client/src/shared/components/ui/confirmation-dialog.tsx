import { Badge } from "@/shared/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"

// --- Status Badge ---
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export function StatusBadge({ status }: { status: string }) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";

    switch (status?.toLowerCase()) {
        case 'active':
        case 'approved':
            variant = "default"; // green usually
            break;
        case 'pending':
        case 'inactive':
            variant = "secondary";
            break;
        case 'rejected':
        case 'blocked':
            variant = "destructive";
            break;
        default:
            variant = "outline";
    }

    return <Badge variant={variant}>{status}</Badge>
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    trigger
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
