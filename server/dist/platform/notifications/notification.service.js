"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let NotificationService = class NotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(dto) {
        const notification = await this.prisma.notification.create({
            data: {
                subject: dto.title,
                body: dto.message,
                type: dto.type,
                priority: this.getPriority(dto.type),
                senderId: null,
                targetFilter: dto.userId,
            }
        });
        await this.prisma.notificationDelivery.create({
            data: {
                notificationId: notification.id,
                userId: dto.userId,
                status: 'DELIVERED'
            }
        });
        if (dto.sendEmail) {
            await this.sendEmail(dto);
        }
        return notification;
    }
    async createBulkNotifications(userIds, type, title, message, entityType, entityId) {
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
        await this.prisma.notificationDelivery.createMany({
            data: userIds.map(userId => ({
                notificationId: notification.id,
                userId,
                status: 'DELIVERED'
            }))
        });
        return notification;
    }
    async notifyApprovers(approverUserIds, requestId, entityType, entityName) {
        if (approverUserIds.length === 0)
            return;
        await this.createBulkNotifications(approverUserIds, 'APPROVAL_PENDING', 'Yeni Təsdiq Sorğusu', `${entityType} "${entityName}" üçün yeni təsdiq sorğusu var. Zəhmət olmasa nəzərdən keçirin.`, 'APPROVAL_REQUEST', requestId);
    }
    async notifyRequester(userId, requestId, status, entityType, entityName, comment) {
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
    async getNotifications(filter) {
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
    async getUnreadCount(userId) {
        return this.prisma.notificationDelivery.count({
            where: {
                userId,
                readAt: null
            }
        });
    }
    async markAsRead(deliveryId, userId) {
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
    async markAllAsRead(userId) {
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
    async sendEmail(dto) {
        console.log(`[EMAIL] Sending to user ${dto.userId}: ${dto.title}`);
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            select: { email: true, fullName: true }
        });
        if (user?.email) {
            console.log(`[EMAIL] Would send to ${user.email}: ${dto.title}`);
        }
    }
    getPriority(type) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map