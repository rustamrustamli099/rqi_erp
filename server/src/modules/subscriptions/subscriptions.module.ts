import { Module } from '@nestjs/common';
import { SubscriptionsUseCase } from './application/subscriptions.usecase';
import { SubscriptionsController } from './api/subscriptions.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsUseCase, PrismaService],
})
export class SubscriptionsModule { }
