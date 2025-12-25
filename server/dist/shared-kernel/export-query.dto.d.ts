export declare enum ExportMode {
    CURRENT = "CURRENT",
    ALL = "ALL"
}
export declare class ExportQueryDto {
    exportMode?: ExportMode;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    filters?: Record<string, any>;
    page?: number;
    pageSize?: number;
}
