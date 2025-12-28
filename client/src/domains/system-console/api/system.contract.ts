
import { api } from "@/shared/lib/api";

// --- Types ---

export interface SystemPermission {
    id: string;
    slug: string;
    description: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    // SAP-Grade Fields
    scope: "SYSTEM" | "TENANT";
    level: number;
    // Legacy mapping
    type: "system" | "custom";
    isLocked: boolean;
    isEnabled: boolean;

    usersCount: number;
    version: number;
    status?: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "REJECTED";
    approverId?: string;
    approvalNote?: string;
    permissions?: SystemPermission[];
    _count?: {
        userRoles: number;
    };
}

export interface CreateRoleRequest {
    name: string;
    description: string;
    scope: "SYSTEM" | "TENANT";
    permissionIds?: string[];
}

export interface UpdateRoleRequest {
    name: string;
    description: string;
    scope: string;
    permissionIds: string[];
}

// --- Contract ---

export const systemApi = {
    getRoles: async (params?: any): Promise<{ items: Role[], meta: any }> => {
        // Support both simple scope string or full query object
        const queryParams = new URLSearchParams();
        if (typeof params === 'string') {
            queryParams.append('scope', params);
            queryParams.append('page', '1');
            queryParams.append('pageSize', '100');
        } else if (params) {
            // Search
            if (params.search) queryParams.append('search', params.search);

            // Pagination
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.sortDir) queryParams.append('sortDir', params.sortDir);

            // Filters
            if (params.filters) {
                if (params.filters.scope) queryParams.append('filters[scope]', params.filters.scope);
                if (params.filters.status) queryParams.append('filters[status]', params.filters.status);
            } else {
                // Backward compat: direct props
                if (params.scope) queryParams.append('filters[scope]', params.scope);
                if (params.status) queryParams.append('filters[status]', params.status);
            }
        }

        const response = await api.get<any>(`/admin/roles?${queryParams.toString()}`);
        console.log("DEBUG: systemApi RAW response:", response);

        // Case 1: Direct PaginatedResult { items: [], meta: ... }
        if (response.data && Array.isArray(response.data.items)) {
            return { items: response.data.items, meta: response.data.meta || {} };
        }

        // Case 2: Nested Wrapped PaginatedResult { data: { items: [], meta: ... } } (Current Backend Format)
        if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
            return { items: response.data.data.items, meta: response.data.data.meta || {} };
        }

        // Fallback for flat arrays
        const flatItems = Array.isArray(response.data) ? response.data :
            (Array.isArray(response.data.data) ? response.data.data : []);

        return { items: flatItems, meta: { total: flatItems.length, page: 1, pageSize: flatItems.length } };
    },

    getPermissions: async (): Promise<any[]> => {
        // Correct Endpoint: /admin/permissions
        const response = await api.get<any>("/admin/permissions");
        // Check for wrapped response
        return Array.isArray(response.data) ? response.data : (response.data.data || []);
    },

    getRole: async (id: string): Promise<Role> => {
        const response = await api.get<any>(`/admin/roles/${id}`);
        // Backend returns { statusCode: 200, data: Role }
        return response.data.data || response.data;
    },

    createRole: async (data: CreateRoleRequest): Promise<Role> => {
        const response = await api.post<any>("/admin/roles", data);
        return response.data.data || response.data;
    },

    updateRole: async (id: string, data: UpdateRoleRequest): Promise<Role> => {
        const response = await api.patch<any>(`/admin/roles/${id}`, data);
        return response.data.data || response.data;
    },

    updateRolePermissions: async (id: string, payload: { expectedVersion: number, permissionSlugs: string[], comment?: string }) => {
        const response = await api.put(`/admin/roles/${id}/permissions`, payload);
        return response.data;
    },

    deleteRole: async (id: string): Promise<void> => {
        await api.delete(`/admin/roles/${id}`);
    },

    // Workflow
    submitRole: async (id: string): Promise<Role> => {
        const response = await api.post<any>(`/admin/roles/${id}/submit`);
        return response.data.data || response.data;
    },

    approveRole: async (id: string): Promise<Role> => {
        const response = await api.post<any>(`/admin/roles/${id}/approve`);
        return response.data.data || response.data;
    },

    rejectRole: async (id: string, reason: string): Promise<Role> => {
        const response = await api.post<any>(`/admin/roles/${id}/reject`, { reason });
        return response.data.data || response.data;
    },

    // === GOVERNANCE API ===

    /** Validate permissions for SoD conflicts and risk score */
    governance: {
        validate: async (permissions: string[]): Promise<{
            sodResult: {
                isValid: boolean;
                conflicts: any[];
                criticalCount: number;
                highCount: number;
                mediumCount: number;
            };
            riskScore: {
                score: number;
                level: 'LOW' | 'MEDIUM' | 'HIGH';
                reasons: any[];
            };
            requiresApproval: boolean;
            canProceed: boolean;
            blockedReason?: string;
        }> => {
            const response = await api.post<any>('/governance/validate', { permissions });
            return response.data.data || response.data;
        },

        /** Get pending approvals for current user */
        getPendingApprovals: async (): Promise<any[]> => {
            const response = await api.get<any>('/governance/pending-approvals');
            return Array.isArray(response.data) ? response.data : (response.data.data || []);
        },

        /** Create approval request */
        createApprovalRequest: async (data: {
            entityType: 'ROLE' | 'USER' | 'EXPORT' | 'BILLING';
            entityId: string;
            entityName: string;
            action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
            changes?: { before: any; after: any };
            riskScore?: number;
            riskLevel?: string;
            sodConflicts?: number;
        }): Promise<any> => {
            const response = await api.post<any>('/governance/approval-requests', data);
            return response.data.data || response.data;
        },

        /** Approve a request (4-eyes principle) */
        approve: async (requestId: string, comment?: string): Promise<any> => {
            const response = await api.post<any>(`/governance/approval-requests/${requestId}/approve`, { comment });
            return response.data.data || response.data;
        },

        /** Reject a request (reason required) */
        reject: async (requestId: string, reason: string): Promise<any> => {
            const response = await api.post<any>(`/governance/approval-requests/${requestId}/reject`, { reason });
            return response.data.data || response.data;
        },

        /** Get SoD rules */
        getSodRules: async (): Promise<any[]> => {
            const response = await api.get<any>('/governance/sod-rules');
            return Array.isArray(response.data) ? response.data : (response.data.data || []);
        }
    }
};
