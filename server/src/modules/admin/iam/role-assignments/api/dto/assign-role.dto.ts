import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class AssignRoleDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    roleId: string;

    @IsDateString()
    @IsOptional()
    validFrom?: string;

    @IsDateString()
    @IsOptional()
    validTo?: string;
}
