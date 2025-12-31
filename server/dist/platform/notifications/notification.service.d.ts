import { PrismaService } from '../../prisma.service';
export type NotificationType = 'APPROVAL_PENDING' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED' | 'ROLE_CREATED' | 'ROLE_UPDATED' | 'USER_CREATED' | 'SYSTEM_ALERT' | 'INFO';
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
export declare class NotificationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createNotification(dto: CreateNotificationDto): Promise<{
        id: string;
        subject: string;
        body: string;
        priority: string;
        type: string;
        senderId: string | null;
        targetFilter: string | null;
        createdAt: Date;
    }>;
    createBulkNotifications(userIds: string[], type: NotificationType, title: string, message: string, entityType?: string, entityId?: string): Promise<{
        id: string;
        subject: string;
        body: string;
        priority: string;
        type: string;
        senderId: string | null;
        targetFilter: string | null;
        createdAt: Date;
    }>;
    notifyApprovers(approverUserIds: string[], requestId: string, entityType: string, entityName: string): Promise<void>;
    notifyRequester(userId: string, requestId: string, status: 'APPROVED' | 'REJECTED', entityType: string, entityName: string, comment?: string): Promise<void>;
    getNotifications(filter: NotificationFilter): Promise<{
        id: string;
        notificationId: string;
        title: string;
        message: string;
        type: string;
        priority: string;
        isRead: boolean;
        readAt: Date | null;
        createdAt: Date;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(deliveryId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    private sendEmail;
    private getPriority;
}
