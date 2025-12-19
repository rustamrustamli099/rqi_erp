
import { Module } from '@nestjs/common';
import { RetentionService } from './retention.service';
import { RetentionController } from './retention.controller';

import { PrismaService } from '../../prisma.service';

@Module({
    providers: [RetentionService, PrismaService],
    controllers: [RetentionController],
    exports: [RetentionService]
})
export class RetentionModule { }
