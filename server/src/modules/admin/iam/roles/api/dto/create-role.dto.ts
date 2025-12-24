import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsIn(['SYSTEM', 'TENANT'])
    scope: 'SYSTEM' | 'TENANT';

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    permissionIds?: string[];
}
