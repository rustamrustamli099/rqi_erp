import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { EvidenceService } from './evidence.service';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [ComplianceController],
    providers: [EvidenceService, PrismaService],
})
export class ComplianceModule { }
