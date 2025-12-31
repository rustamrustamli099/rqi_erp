import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreviewPermissionsDto {
    @ApiProperty({ description: 'List of Role IDs to simulate', type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    roleIds: string[];

    @ApiProperty({ description: 'Optional Tenant Context ID', required: false })
    @IsOptional()
    @IsUUID()
    tenantId?: string;

    @ApiProperty({ description: 'Explicit list of permission slugs (for unsaved changes)', required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}
