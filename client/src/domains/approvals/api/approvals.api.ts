import { api } from "@/shared/lib/api";

export interface ApprovalItem {
    id: string;
    type: 'ROLE' | 'BILLING' | 'CONTRACT' | 'EXPORT_JOB';
    title: string;
    description?: string;
    status: string;
    riskScore?: string;
    currentStage?: number;
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

    getHistory: async () => {
        const response = await api.get<ApprovalItem[]>('/workflow/history');
        return response.data;
    },

    getDetails: async (id: string) => {
        const response = await api.get(`/workflow/approval-requests/${id}`);
        return response.data;
    },

    approve: async (id: string, type: string, comment?: string) => {
        const response = await api.post(`/admin/approvals/${id}/approve`, { type, comment });
        return response.data;
    },

    reject: async (id: string, type: string, reason: string) => {
        const response = await api.post(`/admin/approvals/${id}/reject`, { type, reason });
        return response.data;
    },

    delegate: async (id: string, targetUserId: string, comment?: string) => {
        const response = await api.post(`/workflow/approval-requests/${id}/delegate`, { targetUserId, comment });
        return response.data;
    },

    escalate: async (id: string, comment?: string) => {
        const response = await api.post(`/workflow/approval-requests/${id}/escalate`, { comment });
        return response.data;
    },

    cancel: async (id: string, reason?: string) => {
        const response = await api.post(`/workflow/approval-requests/${id}/cancel`, { reason });
        return response.data;
    }
};
