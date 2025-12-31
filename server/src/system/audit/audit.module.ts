import { Module, Global } from '@nestjs/common';
import { AuditController } from './api/audit.controller';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma.service';

@Global()
@Module({
    controllers: [AuditController],
    providers: [AuditService, PrismaService],
    exports: [AuditService]
})
export class AuditModule { }
