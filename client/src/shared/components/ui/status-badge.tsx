import { Badge } from "@/components/ui/badge"

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export function StatusBadge({ status }: { status: string }) {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";

    switch (status?.toLowerCase()) {
        case 'active':
        case 'approved':
        case 'published':
            variant = "default";
            break;
        case 'pending':
        case 'inactive':
        case 'draft':
            variant = "secondary";
            break;
        case 'rejected':
        case 'blocked':
        case 'deleted':
        case 'banned':
            variant = "destructive";
            break;
        default:
            variant = "outline";
    }

    return <Badge variant={variant} className="capitalize">{status}</Badge>
}
