/**
 * PHASE 14H: Notifications Hook
 * Uses backend menu for visibility - NO resolveNavigationTree calls
 */
import { useState, useEffect } from "react"
import type { NotificationItem } from "@/domains/settings/constants/notifications"
import { useAuth } from "@/domains/auth/context/AuthContext"
import { useMenu } from "@/app/navigation/useMenu"

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
    const { activeTenantType } = useAuth()

    // PHASE 14H: Use backend menu for visibility
    const { menu } = useMenu()

    // Helper to check if page is visible in backend menu
    const isPageVisible = (pageKey: string) => {
        const findNode = (nodes: any[], key: string): boolean => {
            for (const node of nodes) {
                if (node.pageKey === key || node.key === key) return true
                if (node.children && findNode(node.children, key)) return true
            }
            return false
        }
        return findNode(menu, pageKey)
    }

    useEffect(() => {
        // PHASE 14H: Filter notifications based on nav tree visibility (NOT can())
        const filtered = INITIAL_NOTIFICATIONS.filter(n => {
            if (n.category === 'TENANT_SYSTEM') return isPageVisible('admin.tenants');
            if (n.category === 'APPROVALS') return isPageVisible('admin.approvals');
            if (n.category === 'SECURITY') return isPageVisible('admin.console');
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
    }, [menu]) // Depend on menu instead of navTree

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

