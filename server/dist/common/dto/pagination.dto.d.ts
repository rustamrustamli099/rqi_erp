export declare class ListQueryDto {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc' | 'ASC' | 'DESC';
    filters?: Record<string, any>;
}
export interface PaginatedResult<T> {
    items: T[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    query: {
        sortBy?: string;
        sortDir?: string;
        search?: string;
        filters?: any;
    };
}
