/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NOTIFICATION SERVICE - In-App + Email Notifications
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Supports:
 * - In-app notifications (persisted)
 * - Email notifications (via SMTP)
 * - Approval workflow notifications
 * - Real-time delivery (WebSocket ready)
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type NotificationType =
    | 'APPROVAL_PENDING'
    | 'APPROVAL_APPROVED'
    | 'APPROVAL_REJECTED'
    | 'ROLE_CREATED'
    | 'ROLE_UPDATED'
    | 'USER_CREATED'
    | 'SYSTEM_ALERT'
    | 'INFO';

export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    sendEmail?: boolean;
}

export interface NotificationFilter {
    userId: string;
    isRead?: boolean;
    type?: NotificationType;
    limit?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════

@Injectable()
export class NotificationService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a notification for a user
     */
    async createNotification(dto: CreateNotificationDto) {
        // Create notification in database
        const notification = await this.prisma.notification.create({
            data: {
                subject: dto.title,
                body: dto.message,
                type: dto.type,
                priority: this.getPriority(dto.type),
                senderId: null,
                targetFilter: dto.userId, // Using targetFilter to store userId for now
            }
        });

        // Create delivery record
        await this.prisma.notificationDelivery.create({
            data: {
                notificationId: notification.id,
                userId: dto.userId,
                status: 'DELIVERED'
            }
        });

        // Send email if requested
        if (dto.sendEmail) {
            await this.sendEmail(dto);
        }

        return notification;
    }

    /**
     * Create notifications for multiple users
     */
    async createBulkNotifications(
        userIds: string[],
        type: NotificationType,
        title: string,
        message: string,
        entityType?: string,
        entityId?: string
    ) {
        const notification = await this.prisma.notification.create({
            data: {
                subject: title,
                body: message,
                type: type,
                priority: this.getPriority(type),
                senderId: null,
                targetFilter: JSON.stringify({ entityType, entityId })
            }
        });

        // Create delivery records for all users
        await this.prisma.notificationDelivery.createMany({
            data: userIds.map(userId => ({
                notificationId: notification.id,
                userId,
                status: 'DELIVERED'
            }))
        });

        return notification;
    }

    /**
     * Notify approvers about pending approval
     */
    async notifyApprovers(
        approverUserIds: string[],
        requestId: string,
        entityType: string,
        entityName: string
    ) {
        if (approverUserIds.length === 0) return;

        await this.createBulkNotifications(
            approverUserIds,
            'APPROVAL_PENDING',
            'Yeni Təsdiq Sorğusu',
            `${entityType} "${entityName}" üçün yeni təsdiq sorğusu var. Zəhmət olmasa nəzərdən keçirin.`,
            'APPROVAL_REQUEST',
            requestId
        );
    }

    /**
     * Notify requester about approval result
     */
    async notifyRequester(
        userId: string,
        requestId: string,
        status: 'APPROVED' | 'REJECTED',
        entityType: string,
        entityName: string,
        comment?: string
    ) {
        const isApproved = status === 'APPROVED';

        await this.createNotification({
            userId,
            type: isApproved ? 'APPROVAL_APPROVED' : 'APPROVAL_REJECTED',
            title: isApproved ? 'Təsdiq Qəbul Edildi' : 'Təsdiq Rədd Edildi',
            message: isApproved
                ? `${entityType} "${entityName}" üçün sorğunuz təsdiqləndi.`
                : `${entityType} "${entityName}" üçün sorğunuz rədd edildi.${comment ? ` Səbəb: ${comment}` : ''}`,
            entityType: 'APPROVAL_REQUEST',
            entityId: requestId,
            sendEmail: true
        });
    }

    /**
     * Get notifications for a user
     */
    async getNotifications(filter: NotificationFilter) {
        const deliveries = await this.prisma.notificationDelivery.findMany({
            where: {
                userId: filter.userId,
                ...(filter.isRead !== undefined && {
                    readAt: filter.isRead ? { not: null } : null
                })
            },
            include: {
                notification: true
            },
            orderBy: { sentAt: 'desc' },
            take: filter.limit || 50
        });

        return deliveries.map(d => ({
            id: d.id,
            notificationId: d.notification.id,
            title: d.notification.subject,
            message: d.notification.body,
            type: d.notification.type,
            priority: d.notification.priority,
            isRead: d.readAt !== null,
            readAt: d.readAt,
            createdAt: d.sentAt
        }));
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notificationDelivery.count({
            where: {
                userId,
                readAt: null
            }
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(deliveryId: string, userId: string) {
        return this.prisma.notificationDelivery.updateMany({
            where: {
                id: deliveryId,
                userId
            },
            data: {
                readAt: new Date()
            }
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string) {
        return this.prisma.notificationDelivery.updateMany({
            where: {
                userId,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        });
    }

    /**
     * Send email notification
     */
    private async sendEmail(dto: CreateNotificationDto) {
        // TODO: Integrate with actual email service (e.g., nodemailer, SendGrid)
        console.log(`[EMAIL] Sending to user ${dto.userId}: ${dto.title}`);

        // Get user email
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            select: { email: true, fullName: true }
        });

        if (user?.email) {
            // In production, call email service here
            console.log(`[EMAIL] Would send to ${user.email}: ${dto.title}`);
        }
    }

    /**
     * Get priority based on notification type
     */
    private getPriority(type: NotificationType): string {
        switch (type) {
            case 'APPROVAL_PENDING':
            case 'SYSTEM_ALERT':
                return 'HIGH';
            case 'APPROVAL_REJECTED':
                return 'MEDIUM';
            default:
                return 'NORMAL';
        }
    }
}
