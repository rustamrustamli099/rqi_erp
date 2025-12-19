export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';
export type NotificationChannel = 'EMAIL' | 'SMS' | 'SYSTEM';
export type RuleStatus = 'ACTIVE' | 'INACTIVE';

export interface NotificationEvent {
    key: string;
    label: string;
    description?: string;
}

export interface NotificationRule {
    id: string;
    name: string;
    eventKey: string;
    severity: NotificationSeverity;
    channels: NotificationChannel[];
    audience: {
        roles: string[];
        users: string[];
        dynamicGroups?: string[];
        includeTenantAdmins: boolean;
    };
    delivery: {
        immediate: boolean;
        retryCount: number;
        quietHoursStart?: string; // HH:MM
        quietHoursEnd?: string;
    };
    template: {
        name: string;
        versions: string[]; // v1, v2
        locales: string[]; // az, en, ru
    };
    status: RuleStatus;
    lastUpdated: string;
}

export const MOCK_EVENTS: NotificationEvent[] = [
    { key: 'USER_CREATED', label: 'İstifadəçi Yaradıldı' },
    { key: 'LOGIN_FAILED', label: 'Giriş Cəhdi Uğursuz Oldu' },
    { key: 'SUBSCRIPTION_EXPIRING', label: 'Abunəlik Bitir' },
    { key: 'SYSTEM_ERROR', label: 'Sistem Xətası' },
    { key: 'DATA_EXPORTED', label: 'Məlumat Export Edildi' },
];
