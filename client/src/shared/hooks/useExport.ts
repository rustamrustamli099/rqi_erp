/**
 * SAP-Grade Export Hook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Filters, search və sorting-ə riayət edən export funksionallığı.
 * 
 * İstifadə:
 * const { canExport, isExporting, openModal, exportData } = useExport({
 *     endpoint: '/api/v1/admin/roles/export',
 *     permissionSlug: 'system.settings.security.user_rights.roles_permissions.export_to_excel',
 *     query: query
 * });
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

export type ExportMode = 'CURRENT' | 'ALL';

export interface ExportOptions {
    /** Backend export endpoint */
    endpoint: string;
    /** Permission slug for export (e.g., system.roles.export) */
    permissionSlug: string;
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
    /** User has export permission */
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

export function useExport(options: ExportOptions): UseExportResult {
    const { hasPermission } = usePermissions();
    const [isExporting, setIsExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const canExport = hasPermission(options.permissionSlug);

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
