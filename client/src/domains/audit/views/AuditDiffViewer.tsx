import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code } from "lucide-react";

interface AuditDiffViewerProps {
    open: boolean;
    onClose: () => void;
    before: any;
    after: any;
    entityName?: string;
}

export function AuditDiffViewer({ open, onClose, before, after, entityName }: AuditDiffViewerProps) {
    const formatJSON = (data: any) => JSON.stringify(data, null, 2);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Dəyişiklik Tarixçəsi (Diff View)
                    </DialogTitle>
                    <DialogDescription>
                        {entityName && <span className="font-mono bg-muted px-1 rounded mr-1">{entityName}</span>}
                        obyekti üzərindəki dəyişikliklərin JSON müqayisəsi.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden mt-4">
                    {/* BEFORE STATE */}
                    <div className="flex flex-col border rounded-md overflow-hidden bg-muted/10">
                        <div className="p-2 border-b bg-muted/40 font-medium text-sm flex justify-between items-center text-red-600">
                            <span>Əvvəlki Vəziyyət (Before)</span>
                            <Badge variant="outline" className="text-xs">JSON</Badge>
                        </div>
                        <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
                            <pre className="text-xs font-mono language-json whitespace-pre-wrap break-all text-red-700 dark:text-red-400">
                                {before ? formatJSON(before) : <span className="text-muted-foreground italic">null</span>}
                            </pre>
                        </ScrollArea>
                    </div>

                    {/* AFTER STATE */}
                    <div className="flex flex-col border rounded-md overflow-hidden bg-muted/10">
                        <div className="p-2 border-b bg-muted/40 font-medium text-sm flex justify-between items-center text-green-600">
                            <span>Sonrakı Vəziyyət (After)</span>
                            <Badge variant="outline" className="text-xs">JSON</Badge>
                        </div>
                        <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
                            <pre className="text-xs font-mono language-json whitespace-pre-wrap break-all text-green-700 dark:text-green-400">
                                {after ? formatJSON(after) : <span className="text-muted-foreground italic">null</span>}
                            </pre>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
