/**
 * Notifications Module
 */
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
    controllers: [NotificationController],
    providers: [NotificationService, PrismaService],
    exports: [NotificationService]
})
export class NotificationsModule { }
