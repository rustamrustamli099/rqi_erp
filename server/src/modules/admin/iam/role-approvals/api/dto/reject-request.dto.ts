import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectRequestDto {
    @ApiProperty({ description: 'Reason for rejection' })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
