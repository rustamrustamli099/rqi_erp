
// Cabinet of Ministers Decree No. 556, December 21, 2018
export const EntrepreneurshipSubjectType = {
    MICRO: 'MICRO',   // < 10 emp, <= 200k
    SMALL: 'SMALL',   // 11-50 emp, 200k < x <= 3000k
    MEDIUM: 'MEDIUM', // 51-250 emp, 3000k < x <= 30000k
    LARGE: 'LARGE'    // > 251 emp, > 30000k
} as const;

export type EntrepreneurshipSubjectType = typeof EntrepreneurshipSubjectType[keyof typeof EntrepreneurshipSubjectType];

export const ENTREPRENEURSHIP_SUBJECTS: { [key in EntrepreneurshipSubjectType]: { label: string; description: string } } = {
    [EntrepreneurshipSubjectType.MICRO]: {
        label: "Mikro Sahibkar",
        description: "İşçilər: 1-10 nəfər, İllik gəlir: ≤ 200 min AZN"
    },
    [EntrepreneurshipSubjectType.SMALL]: {
        label: "Kiçik Sahibkar",
        description: "İşçilər: 11-50 nəfər, İllik gəlir: 200 - 3000 min AZN"
    },
    [EntrepreneurshipSubjectType.MEDIUM]: {
        label: "Orta Sahibkar",
        description: "İşçilər: 51-250 nəfər, İllik gəlir: 3000 - 30000 min AZN"
    },
    [EntrepreneurshipSubjectType.LARGE]: {
        label: "İri Sahibkar",
        description: "İşçilər: 251+ nəfər, İllik gəlir: > 30000 min AZN"
    }
};

export interface Sector {
    id: string;
    name: string;
}

export const MOCK_SECTORS: Sector[] = [
    { id: '1', name: 'Tikinti (Construction)' },
    { id: '2', name: 'Pərakəndə Satış (Retail)' },
    { id: '3', name: 'İT və Texnologiya' },
    { id: '4', name: 'Təhsil' },
    { id: '5', name: 'Səhiyyə' },
    { id: '6', name: 'Logistika' },
    { id: '7', name: 'Kənd Təsərrüfatı' },
    { id: '8', name: 'İstehsalat' }
];

export interface Unit {
    id: string;
    name: string;
    code: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MOCK_UNITS: Unit[] = [
    { id: '1', name: 'Ədəd', code: 'pcs' },
    { id: '2', name: 'Kilogram', code: 'kg' },
    { id: '3', name: 'Metr', code: 'm' },
    { id: '4', name: 'Litr', code: 'l' },
    { id: '5', name: 'Saat', code: 'hr' },
];

export interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
}

export const MOCK_CURRENCIES: Currency[] = [
    { id: '1', code: 'AZN', name: 'Azərbaycan Manatı', symbol: '₼' },
    { id: '2', code: 'USD', name: 'ABŞ Dolları', symbol: '$' },
    { id: '3', code: 'EUR', name: 'Avro', symbol: '€' },
    { id: '4', code: 'TRY', name: 'Türk Lirəsi', symbol: '₺' },
];

export const TIMEZONES = [
    { value: 'Asia/Baku', label: 'Asia/Baku (GMT+4)' },
    { value: 'Europe/Istanbul', label: 'Europe/Istanbul (GMT+3)' },
    { value: 'UTC', label: 'UTC (GMT+0)' },
    { value: 'Europe/London', label: 'Europe/London (GMT+0/+1)' },
    { value: 'America/New_York', label: 'America/New_York (GMT-5/-4)' },
];

// ... (Timezones)

export interface Country {
    id: string;
    name: string;
    cities: City[];
}

export interface City {
    id: string;
    name: string;
    districts: District[];
}

export interface District {
    id: string;
    name: string;
}

export const MOCK_COUNTRIES: Country[] = [
    {
        id: "AZ", name: "Azərbaycan", cities: [
            {
                id: "BAK", name: "Bakı", districts: [
                    { id: "NAS", name: "Nəsimi" },
                    { id: "NAR", name: "Nərimanov" },
                    { id: "YAS", name: "Yasamal" },
                    { id: "SAB", name: "Səbail" },
                    { id: "KHA", name: "Xətai" },
                    { id: "BIN", name: "Binəqədi" }
                ]
            },
            {
                id: "GAN", name: "Gəncə", districts: [
                    { id: "KAP", name: "Kəpəz" },
                    { id: "NIZ", name: "Nizami" }
                ]
            },
            { id: "SUM", name: "Sumqayıt", districts: [] }
        ]
    },
    {
        id: "TR", name: "Türkiyə", cities: [
            { id: "IST", name: "İstanbul", districts: [] },
            { id: "ANK", name: "Ankara", districts: [] }
        ]
    }
];

