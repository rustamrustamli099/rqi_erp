import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: any, unreadOnly?: string, limit?: string): Promise<{
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
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: any): Promise<{
        success: boolean;
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
    }>;
}
