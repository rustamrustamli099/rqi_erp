export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CANCELLED';

export type UserSector = {
    id: string;
    name: string;
}

export type Tenant = {
    id: string
    name: string
    tin: string
    contactEmail: string
    contactPhone: string
    website: string
    address: string
    status: TenantStatus
    plan: string // Dynamic from Plan Table (Startup, Enterprise, etc.)
    usersCount: number
    maxUsers: number
    storageUsed: number // GB
    maxStorage: number // GB
    createdAt: string
    contractEndDate: string
    lastPaymentDate: string
    nextPaymentDate: string
    balance: number
    currency: string
    sectorId?: string
    domain?: string
    subdomain?: string
    timezone?: string
}

// --- Address Master Data ---
export interface Country {
    id: string;
    name: string;
    code: string; // ISO code e.g. AZ
    phoneCode: string; // e.g. +994
    latitude?: number;
    longitude?: number;
    isAllowed?: boolean; // Geo-blocking
    cities: City[];
}

export interface City {
    id: string;
    name: string;
    countryId: string;
    latitude?: number;
    longitude?: number;
    districts: District[]; // Rayons/Districts
}

export interface District {
    id: string;
    name: string;
    cityId: string;
    latitude?: number;
    longitude?: number;
    streets: Street[];
}

export interface Street {
    id: string;
    name: string;
    districtId: string;
    latitude?: number;
    longitude?: number;
}

export interface FullAddress {
    countryId: string;
    cityId: string;
    districtId?: string;
    street: string;
    building?: string;
    zipCode?: string;
}
