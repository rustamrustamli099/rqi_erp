import { Module } from '@nestjs/common';
import { DashboardController } from './api/dashboard.controller';
import { DashboardUseCase } from './application/dashboard.usecase';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [DashboardController],
    providers: [DashboardUseCase, PrismaService],
})
export class DashboardModule { }
