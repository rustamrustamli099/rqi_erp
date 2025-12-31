import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum ScopeType {
    SYSTEM = 'SYSTEM',
    TENANT = 'TENANT',
    UNIT = 'UNIT'
}

export class SwitchContextDto {
    @IsEnum(ScopeType)
    scopeType: ScopeType;

    @IsOptional()
    @IsString()
    scopeId?: string | null;
}
