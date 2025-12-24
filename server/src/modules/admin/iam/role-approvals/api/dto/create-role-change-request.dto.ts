import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleChangeRequestDto {
    @ApiProperty({ description: 'ID of the role to modify' })
    @IsString()
    @IsNotEmpty()
    roleId: string;

    @ApiProperty({ description: 'JSON object representing the diff (added/removed permissions)' })
    @IsObject()
    @IsOptional()
    diff?: Record<string, any>;

    @ApiProperty({ description: 'Reason for the change request' })
    @IsString()
    @IsOptional()
    reason?: string;
}
