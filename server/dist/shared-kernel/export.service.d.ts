export interface ExportColumn {
    key: string;
    header: string;
    width?: number;
    transform?: (value: any) => string;
}
export declare class ExportService {
    generateCSV<T extends Record<string, any>>(data: T[], columns: ExportColumn[]): string;
    generateCSVBuffer<T extends Record<string, any>>(data: T[], columns: ExportColumn[]): Buffer;
}
