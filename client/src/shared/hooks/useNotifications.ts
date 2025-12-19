import { useState, useEffect } from "react"
import type { NotificationItem } from "@/domains/settings/constants/notifications"
import { usePermissions } from "@/app/auth/hooks/usePermissions"

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: "1",
        title: "Yeni Tenant Qeydiyyatı",
        message: "Yeni tenant 'Global Construction LLC' qeydiyyatdan keçdi.",
        type: "INFO",
        category: "TENANT_SYSTEM",
        createdAt: new Date().toISOString(),
        read: false,
        link: "/admin/tenants"
    },
    {
        id: "2",
        title: "Təsdiqləmə Tələb Olunur",
        message: "Ali Vəliyev tərəfindən 'Yeni İşçi' sorğusu göndərildi.",
        type: "WARNING",
        category: "APPROVALS",
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false,
        link: "/admin/approvals"
    },
    {
        id: "3",
        title: "Backup Uğurlu",
        message: "Gecə yarısı backup prosesi uğurla tamamlandı.",
        type: "SUCCESS",
        category: "SECURITY",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: true
    }
]

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const { can } = usePermissions()

    useEffect(() => {
        // Filter initial notifications based on permissions
        const filtered = INITIAL_NOTIFICATIONS.filter(n => {
            if (n.category === 'TENANT_SYSTEM') return can('tenants.view');
            if (n.category === 'APPROVALS') return can('approvals.view');
            if (n.category === 'SECURITY') return can('system.security.view');
            return true;
        });
        setNotifications(filtered)

        // Simulate Real-time updates
        const interval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance every check
                const newNotification: NotificationItem = {
                    id: Date.now().toString(),
                    title: "Sistem Bildirişi",
                    message: `Avtomatik sistem yoxlaması tamamlandı. Status: Normal.`,
                    type: "INFO",
                    category: "SYSTEM",
                    createdAt: new Date().toISOString(),
                    read: false
                };
                setNotifications(prev => [newNotification, ...prev]);
            }
        }, 15000); // Check every 15 seconds

        return () => clearInterval(interval);
    }, []) // Empty dependency array to run only once on mount

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    }
}
