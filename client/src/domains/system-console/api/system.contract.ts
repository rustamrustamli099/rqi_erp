
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
    status?: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "REJECTED";
    approverId?: string;
    approvalNote?: string;
    permissions?: SystemPermission[];
    _count?: {
        users: number;
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
    getRoles: async (scope?: "SYSTEM" | "TENANT"): Promise<Role[]> => {
        const query = scope ? `?scope=${scope}` : "";
        const response = await api.get<any>(`/admin/roles${query}`);
        // Backend returns wrapped object { statusCode: 200, data: [...] }
        return Array.isArray(response.data) ? response.data : (response.data.data || []);
    },

    getPermissions: async (): Promise<any[]> => {
        // Correct Endpoint: /admin/permissions
        const response = await api.get<any>("/admin/permissions");
        // Check for wrapped response
        return Array.isArray(response.data) ? response.data : (response.data.data || []);
    },

    getRole: async (id: string): Promise<Role> => {
        const response = await api.get<Role>(`/admin/roles/${id}`);
        return response.data;
    },

    createRole: async (data: CreateRoleRequest): Promise<Role> => {
        const response = await api.post<Role>("/admin/roles", data);
        return response.data;
    },

    updateRole: async (id: string, data: UpdateRoleRequest): Promise<Role> => {
        const response = await api.patch<Role>(`/admin/roles/${id}`, data);
        return response.data;
    },

    deleteRole: async (id: string): Promise<void> => {
        await api.delete(`/admin/roles/${id}`);
    },

    // Workflow
    submitRole: async (id: string): Promise<Role> => {
        const response = await api.post<Role>(`/admin/roles/${id}/submit`);
        return response.data;
    },

    approveRole: async (id: string): Promise<Role> => {
        const response = await api.post<Role>(`/admin/roles/${id}/approve`);
        return response.data;
    },

    rejectRole: async (id: string, reason: string): Promise<Role> => {
        const response = await api.post<Role>(`/admin/roles/${id}/reject`, { reason });
        return response.data;
    }
};
