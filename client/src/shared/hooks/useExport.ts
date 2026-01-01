/**
 * SAP-Grade Export Hook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-GRADE: Export permission comes from RESOLVED ACTIONS, not UI checks.
 * The caller MUST pass `canExport` from the Decision Center's resolved tree.
 * 
 * İstifadə:
 * // Get canExport from resolved actions in navigation tree
 * const exportAction = resolvedActions?.byContext.toolbar.find(a => a.actionKey === 'export');
 * const canExport = exportAction?.state === 'enabled';
 * 
 * const { isExporting, openModal, exportData } = useExport({
 *     endpoint: '/api/v1/admin/roles/export',
 *     canExport: canExport,  // FROM RESOLVED ACTIONS
 *     query: query
 * });
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

export type ExportMode = 'CURRENT' | 'ALL';

export interface ExportOptions {
    /** Backend export endpoint */
    endpoint: string;
    /** 
     * SAP-GRADE: Export permission from RESOLVED ACTIONS.
     * Must come from Decision Center, NOT from UI permission check.
     */
    canExport: boolean;
    /** Current ListQuery state */
    query: {
        search?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDir?: 'asc' | 'desc';
        filters?: Record<string, any>;
    };
    /** File name for download */
    fileName?: string;
}

export interface UseExportResult {
    /** User has export permission (from resolved actions) */
    canExport: boolean;
    /** Export in progress */
    isExporting: boolean;
    /** Open modal state */
    isModalOpen: boolean;
    /** Open export modal */
    openModal: () => void;
    /** Close export modal */
    closeModal: () => void;
    /** Execute export */
    exportData: (mode: ExportMode) => Promise<void>;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * SAP-GRADE: This hook does NOT check permissions.
 * Permission (canExport) must be passed from resolved actions.
 */
export function useExport(options: ExportOptions): UseExportResult {
    const [isExporting, setIsExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // SAP-GRADE: canExport comes from Decision Center via options
    const canExport = options.canExport;

    const openModal = useCallback(() => {
        if (!canExport) {
            toast.error('Export icazəniz yoxdur');
            return;
        }
        setIsModalOpen(true);
    }, [canExport]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const exportData = useCallback(async (mode: ExportMode) => {
        if (!canExport) {
            toast.error('Export icazəniz yoxdur');
            return;
        }

        setIsExporting(true);

        try {
            // Build query params
            const params = new URLSearchParams();

            // Export mode
            params.set('exportMode', mode);

            // Search
            if (options.query.search) {
                params.set('search', options.query.search);
            }

            // Sort
            if (options.query.sortBy) {
                params.set('sortBy', options.query.sortBy);
                params.set('sortDir', options.query.sortDir || 'asc');
            }

            // Filters
            if (options.query.filters) {
                Object.entries(options.query.filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.set(`filter[${key}]`, String(value));
                    }
                });
            }

            // For CURRENT mode, include pagination
            if (mode === 'CURRENT') {
                params.set('page', String(options.query.page || 1));
                params.set('pageSize', String(options.query.pageSize || 15));
            }

            const url = `${options.endpoint}?${params.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Export xətası');
            }

            // Get filename from header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = options.fileName || 'export.xlsx';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match) {
                    fileName = match[1];
                }
            }

            // Download file
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast.success('Export uğurla tamamlandı');
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('[useExport] Error:', error);
            toast.error(error.message || 'Export zamanı xəta baş verdi');
        } finally {
            setIsExporting(false);
        }
    }, [canExport, options]);

    return {
        canExport,
        isExporting,
        isModalOpen,
        openModal,
        closeModal,
        exportData
    };
}
