/**
 * Export Modal Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-grade export confirmation modal.
 * User can choose between exporting current page or all matching results.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import type { ExportMode } from '@/shared/hooks/useExport';

export interface ExportModalProps {
    open: boolean;
    onClose: () => void;
    onExport: (mode: ExportMode) => void;
    isExporting: boolean;
    /** Current page row count */
    currentCount?: number;
    /** Total matching rows (if known) */
    totalCount?: number;
    /** Entity name for display */
    entityName?: string;
}

export function ExportModal({
    open,
    onClose,
    onExport,
    isExporting,
    currentCount = 0,
    totalCount,
    entityName = 'məlumat'
}: ExportModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        Excel-ə İxrac Et
                    </DialogTitle>
                    <DialogDescription>
                        İxrac etmək istədiyiniz məlumat həcmini seçin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {/* Option 1: Current Page */}
                    <button
                        className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left group"
                        onClick={() => onExport('CURRENT')}
                        disabled={isExporting}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium group-hover:text-primary transition-colors">
                                    Cari Səhifə
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {currentCount} {entityName}
                                </p>
                            </div>
                            {isExporting ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                                <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                        </div>
                    </button>

                    {/* Option 2: All Results */}
                    <button
                        className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left group"
                        onClick={() => onExport('ALL')}
                        disabled={isExporting}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium group-hover:text-primary transition-colors">
                                    Bütün Nəticələr
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {totalCount !== undefined
                                        ? `${totalCount} ${entityName}`
                                        : `Filtrlərə uyğun bütün ${entityName}`
                                    }
                                </p>
                            </div>
                            {isExporting ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                                <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                        </div>
                    </button>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isExporting}>
                        Ləğv et
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
