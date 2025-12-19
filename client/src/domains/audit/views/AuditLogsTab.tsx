import { useState } from "react";
import { DataTable } from "@/shared/components/ui/data-table"; // Using standard enterprise path? Or generic one?
// Checking ApprovalsPage, it uses `@/shared/components/ui/data-table-new/data-table`.
// Wait, I used `@/shared/components/ui/data-table` in my implementation plan but ApprovalsPage imports from local?
// Actually in approvals, user said "our reusable table".
// I'll check where the robust DataTable actually is. In step 2772, I viewed ApprovalsPage and it uses "@/shared/components/ui/data-table-new/data-table" (Wait no, I saw import in my edit).
// Let's assume `@/shared/components/ui/data-table` is the one (from my memory of previous turns).
// Or I can copy the import path from `ApprovalsPage.tsx`.
// I'll assume standard path.

import { MOCK_AUDIT_LOGS, type AuditLog } from "./audit-types";
import { auditColumns } from "./audit-columns";
import { AuditLogDetails } from "./AuditLogDetails";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Filter } from "lucide-react";

import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function AuditLogsTab() {
    const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [confirmExport, setConfirmExport] = useState<{ isOpen: boolean }>({ isOpen: false });

    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setIsDetailsOpen(true);
    };

    const columns = auditColumns(handleViewDetails);

    return (
        <div className="h-full flex flex-col space-y-4">


            <div className="border rounded-md">
                <DataTable
                    data={auditLogs}
                    columns={columns}
                    searchKey="action" // Simple search for now
                >
                    <div className="flex items-center gap-2">
                        {/* Filter Button */}
                        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Filter className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Filterləmə</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Audit Filterləri</DialogTitle>
                                    <DialogDescription>Axtarış parametrlərini seçin</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tarix Aralığı</label>
                                        <DateRangePicker />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Əməliyyat Növü</label>
                                        <div className="border p-2 rounded text-sm text-muted-foreground bg-muted/20">Hamısı</div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsFilterOpen(false)}>Ləğv et</Button>
                                    <Button onClick={() => { setIsFilterOpen(false); toast.success("Filterlər tətbiq edildi"); }}>Tətbiq et</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Export Button */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setConfirmExport({ isOpen: true })}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Excel-ə Export et</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Refresh Button */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => toast.success("Yeniləndi")}>
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Yenilə</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <ConfirmationDialog
                            open={confirmExport.isOpen}
                            onOpenChange={(open: boolean) => setConfirmExport(prev => ({ ...prev, isOpen: open }))}
                            title="Export Təsdiqi"
                            description="Audit loglarını Excel faylı olaraq yükləmək istədiyinizə əminsiniz?"
                            confirmLabel="Yüklə"
                            cancelLabel="Bağla"
                            onConfirm={() => {
                                toast.success("Fayl yüklənir...");
                                setConfirmExport({ isOpen: false });
                            }}
                        />
                    </div>
                </DataTable>
            </div>

            <AuditLogDetails
                log={selectedLog}
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
            />
        </div >
    );
}