// --- PERMISSIONS SYSTEM ---
export interface PermissionGroup {
    id: string;
    label: string;
    permissions: { id: string; label: string }[];
}

export const PERMISSIONS: PermissionGroup[] = [
    {
        id: 'admin',
        label: 'Admin Panel',
        permissions: [
            { id: 'admin:tenants:read', label: 'Tenantları Gör' },
            { id: 'admin:tenants:create', label: 'Tenant Yarat' },
            { id: 'admin:tenants:edit', label: 'Tenant Düzəliş Et' },
            { id: 'admin:tenants:delete', label: 'Tenant Sil' },
            // NEW: Curator / Scope logic
            { id: 'admin:tenants:manage-scope', label: 'Tenantları Təyin Et (Curator)' },

            { id: 'admin:users:read', label: 'İstifadəçiləri Gör' },

            // Settings - General
            { id: 'admin:settings:general:read', label: 'Ümumi Tənzimləmələr (Gör)' },
            { id: 'admin:settings:general:edit', label: 'Ümumi Tənzimləmələr (Dəyiş)' },

            // Settings - Soraqçalar (Dictionaries)
            // Sektorlar
            { id: 'admin:settings:dictionaries:sectors:read', label: 'Sektorlar (Gör)' },
            { id: 'admin:settings:dictionaries:sectors:manage', label: 'Sektorlar (İdarə et)' },
            // Ölçü Vahidləri
            { id: 'admin:settings:dictionaries:units:read', label: 'Ölçü Vahidləri (Gör)' },
            { id: 'admin:settings:dictionaries:units:manage', label: 'Ölçü Vahidləri (İdarə et)' },
            // Valyutalar
            { id: 'admin:settings:dictionaries:currencies:read', label: 'Valyutalar (Gör)' },
            { id: 'admin:settings:dictionaries:currencies:manage', label: 'Valyutalar (İdarə et)' },

            // Settings - Roles
            { id: 'admin:settings:roles:read', label: 'Rollar və İcazələr (Gör)' },
            { id: 'admin:settings:roles:create', label: 'Rol Yarat' },
            { id: 'admin:settings:roles:edit', label: 'Rol Düzəliş Et' },
            { id: 'admin:settings:roles:delete', label: 'Rol Sil' },

            // Settings - Security
            { id: 'admin:settings:security:read', label: 'Təhlükəsizlik (Gör)' },
            { id: 'admin:settings:security:edit', label: 'Təhlükəsizlik (Dəyiş)' },

            // Settings - Audit
            { id: 'admin:settings:audit:read', label: 'Audit Loglarını Gör' },

            // Settings - Monitoring
            { id: 'admin:settings:monitoring:read', label: 'Monitorinq (Gör)' },

            // Settings - Backups
            { id: 'admin:settings:backups:read', label: 'Backupları Gör' },
            { id: 'admin:settings:backups:create', label: 'Backup Yarat/Yüklə' },

            // Settings - Notifications
            { id: 'admin:settings:notifications:read', label: 'Bildiriş Ayarları (Gör)' },
            { id: 'admin:settings:notifications:edit', label: 'Bildiriş Ayarları (Dəyiş)' },

            // Settings - Integrations
            { id: 'admin:settings:integrations:read', label: 'İnteqrasiyalar (Gör)' },
            { id: 'admin:settings:integrations:edit', label: 'İnteqrasiyalar (Dəyiş)' },

            // Settings - Global Restrictions
            { id: 'admin:settings:global-restrictions:read', label: 'Qlobal Məhdudiyyətlər (Gör)' },
            { id: 'admin:settings:global-restrictions:manage', label: 'Qlobal Məhdudiyyətlər (İdarə et)' },

            // NEW: Approvals
            { id: 'admin:approvals:read', label: 'Təsdiqləmələri Gör (Inbox)' },
            { id: 'admin:approvals:manage', label: 'Təsdiqləmə (Approve/Reject)' },
            { id: 'admin:approvals:rules:read', label: 'Təsdiq Qaydalarını Gör' },
            { id: 'admin:approvals:rules:manage', label: 'Təsdiq Qaydalarını İdarə Et' },

            // NEW: Document Templates
            { id: 'admin:templates:read', label: 'Şablonları Gör' },
            { id: 'admin:templates:manage', label: 'Şablonları İdarə Et (Yüklə/Sil)' },
        ]
    },
    {
        id: 'hr',
        label: 'İnsan Resursları (HR)',
        permissions: [
            { id: 'hr:employees:read', label: 'İşçiləri Gör' },
            { id: 'hr:employees:create', label: 'İşçi Əlavə Et' },
            { id: 'hr:employees:edit', label: 'İşçi Düzəliş Et' },
            { id: 'hr:attendance:read', label: 'Davamiyyəti Gör' },
            { id: 'hr:payroll:read', label: 'Maaşları Gör' },
        ]
    },
    {
        id: 'finance',
        label: 'Maliyyə',
        permissions: [
            { id: 'finance:invoices:read', label: 'Fakturaları Gör' },
            { id: 'finance:invoices:create', label: 'Faktura Yarat' },
            { id: 'finance:payments:read', label: 'Ödənişləri Gör' },
            { id: 'finance:reports:read', label: 'Hesabatları Gör' },
        ]
    },
    {
        id: 'crm',
        label: 'Müştəri Münasibətləri (CRM)',
        permissions: [
            { id: 'crm:clients:read', label: 'Müştəriləri Gör' },
            { id: 'crm:deals:read', label: 'Əqdləri Gör' },
        ]
    },
    {
        id: 'inventory',
        label: 'Anbar (Inventory)',
        permissions: [
            { id: 'inventory:products:read', label: 'Məhsulları Gör' },
            { id: 'inventory:stock:read', label: 'Qalıqları Gör' },
        ]
    }
];

