import { api } from "@/shared/lib/api";

export interface ApprovalItem {
    id: string;
    type: 'ROLE' | 'BILLING' | 'CONTRACT';
    title: string;
    description?: string;
    status: string;
    createdAt: string;
    createdBy: {
        id: string;
        email: string;
    };
    metadata?: any;
}

export const approvalsApi = {
    getPending: async () => {
        const response = await api.get<{ items: ApprovalItem[], count: number }>('/admin/approvals/pending');
        return response.data;
    },

    approve: async (id: string, type: string) => {
        const response = await api.post(`/admin/approvals/${id}/approve`, { type });
        return response.data;
    },

    reject: async (id: string, type: string, reason: string) => {
        const response = await api.post(`/admin/approvals/${id}/reject`, { type, reason });
        return response.data;
    }
};
