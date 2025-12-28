/**
 * Enterprise Export Modal
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-grade export modal with column selection, filter summary, and risk warnings.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Download,
    FileSpreadsheet,
    FileText,
    AlertTriangle,
    Filter,
    Search,
    SortAsc,
    Info,
    Shield
} from 'lucide-react';
import { RiskBadge } from '@/shared/components/security/RiskBadge';
import type { RiskLevel } from '@/app/security/risk-scoring';

export interface ExportColumn {
    id: string;
    label: string;
    labelAz: string;
    required?: boolean;
    sensitive?: boolean;
}

export interface ExportFilter {
    field: string;
    label: string;
    value: string;
}

export interface ExportConfig {
    columns: ExportColumn[];
    filters: ExportFilter[];
    searchTerm?: string;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    totalRows: number;
    currentPageRows: number;
    module: string;
    riskLevel?: RiskLevel;
}

export type ExportScope = 'current' | 'filtered' | 'selected';
export type ExportFormat = 'xlsx' | 'csv';

interface EnterpriseExportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: ExportConfig;
    selectedRowsCount?: number;
    onExport: (options: ExportOptions) => void;
    isExporting?: boolean;
}

export interface ExportOptions {
    scope: ExportScope;
    format: ExportFormat;
    columns: string[];
    includeHeaders: boolean;
}

export function EnterpriseExportModal({
    open,
    onOpenChange,
    config,
    selectedRowsCount = 0,
    onExport,
    isExporting = false
}: EnterpriseExportModalProps) {
    const [scope, setScope] = useState<ExportScope>('current');
    const [format, setFormat] = useState<ExportFormat>('xlsx');
    const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
        new Set(config.columns.map(c => c.id))
    );
    const [includeHeaders, setIncludeHeaders] = useState(true);

    const isHighRisk = config.riskLevel === 'HIGH';
    const hasSensitiveColumns = config.columns.some(c => c.sensitive && selectedColumns.has(c.id));

    const exportRowCount = useMemo(() => {
        switch (scope) {
            case 'current': return config.currentPageRows;
            case 'filtered': return config.totalRows;
            case 'selected': return selectedRowsCount;
        }
    }, [scope, config, selectedRowsCount]);

    const handleColumnToggle = (columnId: string, checked: boolean) => {
        const column = config.columns.find(c => c.id === columnId);
        if (column?.required && !checked) return; // Can't uncheck required

        setSelectedColumns(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(columnId);
            } else {
                next.delete(columnId);
            }
            return next;
        });
    };

    const handleSelectAllColumns = () => {
        setSelectedColumns(new Set(config.columns.map(c => c.id)));
    };

    const handleDeselectAllColumns = () => {
        const required = new Set(config.columns.filter(c => c.required).map(c => c.id));
        setSelectedColumns(required);
    };

    const handleExport = () => {
        onExport({
            scope,
            format,
            columns: Array.from(selectedColumns),
            includeHeaders
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FileSpreadsheet className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Data Export</DialogTitle>
                            <DialogDescription>
                                {config.module} modulundan data export et
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 max-h-[500px] pr-4">
                    <div className="space-y-4">
                        {/* Risk Warning */}
                        {(isHighRisk || hasSensitiveColumns) && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {isHighRisk && 'Bu export yüksək riskli hesab olunur. '}
                                    {hasSensitiveColumns && 'Həssas sütunlar seçilib. '}
                                    Bu əməliyyat audit üçün qeyd olunacaq.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Data Scope */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Data Scope</Label>
                            <RadioGroup value={scope} onValueChange={(v) => setScope(v as ExportScope)}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="current" id="current" />
                                    <Label htmlFor="current" className="font-normal cursor-pointer">
                                        Cari Səhifə ({config.currentPageRows} sətir)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="filtered" id="filtered" />
                                    <Label htmlFor="filtered" className="font-normal cursor-pointer">
                                        Bütün Filtrlənmiş Nəticələr ({config.totalRows} sətir)
                                    </Label>
                                </div>
                                {selectedRowsCount > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="selected" id="selected" />
                                        <Label htmlFor="selected" className="font-normal cursor-pointer">
                                            Seçilmiş Sətirlər ({selectedRowsCount} sətir)
                                        </Label>
                                    </div>
                                )}
                            </RadioGroup>
                        </div>

                        <Separator />

                        {/* Active Conditions Summary */}
                        <Accordion type="single" collapsible defaultValue="conditions">
                            <AccordionItem value="conditions">
                                <AccordionTrigger className="text-sm">
                                    <span className="flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        Aktiv Şərtlər
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 text-sm">
                                        {config.searchTerm && (
                                            <div className="flex items-center gap-2">
                                                <Search className="w-4 h-4 text-muted-foreground" />
                                                <span>Axtarış: "{config.searchTerm}"</span>
                                            </div>
                                        )}
                                        {config.filters.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-muted-foreground">Filtrlər:</span>
                                                {config.filters.map((f, i) => (
                                                    <Badge key={i} variant="outline" className="ml-2">
                                                        {f.label}: {f.value}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        {config.sortField && (
                                            <div className="flex items-center gap-2">
                                                <SortAsc className="w-4 h-4 text-muted-foreground" />
                                                <span>Sıralama: {config.sortField} ({config.sortDirection})</span>
                                            </div>
                                        )}
                                        {!config.searchTerm && config.filters.length === 0 && !config.sortField && (
                                            <span className="text-muted-foreground">Heç bir filtr aktiv deyil</span>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Separator />

                        {/* Column Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Sütunlar</Label>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleSelectAllColumns}>
                                        Hamısını Seç
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleDeselectAllColumns}>
                                        Sıfırla
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {config.columns.map(column => (
                                    <div key={column.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={column.id}
                                            checked={selectedColumns.has(column.id)}
                                            disabled={column.required}
                                            onCheckedChange={(checked) =>
                                                handleColumnToggle(column.id, checked as boolean)
                                            }
                                        />
                                        <Label
                                            htmlFor={column.id}
                                            className="font-normal cursor-pointer flex items-center gap-1"
                                        >
                                            {column.labelAz}
                                            {column.required && (
                                                <span className="text-xs text-muted-foreground">(mütləq)</span>
                                            )}
                                            {column.sensitive && (
                                                <Shield className="w-3 h-3 text-orange-500" />
                                            )}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Format Options */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Format</Label>
                            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="xlsx" id="xlsx" />
                                    <Label htmlFor="xlsx" className="font-normal cursor-pointer flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                        Excel (.xlsx)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="csv" id="csv" />
                                    <Label htmlFor="csv" className="font-normal cursor-pointer flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        CSV (.csv)
                                    </Label>
                                </div>
                            </RadioGroup>

                            <div className="flex items-center space-x-2 mt-2">
                                <Checkbox
                                    id="headers"
                                    checked={includeHeaders}
                                    onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
                                />
                                <Label htmlFor="headers" className="font-normal cursor-pointer">
                                    Başlıq sətiri daxil et
                                </Label>
                            </div>
                        </div>

                        {/* Audit Notice */}
                        <div className="flex items-start gap-2 p-3 bg-muted rounded-md text-sm">
                            <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Bu export audit məqsədləri üçün qeyd olunacaq.
                            </span>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2 mt-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {exportRowCount} sətir, {selectedColumns.size} sütun
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Ləğv Et
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting}>
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? 'Export edilir...' : 'Export Et'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default EnterpriseExportModal;
