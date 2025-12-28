import { IsNumber, IsOptional, IsString, IsIn, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// SAP-Grade: Fixed page sizes, no user-controlled large exports
const ALLOWED_PAGE_SIZES = [10, 15, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 50;

export class ListQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Max(MAX_PAGE_SIZE)
    @IsIn([...ALLOWED_PAGE_SIZES], { message: `Page size must be one of [${ALLOWED_PAGE_SIZES.join(', ')}]` })
    pageSize?: number = DEFAULT_PAGE_SIZE;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsIn(['asc', 'desc', 'ASC', 'DESC'])
    sortDir?: 'asc' | 'desc' | 'ASC' | 'DESC' = 'desc';

    @IsOptional()
    filters?: any; // Parsed manually in QueryParser. Relaxes validation to avoid 400.
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
    }
}
