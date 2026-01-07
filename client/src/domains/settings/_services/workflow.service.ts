import { api } from "@/shared/lib/api";

export interface WorkflowStage {
    id: string;
    name: string;
    order: number;
    approvalType: 'SEQUENTIAL' | 'PARALLEL';
    requiredCount: number;
    approverRoleIds: string[];
    approverUserIds: string[];
    requireComment: boolean;
}

export interface WorkflowDefinition {
    id: string;
    name: string;
    entityType: string;
    action: string;
    scope: string;
    isActive: boolean;
    stages: WorkflowStage[];
    createdAt: string;
    updatedAt: string;
}

export interface ApprovalRequest {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    currentStage: number;
    requestedById: string;
    requestedByName?: string;
    createdAt: string;
    riskScore?: string;
    stageExecutions: any[]; // Define more specifically if needed
}

export const workflowService = {
    // Definitions
    getDefinitions: async () => {
        const response = await api.get<{ data: WorkflowDefinition[] }>('/workflow/definitions');
        return response.data.data;
    },

    upsertDefinition: async (config: any) => {
        const response = await api.post<{ data: WorkflowDefinition }>('/workflow/definitions', config);
        return response.data.data;
    },

    // History & Monitoring
    getHistory: async () => {
        const response = await api.get<{ data: ApprovalRequest[] }>('/workflow/history');
        return response.data.data;
    },

    getRequestDetails: async (id: string) => {
        const response = await api.get<{ data: ApprovalRequest & { decisions: any[], auditTrail: any[] } }>(`/workflow/approval-requests/${id}`);
        return response.data.data;
    },

    // Actions
    approve: async (id: string, comment?: string) => {
        const response = await api.post(`/workflow/approval-requests/${id}/approve`, { comment });
        return response.data;
    },

    reject: async (id: string, comment?: string) => {
        const response = await api.post(`/workflow/approval-requests/${id}/reject`, { comment });
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
    },

    // Force Actions (Supervisor) - utilizing the standard endpoints but might be gated by permission
    forceApprove: async (id: string, comment?: string) => {
        // Using the same endpoint, as the backend logic (WorkflowService.processApprovalAction) should handle the permission check / force logic if it was implemented separately,
        // but currently it seems it shares the endpoint. If specific "force" endpoints are needed they should be added to controller.
        // For now assuming force approve uses the same mechanism but with higher leverage permissions.
        // Wait, the controller has specific endpoints? No, just approve/reject.
        // The requirement "Force Actions" likely implies a supervisor bypassing the current approver. 
        // The current backend `processApprovalAction` checks if actor can approve current stage.
        // If "Force" means "Approve even if not in approver list", the backend needs to support it.
        // However, for this task, I will bind to the existing endpoints.
        return api.post(`/workflow/approval-requests/${id}/approve`, { comment });
    },

    forceReject: async (id: string, comment?: string) => {
        return api.post(`/workflow/approval-requests/${id}/reject`, { comment });
    }
};
