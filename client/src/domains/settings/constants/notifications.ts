export type NotificationType =
    | 'INFO'
    | 'SUCCESS'
    | 'WARNING'
    | 'ERROR'

export type NotificationCategory =
    | 'TENANT_SYSTEM'
    | 'APPROVALS'
    | 'SECURITY'
    | 'BILLING'
    | 'SYSTEM'

export interface NotificationItem {
    id: string
    title: string
    message: string
    type: NotificationType
    category: NotificationCategory
    createdAt: string
    read: boolean
    link?: string
}

// Logic: Which roles receive which notifications?
// This is for documentation / backend implementation guidance
export const NOTIFICATION_RULES = {
    TENANT_CREATED: {
        recipients: ['SuperAdmin'],
        category: 'TENANT_SYSTEM'
    },
    TENANT_SUSPENDED: {
        recipients: ['SuperAdmin', 'TenantAdmin'],
        category: 'BILLING'
    },
    APPROVAL_REQUEST: {
        recipients: ['Admin', 'Manager'],
        category: 'APPROVALS'
    }
}
