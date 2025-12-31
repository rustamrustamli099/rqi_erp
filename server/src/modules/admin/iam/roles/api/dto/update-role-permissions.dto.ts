import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRolePermissionsDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    expectedVersion: number;

    @IsArray()
    @IsString({ each: true })
    permissionSlugs: string[];

    @IsString()
    @IsOptional()
    comment?: string;
}
