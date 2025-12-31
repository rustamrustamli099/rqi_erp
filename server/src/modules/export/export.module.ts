/**
 * Export Module
 */
import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportJobService } from './export-job.service';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [ExportController],
    providers: [ExportJobService, PrismaService],
    exports: [ExportJobService]
})
export class ExportModule { }
