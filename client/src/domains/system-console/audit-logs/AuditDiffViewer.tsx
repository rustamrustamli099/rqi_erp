import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AuditDiffViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: any;
}

export function AuditDiffViewer({ open, onOpenChange, record }: AuditDiffViewerProps) {
    if (!record) return null;

    const changes = record.changes || {
        "status": { from: "active", to: "inactive" },
        "role": { from: "user", to: "admin" },
        "permissions": { from: ["read"], to: ["read", "write", "delete"] }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Audit Log Detalları: #{record.id}</DialogTitle>
                    <DialogDescription>
                        {record.action} əməliyyatı üçün dəyişikliklər.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                        <div>Sahə (Field)</div>
                        <div>Dəyişiklik (Before &rarr; After)</div>
                    </div>

                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                            {Object.entries(changes).map(([field, diff]: [string, any]) => (
                                <div key={field} className="grid grid-cols-2 gap-4 text-sm items-start">
                                    <div className="font-mono text-xs bg-muted/50 p-2 rounded">{field}</div>
                                    <div className="flex flex-col gap-1">
                                        <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs line-through w-fit">
                                            {JSON.stringify(diff.from)}
                                        </div>
                                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs w-fit">
                                            {JSON.stringify(diff.to)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
