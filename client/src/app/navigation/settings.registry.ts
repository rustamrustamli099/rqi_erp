/**
 * Settings Registry
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Settings tab-ları üçün UI registry.
 * Permission-lar RBAC_REGISTRY-dən alınır.
 * 
 * DİQQƏT: UI strukturu burada saxlanılır, permission mənbəyi RBAC_REGISTRY-dir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

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
import { RBAC_REGISTRY } from "@/app/security/rbac.registry";

// Get permissions from RBAC_REGISTRY
const settingsTabs = RBAC_REGISTRY.admin.settings.tabs;

// Helper to get permission safely
const getTabPermission = (tabId: string): string => {
    return settingsTabs?.[tabId]?.permission || '';
};

/**
 * Settings UI Groups
 * - id: URL query param (?tab=xxx)
 * - label: Sidebar label
 * - icon: Lucide icon component
 * - permission: From RBAC_REGISTRY
 */
export const SETTINGS_REGISTRY = [
    {
        title: "Ümumi Tənzimləmələr",
        items: [
            { id: "general", label: "Şirkət Profili", icon: Settings, permission: getTabPermission('general') },
            { id: "notifications", label: "Bildiriş Qaydaları", icon: Bell, permission: getTabPermission('notifications') },
        ]
    },
    {
        title: "Kommunikasiya",
        items: [
            { id: "smtp", label: "SMTP (Email)", icon: Mail, permission: getTabPermission('smtp') },
            { id: "sms", label: "SMS Gateway", icon: MessageSquare, permission: getTabPermission('sms') },
        ]
    },
    {
        title: "Təhlükəsizlik & Giriş",
        items: [
            { id: "security", label: "Təhlükəsizlik Siyasəti", icon: Shield, permission: getTabPermission('security') },
            { id: "sso", label: "SSO & OAuth", icon: ShieldCheck, permission: getTabPermission('sso') },
            { id: "roles", label: "İstifadəçi hüquqları", icon: Users, permission: getTabPermission('roles') },
        ]
    },
    {
        title: "Sistem Konfiqurasiyası",
        items: [
            { id: "billing_config", label: "Billing Konfiqurasiyası", icon: CreditCard, permission: getTabPermission('billing_config') },
            { id: "dictionaries", label: "Soraqçalar (Dictionaries)", icon: Database, permission: getTabPermission('dictionaries') },
            { id: "templates", label: "Sənəd Şablonları", icon: FileText, permission: getTabPermission('templates') },
            { id: "workflow", label: "İş Prosesləri (Workflow)", icon: Workflow, permission: getTabPermission('workflow') },
        ]
    }
] as const;

export const getAllSettingsTabs = () => {
    // Cast to avoid readonly type issues
    return (SETTINGS_REGISTRY as unknown as Array<{ items: Array<unknown> }>).flatMap(group => group.items);
};


/**
 * Get visible settings tabs for a user
 */
export const getVisibleSettingsTabs = (userPermissions: string[]) => {
    // Cast to mutable array to avoid readonly type issues
    const registry = SETTINGS_REGISTRY as unknown as Array<{
        title: string;
        items: Array<{ id: string; label: string; icon: any; permission: string }>;
    }>;

    return registry.map(group => ({
        ...group,
        items: group.items.filter(item => {
            if (!item.permission) return true;
            return userPermissions.some(p =>
                item.permission.startsWith(p) || p.startsWith(item.permission.replace(/\.read$/, ''))
            );
        })
    })).filter(group => group.items.length > 0);
};
