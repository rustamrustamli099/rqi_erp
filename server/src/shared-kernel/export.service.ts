/**
 * SAP-Grade Export Service
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CSV export funksionallığı.
 * Filters, search, sorting-ə riayət edir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Injectable } from '@nestjs/common';

export interface ExportColumn {
    key: string;
    header: string;
    width?: number;
    transform?: (value: any) => string;
}

@Injectable()
export class ExportService {
    /**
     * Generate CSV from data
     */
    generateCSV<T extends Record<string, any>>(
        data: T[],
        columns: ExportColumn[]
    ): string {
        const headers = columns.map(c => c.header).join(',');
        const rows = data.map(item => {
            return columns.map(col => {
                const value = item[col.key];
                const transformed = col.transform ? col.transform(value) : value;
                // Escape quotes and wrap in quotes if contains comma
                const str = String(transformed ?? '');
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
        });

        return [headers, ...rows].join('\n');
    }

    /**
     * Generate CSV as Buffer (for streaming response)
     */
    generateCSVBuffer<T extends Record<string, any>>(
        data: T[],
        columns: ExportColumn[]
    ): Buffer {
        const csv = this.generateCSV(data, columns);
        return Buffer.from(csv, 'utf-8');
    }
}
