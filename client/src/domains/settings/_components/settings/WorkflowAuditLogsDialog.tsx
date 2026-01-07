import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { workflowService } from "@/domains/settings/_services/workflow.service";
import { Loader2 } from "lucide-react";

interface WorkflowAuditLogsDialogProps {
    requestId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WorkflowAuditLogsDialog({ requestId, open, onOpenChange }: WorkflowAuditLogsDialogProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['workflow', 'details', requestId],
        queryFn: () => requestId ? workflowService.getRequestDetails(requestId) : null,
        enabled: !!requestId && open
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Audit Tarixçəsi</DialogTitle>
                    <DialogDescription>
                        Workflow prosesinin detallı audit qeydləri
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !data ? (
                        <div className="text-center p-8 text-muted-foreground">Məlumat tapılmadı</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Request ID:</span>
                                    <span className="font-mono">{data.id}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Obyekt:</span>
                                    <span>{data.entityType} / {data.entityId}</span>
                                </div>
                            </div>

                            <div className="border rounded-md max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tarix</TableHead>
                                            <TableHead>İstifadəçi</TableHead>
                                            <TableHead>Əməliyyat</TableHead>
                                            <TableHead>Detallar</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Combine Decisisons and Audit Trail if separate, or just use Audit Trail if it covers everything */}
                                        {/* Assuming auditTrail contains all system events + user actions */}
                                        {data.auditTrail && data.auditTrail.length > 0 ? (
                                            data.auditTrail.map((log: any) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>{log.actorName || log.actorId || 'System'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{log.action}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs break-all">
                                                        {JSON.stringify(log.details || {})}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center p-4 text-muted-foreground">Audit qeydi yoxdur</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
