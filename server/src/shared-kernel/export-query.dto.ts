/**
 * SAP-Grade Export Query DTO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Standart export sorğu formatı.
 * Bütün export endpoint-ləri bu DTO-nu istifadə etməlidir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { IsOptional, IsString, IsEnum, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ExportMode {
    CURRENT = 'CURRENT',
    ALL = 'ALL'
}

export class ExportQueryDto {
    @IsOptional()
    @IsEnum(ExportMode)
    exportMode?: ExportMode = ExportMode.CURRENT;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsString()
    sortDir?: 'asc' | 'desc';

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return {};
            }
        }
        return value || {};
    })
    @IsObject()
    filters?: Record<string, any>;

    // Only for CURRENT mode
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10) || 1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10) || 15)
    pageSize?: number = 15;
}
