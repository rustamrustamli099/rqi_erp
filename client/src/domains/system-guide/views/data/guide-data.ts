
import { Users, FileText, CreditCard, Box, Settings, Activity } from "lucide-react";

export type GuideNodeType = 'module' | 'submodule' | 'article';

export interface GuideNode {
    id: string;
    type: GuideNodeType;
    title: string;
    icon?: any;
    children?: GuideNode[];
    // Article specific props
    content?: string;
    video?: {
        provider: 'youtube' | 'upload';
        embedUrl: string;
        duration?: number;
    };
    tags?: string[];
    lastUpdated?: string;
}

export const guideData: GuideNode[] = [
    {
        id: "hr-module",
        type: "module",
        title: "HR və İnsan Resursları",
        icon: Users,
        children: [
            {
                id: "hr-onboarding",
                type: "submodule",
                title: "İşə Qəbul (Onboarding)",
                children: [
                    {
                        id: "hr-new-employee",
                        type: "article",
                        title: "Yeni İşçi Kartının Yaradılması",
                        lastUpdated: "2024-12-10",
                        video: {
                            provider: "youtube",
                            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                            duration: 180
                        },
                        content: `
# Yeni İşçi Kartının Yaradılması

Sistemdə yeni işçi yaratmaq üçün aşağıdakı addımları izləyin:

1. **HR Moduluna keçid edin.**
2. Sağ yuxarı küncdə **"Yeni İşçi"** düyməsini sıxın.
3. Açılan pəncərədə tələb olunan sahələri doldurun:
   - Ad, Soyad, Ata adı
   - FİN kod (Avtomatik yoxlama aktivdir)
   - Əlaqə məlumatları
4. **"Yadda Saxla"** düyməsini sıxın.

> **Qeyd:** İşçi yaradıldıqdan sonra ona avtomatik olaraq "Employee" rolu verilir.
                        `
                    },
                    {
                        id: "hr-docs",
                        type: "article",
                        title: "Sənədləşmə Tələbləri",
                        lastUpdated: "2024-11-05",
                        content: `
# İşə Qəbul Sənədləri

Məcəlləyə uyğun olaraq aşağıdakı sənədlər sistemə yüklənməlidir:
- Şəxsiyyət vəsiqəsinin surəti
- Təhsil haqqında diplom
- Sağlamlıq haqqında arayış
                        `
                    }
                ]
            },
            {
                id: "hr-payroll",
                type: "submodule",
                title: "Əmək Haqqı və Tabel",
                children: [
                    {
                        id: "payroll-calc",
                        type: "article",
                        title: "Əmək Haqqı Hesablanması",
                        content: "Əmək haqqı hər ayın 1-5 arası hesablanır..."
                    }
                ]
            }
        ]
    },
    {
        id: "finance-module",
        type: "module",
        title: "Maliyyə və Mühasibatlıq",
        icon: CreditCard,
        children: [
            {
                id: "fin-invoices",
                type: "submodule",
                title: "Fakturalar (Invoices)",
                children: [
                    {
                        id: "fin-create-inv",
                        type: "article",
                        title: "Satış Fakturası Yaratmaq",
                        video: {
                            provider: "youtube",
                            embedUrl: "https://www.youtube.com/embed/xyz123",
                            duration: 120
                        },
                        content: "# Faktura Yaradılması\n\nMüştəri seçin və xidmətləri əlavə edin..."
                    }
                ]
            }
        ]
    },
    {
        id: "sys-admin",
        type: "module",
        title: "Sistem İnzibatçılığı",
        icon: Settings,
        children: [
            {
                id: "sys-users",
                type: "submodule",
                title: "İstifadəçi İdarəetməsi",
                children: [
                    {
                        id: "sys-roles",
                        type: "article",
                        title: "Rollar və İcazələr",
                        content: "# RBAC Sistemi\n\nSistemdə rollar iyerarxikdir..."
                    }
                ]
            }
        ]
    },
    {
        id: "billing-module",
        type: "module",
        title: "Billing & Ödənişlər",
        icon: Activity, // Reuse Activity or CreditCard
        children: [
            {
                id: "billing-packages",
                type: "submodule",
                title: "Paketlər",
                children: [
                    {
                        id: "pkg-create",
                        type: "article",
                        title: "Paketlərin Yaradılması",
                        content: "# Paketlərin İdarə Edilməsi\nYeni paket yaratmaq üçün sehrbazdan (wizard) istifadə edin..."
                    }
                ]
            }
        ]
    }
];
