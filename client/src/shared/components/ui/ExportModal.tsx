/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPORT MODAL - SAP-Grade Export Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './button';

export interface ExportColumn {
    key: string;
    label: string;
    checked?: boolean;
}

export interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (options: ExportOptions) => Promise<void>;
    columns: ExportColumn[];
    totalRecords: number;
    currentPageRecords: number;
    selectedCount?: number;
    entityName: string;
}

export interface ExportOptions {
    format: 'CSV' | 'XLSX';
    scope: 'CURRENT_PAGE' | 'ALL_FILTERED' | 'SELECTED';
    columns: string[];
}

export function ExportModal({
    isOpen,
    onClose,
    onExport,
    columns,
    totalRecords,
    currentPageRecords,
    selectedCount = 0,
    entityName
}: ExportModalProps) {
    const [format, setFormat] = useState<'CSV' | 'XLSX'>('XLSX');
    const [scope, setScope] = useState<'CURRENT_PAGE' | 'ALL_FILTERED' | 'SELECTED'>('CURRENT_PAGE');
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        columns.filter(c => c.checked !== false).map(c => c.key)
    );
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const toggleColumn = (key: string) => {
        setSelectedColumns(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const toggleAllColumns = () => {
        if (selectedColumns.length === columns.length) {
            setSelectedColumns([]);
        } else {
            setSelectedColumns(columns.map(c => c.key));
        }
    };

    const handleExport = async () => {
        if (selectedColumns.length === 0) {
            setError('Ən azı bir sütun seçin');
            return;
        }

        setIsExporting(true);
        setError(null);

        try {
            await onExport({
                format,
                scope,
                columns: selectedColumns
            });
            onClose();
        } catch (err: any) {
            if (err?.response?.data?.requiresApproval) {
                setError(`Export təsdiq tələb edir: ${err.response.data.reason}`);
            } else {
                setError(err?.message || 'Export xətası baş verdi');
            }
        } finally {
            setIsExporting(false);
        }
    };

    const getRecordCount = () => {
        switch (scope) {
            case 'CURRENT_PAGE': return currentPageRecords;
            case 'ALL_FILTERED': return totalRecords;
            case 'SELECTED': return selectedCount;
            default: return 0;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold">{entityName} Export</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Format</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFormat('XLSX')}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${format === 'XLSX'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FileSpreadsheet className={`w-5 h-5 ${format === 'XLSX' ? 'text-green-600' : 'text-gray-500'}`} />
                                <span className={format === 'XLSX' ? 'font-medium text-green-700 dark:text-green-400' : ''}>Excel (XLSX)</span>
                            </button>
                            <button
                                onClick={() => setFormat('CSV')}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${format === 'CSV'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FileText className={`w-5 h-5 ${format === 'CSV' ? 'text-blue-600' : 'text-gray-500'}`} />
                                <span className={format === 'CSV' ? 'font-medium text-blue-700 dark:text-blue-400' : ''}>CSV</span>
                            </button>
                        </div>
                    </div>

                    {/* Scope Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Export Həcmi</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={scope === 'CURRENT_PAGE'}
                                    onChange={() => setScope('CURRENT_PAGE')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>Cari Səhifə ({currentPageRecords} qeyd)</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                <input
                                    type="radio"
                                    name="scope"
                                    checked={scope === 'ALL_FILTERED'}
                                    onChange={() => setScope('ALL_FILTERED')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span>Bütün Filtrlənmiş ({totalRecords} qeyd)</span>
                            </label>
                            {selectedCount > 0 && (
                                <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="scope"
                                        checked={scope === 'SELECTED'}
                                        onChange={() => setScope('SELECTED')}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span>Seçilmişlər ({selectedCount} qeyd)</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Column Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">Sütunlar</label>
                            <button
                                onClick={toggleAllColumns}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                {selectedColumns.length === columns.length ? 'Hamısını Sil' : 'Hamısını Seç'}
                            </button>
                        </div>
                        <div className="max-h-40 overflow-y-auto border rounded-lg p-2 dark:border-gray-700">
                            {columns.map(col => (
                                <label key={col.key} className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.includes(col.key)}
                                        onChange={() => toggleColumn(col.key)}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm">{col.label}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{selectedColumns.length} / {columns.length} sütun seçildi</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <span className="text-sm text-gray-500">
                        {getRecordCount()} qeyd export ediləcək
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isExporting}>
                            Ləğv et
                        </Button>
                        <Button onClick={handleExport} disabled={isExporting || selectedColumns.length === 0}>
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Export edilir...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Et
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
