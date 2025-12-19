import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AuditLog } from "./audit-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Clock, User, Globe, Code, FileText, SplitSquareHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AuditDiffViewer } from "./AuditDiffViewer";

interface AuditLogDetailsProps {
    log: AuditLog | null;
    open: boolean;
    onClose: () => void;
}

export function AuditLogDetails({ log, open, onClose }: AuditLogDetailsProps) {
    const [isDiffOpen, setIsDiffOpen] = useState(false);

    if (!log) return null;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} kopyalandı`);
    };

    // Synthesize Before/After for Mock Demo
    // In real app, these come from backend.
    const mockBefore = log.details.changes ? log.details.changes.reduce((acc, curr) => ({ ...acc, [curr.field]: curr.old }), {}) : {};
    const mockAfter = log.details.changes ? log.details.changes.reduce((acc, curr) => ({ ...acc, [curr.field]: curr.new }), {}) : {};

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent className="sm:max-w-xl w-[600px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={log.severity === "CRITICAL" ? "destructive" : log.severity === "WARNING" ? "default" : "secondary"}>
                                {log.severity}
                            </Badge>
                            <Badge variant="outline">{log.status}</Badge>
                        </div>
                        <SheetTitle className="text-xl flex items-center gap-2">
                            {log.action} <span className="text-muted-foreground mx-1">/</span> {log.eventType}
                        </SheetTitle>
                        <SheetDescription>
                            Event ID: <span className="font-mono text-xs text-foreground bg-muted p-1 rounded cursor-pointer" onClick={() => copyToClipboard(log.id, "Event ID")}>{log.id}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6">
                        {/* Timing */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border">
                            {/* ... same as before ... */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" /> Timestamp (UTC)
                                </div>
                                <div className="font-mono text-sm">{new Date(log.timestamp).toUTCString()}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Globe className="w-3 h-3" /> Source IP
                                </div>
                                <div className="font-mono text-sm flex items-center gap-2">
                                    {log.details.ip}
                                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => copyToClipboard(log.details.ip, "IP")}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Actor */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2 pb-2 border-b">
                                <User className="w-4 h-4 text-primary" /> İcraçı (Actor)
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground text-xs block">Ad</span>
                                    <span className="font-medium">{log.actor.name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs block">Tip</span>
                                    <span>{log.actor.type}</span>
                                </div>
                                {log.actor.email && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground text-xs block">Email</span>
                                        <span>{log.actor.email}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground text-xs block">Role</span>
                                    <span>{log.actor.role || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs block">Actor ID</span>
                                    <span className="font-mono text-xs">{log.actor.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Resource */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2 pb-2 border-b">
                                <FileText className="w-4 h-4 text-primary" /> Resurs
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground text-xs block">Resurs Tipi</span>
                                    <span className="font-medium">{log.resource.type}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs block">Resurs ID</span>
                                    <div className="font-mono text-xs flex items-center gap-2">
                                        {log.resource.id}
                                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => copyToClipboard(log.resource.id, "Resource ID")}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                {log.resource.name && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground text-xs block">Resurs Adı</span>
                                        <span>{log.resource.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Technical Details / Changes */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Code className="w-4 h-4 text-primary" /> Texniki Detallar
                                </h4>
                                {log.details.changes && log.details.changes.length > 0 && (
                                    <Button size="sm" variant="outline" onClick={() => setIsDiffOpen(true)}>
                                        <SplitSquareHorizontal className="w-4 h-4 mr-2" />
                                        View Diff
                                    </Button>
                                )}
                            </div>

                            {log.details.changes && log.details.changes.length > 0 ? (
                                <div className="border rounded-md overflow-hidden text-sm">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr className="text-left border-b">
                                                <th className="p-2 font-medium text-xs text-muted-foreground w-1/3">Sahə (Field)</th>
                                                <th className="p-2 font-medium text-xs text-muted-foreground w-1/3 text-red-600">Əvvəl</th>
                                                <th className="p-2 font-medium text-xs text-muted-foreground w-1/3 text-green-600">Sonra</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {log.details.changes.map((change, idx) => (
                                                <tr key={idx}>
                                                    <td className="p-2 font-mono text-xs">{change.field}</td>
                                                    <td className="p-2 font-mono text-xs text-muted-foreground bg-red-50/10 truncate max-w-[100px]" title={String(change.old)}>{String(change.old)}</td>
                                                    <td className="p-2 font-mono text-xs bg-green-50/10 truncate max-w-[100px]" title={String(change.new)}>{String(change.new)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground italic">Dəyişiklik detalı yoxdur (Payload).</div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <span className="text-muted-foreground text-xs block">Correlation ID</span>
                                    <span className="font-mono text-xs">{log.correlationId}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs block">User Agent</span>
                                    <span className="text-xs text-muted-foreground truncate block bg-muted/30 p-1 rounded" title={log.details.userAgent}>{log.details.userAgent}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </SheetContent>
            </Sheet>

            <AuditDiffViewer
                open={isDiffOpen}
                onClose={() => setIsDiffOpen(false)}
                entityName={log.resource.type}
                before={mockBefore}
                after={mockAfter}
            />
        </>
    );
}
