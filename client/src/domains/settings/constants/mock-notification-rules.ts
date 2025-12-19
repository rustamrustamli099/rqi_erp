import type { NotificationRule } from "./notification-types";

export const MOCK_RULES: NotificationRule[] = [
    {
        id: "1",
        name: "Yeni İstifadəçi Qarşılaması",
        eventKey: "USER_CREATED",
        severity: "INFO",
        channels: ["EMAIL", "SYSTEM"],
        audience: { roles: ["USER"], users: [], includeTenantAdmins: false },
        delivery: { immediate: true, retryCount: 0 },
        template: { name: "welcome_email", versions: ["v1"], locales: ["az", "en"] },
        status: "ACTIVE",
        lastUpdated: "2024-03-20"
    },
    {
        id: "2",
        name: "Kritik Sistem Xətası",
        eventKey: "SYSTEM_ERROR",
        severity: "CRITICAL",
        channels: ["EMAIL", "SMS", "SYSTEM"],
        audience: { roles: [], users: [], includeTenantAdmins: true },
        delivery: { immediate: true, retryCount: 3 },
        template: { name: "system_alert", versions: ["v1"], locales: ["en"] },
        status: "ACTIVE",
        lastUpdated: "2024-03-21"
    },
    {
        id: "3",
        name: "Abunəlik Xəbərdarlığı",
        eventKey: "SUBSCRIPTION_EXPIRING",
        severity: "WARNING",
        channels: ["EMAIL"],
        audience: { roles: ["ADMIN"], users: [], includeTenantAdmins: true },
        delivery: { immediate: false, retryCount: 1, quietHoursStart: "22:00", quietHoursEnd: "08:00" },
        template: { name: "sub_expiry", versions: ["v2"], locales: ["az"] },
        status: "ACTIVE",
        lastUpdated: "2024-03-19"
    }
];
