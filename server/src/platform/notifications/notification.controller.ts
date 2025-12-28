/**
 * Notification Controller - API endpoints for notifications
 */
import { Controller, Get, Post, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @ApiOperation({ summary: 'Get notifications for current user' })
    @ApiQuery({ name: 'unreadOnly', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getNotifications(
        @Request() req,
        @Query('unreadOnly') unreadOnly?: string,
        @Query('limit') limit?: string
    ) {
        return this.notificationService.getNotifications({
            userId: req.user.id,
            isRead: unreadOnly === 'true' ? false : undefined,
            limit: limit ? parseInt(limit) : 50
        });
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    async getUnreadCount(@Request() req) {
        const count = await this.notificationService.getUnreadCount(req.user.id);
        return { count };
    }

    @Post(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(@Param('id') id: string, @Request() req) {
        await this.notificationService.markAsRead(id, req.user.id);
        return { success: true };
    }

    @Post('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@Request() req) {
        await this.notificationService.markAllAsRead(req.user.id);
        return { success: true };
    }
}
