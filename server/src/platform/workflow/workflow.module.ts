/**
 * Workflow Module
 */
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';

@Module({
    controllers: [WorkflowController],
    providers: [WorkflowService, PrismaService],
    exports: [WorkflowService]
})
export class WorkflowModule { }
