import { IsNumber, IsOptional, IsString, IsIn, Min, Max } from 'class-validator';
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
    @Min(1)
    @Max(100)
    pageSize?: number = 10;

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
    filters?: Record<string, any>; // Complex filters usually parsed manually or via specific DTOs
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