export const MOCK_PLANS = [
    { id: "p1", name: "Başlanğıc (Basic)", price: 29 },
    { id: "p2", name: "Profesional (Pro)", price: 79 },
    { id: "p3", name: "Korporativ (Enterprise)", price: 199 },
];

export interface Module {
    id: string;
    code: string;
    name: string;
    price: number;
    description: string;
}

export const MOCK_MODULES: Module[] = [
    { id: 'mod_fin', code: 'finance', name: 'Maliyyə', price: 50, description: 'Maliyyə hesabatları, Fakturalar, Ödənişlər' },
    { id: 'mod_hr', code: 'hr', name: 'İnsan Resursları', price: 30, description: 'İşçilər, Davamiyyət, Maaşlar' },
    { id: 'mod_crm', code: 'crm', name: 'CRM', price: 40, description: 'Müştərilər, Əqdlər, Satışlar' },
    { id: 'mod_sup', code: 'supply_chain', name: 'Təchizat', price: 60, description: 'Anbar, Satınalma, Təchizatçılar' },
    { id: 'mod_proj', code: 'projects', name: 'Layihələr', price: 20, description: 'Layihə idarəetməsi, Tapşırıqlar' },
];

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
    isVerified: boolean;
    restrictions?: any;
    scope?: "SYSTEM" | "TENANT" | "CURATOR" | "BRANCH";
}

export const MOCK_USERS: User[] = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: "SuperAdmin",
        status: "Active",
        isVerified: true,
        scope: "SYSTEM"
    },
    {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        role: "TenantAdmin",
        status: "Active",
        isVerified: true,
        scope: "TENANT",
        restrictions: {
            enabled: true,
            schedule: {
                monday: { start: "09:00", end: "18:00", active: true },
                tuesday: { start: "09:00", end: "18:00", active: true },
                wednesday: { start: "09:00", end: "18:00", active: true },
                thursday: { start: "09:00", end: "18:00", active: true },
                friday: { start: "09:00", end: "18:00", active: true },
                saturday: { start: "", end: "", active: false },
                sunday: { start: "", end: "", active: false }
            },
            allowedIps: ["192.168.1.5"]
        }
    },
    {
        id: 3,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "User",
        status: "Inactive",
        isVerified: false,
        scope: "TENANT"
    },
    {
        id: 4,
        name: "Elvin Mammadov (Curator)",
        email: "elvin@curator.az",
        role: "Regional Curator",
        status: "Active",
        isVerified: true,
        scope: "CURATOR"
    }
];

export const MOCK_TENANTS = [
    {
        id: "t1",
        name: "Acme Corp",
        subdomain: "acme",
        status: "ACTIVE",
        planId: "p2",
        sectorId: "1",
        usersCount: 15,
        maxUsers: 50,
        createdAt: "2023-01-15T10:00:00Z",
        contractEndDate: "2024-01-15T10:00:00Z",
        contactEmail: "info@acme.com",
        contactPhone: "+994501234567"
    },
    {
        id: "t2",
        name: "Globex Inc",
        subdomain: "globex",
        status: "INACTIVE",
        planId: "p1",
        sectorId: "3",
        usersCount: 5,
        maxUsers: 10,
        createdAt: "2023-03-10T14:30:00Z",
        contractEndDate: "2023-09-10T14:30:00Z",
        contactEmail: "support@globex.com"
    },
    {
        id: "t3",
        name: "Soylent Corp",
        subdomain: "soylent",
        status: "SUSPENDED",
        planId: "p3",
        sectorId: "8",
        usersCount: 120,
        maxUsers: 200,
        createdAt: "2022-11-20T09:15:00Z",
        contractEndDate: "2025-11-20T09:15:00Z",
        contactEmail: "admin@soylent.com"
    }
];
