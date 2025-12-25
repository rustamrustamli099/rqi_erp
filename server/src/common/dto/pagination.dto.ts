import { IsNumber, IsOptional, IsString, IsIn, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class ListQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsIn([10, 25, 50, 100], { message: 'Page size must be one of [10, 25, 50, 100]' })
    pageSize?: number = 25;

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
