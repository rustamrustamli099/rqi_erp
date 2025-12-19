import { api } from "@/shared/lib/api";
import type { Tenant } from "@/types/schema";
// Re-export or just use it.
export type { Tenant };
// The TenantList uses @/types/schema. I'll rely on it.

// Mock data fallback
const MOCK_TENANTS: Tenant[] = [
    {
        id: "1",
        name: "Acme Corp",
        contactEmail: "admin@acme.com",
        contactPhone: "+994500000000",
        website: "https://acme.com",
        status: "ACTIVE",
        createdAt: "2023-01-01",
        tin: "1234567890",
        domain: "acme.rqi.az",
        contractEndDate: "2024-01-01",
        plan: "Enterprise",
        usersCount: 15,
        maxUsers: 100,
        storageUsed: 50,
        maxStorage: 1000,
        lastPaymentDate: "2023-12-01",
        nextPaymentDate: "2024-01-01",
        balance: 0,
        currency: "USD",
        address: "123 Main St"
    },
    {
        id: "2",
        name: "Globex",
        contactEmail: "info@globex.com",
        contactPhone: "+994500000000",
        website: "https://globex.com",
        status: "PENDING", // Changed from INACTIVE to PENDING or SUSPENDED
        createdAt: "2023-02-15",
        tin: "0987654321",
        domain: "globex.rqi.az",
        contractEndDate: "2023-08-01",
        plan: "Startup",
        usersCount: 5,
        maxUsers: 10,
        storageUsed: 2,
        maxStorage: 100,
        lastPaymentDate: "-",
        nextPaymentDate: "-",
        balance: 0,
        currency: "USD",
        address: "456 Tech Park"
    }
];

export const tenantApi = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTenants: async (_params: any = {}) => {
        // Return mock data for now
        return MOCK_TENANTS;
    },

    createTenant: async (data: any): Promise<Tenant> => {
        try {
            const response = await api.post<Tenant>("/tenants", data);
            return response.data;
        } catch (e) {
            console.warn("Mock create tenant");
            // Cast to Tenant to satisfy type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return {
                ...data,
                id: `t${Date.now()}`,
                status: 'PENDING',
                usersCount: 1,
                maxUsers: 5,
                storageUsed: 0,
                maxStorage: 100,
                createdAt: new Date().toISOString().split('T')[0],
                plan: "Pro",
                balance: 0,
                currency: "USD",
                contactEmail: data.email || "test@test.com",
                contactPhone: "+994555555555",
                website: "",
                address: "",
                tin: "0000000001",
                contractEndDate: "2024-12-31",
                lastPaymentDate: "-",
                nextPaymentDate: "-"
            } as Tenant
        }
    },

    updateTenant: async (id: string, data: any): Promise<Tenant> => {
        const response = await api.patch<Tenant>(`/ tenants / ${id} `, data);
        return response.data;
    },

    deleteTenant: async (id: string): Promise<void> => {
        await api.delete(`/ tenants / ${id} `);
    }
};
