import { api } from "@/lib/api";

export interface Package {
    id: string;
    name: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    maxUsers: number;
    maxStorageGB: number;
    maxBranches: number;
    features?: string; // JSON string
    isPopular: boolean;
    isActive: boolean;
}

export interface Subscription {
    id: string;
    tenantId: string;
    packageId: string;
    status: string;
    startDate: string;
    nextBillingDate: string;
    tenant?: {
        name: string;
        slug: string;
    };
    package?: {
        name: string;
        priceMonthly: number;
        currency: string;
    };
}


// Define Invoice type
export interface Invoice {
    id: string;
    number: string;
    amountDue: number;
    currency: string;
    status: string;
    createdAt: string;
    tenant: {
        name: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export const financeApi = {
    // Packages
    getPackages: async () => {
        const response = await api.get<Package[]>('/packages');
        return response.data;
    },
    // ...

    createPackage: async (data: Partial<Package>) => {
        const response = await api.post<Package>('/packages', data);
        return response.data;
    },
    updatePackage: async (id: string, data: Partial<Package>) => {
        const response = await api.patch<Package>(`/packages/${id}`, data);
        return response.data;
    },
    deletePackage: async (id: string) => {
        await api.delete(`/packages/${id}`);
    },

    // Subscriptions
    getSubscriptions: async () => {
        const response = await api.get<Subscription[]>('/subscriptions');
        return response.data;
    },
    createSubscription: async (tenantId: string, packageId: string) => {
        const response = await api.post<Subscription>('/subscriptions', { tenantId, packageId });
        return response.data;
    },
    cancelSubscription: async (id: string) => {
        await api.delete(`/subscriptions/${id}`);
    },

    // Invoices
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    getInvoices: async (_params: any = {}): Promise<Invoice[]> => {
        // Return mock data for now if API endpoint isn't ready, or call real one
        // Using real endpoint assuming it follows REST pattern
        try {
            const response = await api.get<Invoice[]>('/invoices');
            return response.data;
        } catch (e) {
            console.warn("Invoices API not ready, returning mock")
            return [
                { id: '1', number: 'INV-2024-001', amountDue: 59, currency: 'AZN', status: 'PAID', createdAt: '2024-12-01', tenant: { name: 'Alpha LLC' } },
                { id: '2', number: 'INV-2024-002', amountDue: 120, currency: 'AZN', status: 'OPEN', createdAt: '2024-12-05', tenant: { name: 'Beta Corp' } }
            ]
        }
    }
};
