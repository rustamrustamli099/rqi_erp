import {
    Settings,
    Shield,
    Mail,
    MessageSquare,
    FileText,
    Users,
    Database,
    Bell,
    CreditCard,
    ShieldCheck,
    Workflow,
} from "lucide-react";
import { PermissionSlugs } from "@/app/security/permission-slugs";

// Single Source of Truth for Settings Tabs
// Each entry maps a tab ID to its metadata and permission requirement.
// These are OPERATION permissions (Read/View), not Access permissions.

export const SETTINGS_REGISTRY = [
    {
        title: "Ümumi Tənzimləmələr",
        items: [
            { id: "general", label: "Şirkət Profili", icon: Settings, permission: PermissionSlugs.SYSTEM.SETTINGS.GENERAL.READ },
            { id: "notifications", label: "Bildiriş Qaydaları", icon: Bell, permission: PermissionSlugs.SYSTEM.SETTINGS.NOTIFICATIONS.READ },
        ]
    },
    {
        title: "Kommunikasiya",
        items: [
            { id: "smtp", label: "SMTP (Email)", icon: Mail, permission: PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ },
            { id: "sms", label: "SMS Gateway", icon: MessageSquare, permission: PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ },
        ]
    },
    {
        title: "Təhlükəsizlik & Giriş",
        items: [
            { id: "security", label: "Təhlükəsizlik Siyasəti", icon: Shield, permission: PermissionSlugs.SYSTEM.SETTINGS.SECURITY.READ },
            { id: "sso", label: "SSO & OAuth", icon: ShieldCheck, permission: PermissionSlugs.SYSTEM.SETTINGS.SECURITY.READ },
            { id: "roles", label: "İstifadəçi hüquqları", icon: Users, permission: PermissionSlugs.SYSTEM.ROLES.READ },
        ]
    },
    {
        title: "Sistem Konfiqurasiyası",
        items: [
            { id: "billing-config", label: "Billing Konfiqurasiyası", icon: CreditCard, permission: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.READ },
            { id: "dictionaries", label: "Soraqçalar (Dictionaries)", icon: Database, permission: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.DICTIONARIES.READ },
            { id: "templates", label: "Sənəd Şablonları", icon: FileText, permission: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.TEMPLATES.READ },
            { id: "workflow", label: "İş Prosesləri (Workflow)", icon: Workflow, permission: PermissionSlugs.SYSTEM.SETTINGS.CONFIG.WORKFLOW.READ },
        ]
    }
] as const;

export const getAllSettingsTabs = () => {
    return SETTINGS_REGISTRY.flatMap(group => group.items);
};
