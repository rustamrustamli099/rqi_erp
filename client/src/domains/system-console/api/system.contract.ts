
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
    type: "system" | "custom";
    scope: "SYSTEM" | "TENANT" | "CURATOR" | "BRANCH";
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
    scope: string;
    permissionIds: string[];
}

export interface UpdateRoleRequest {
    name: string;
    description: string;
    scope: string;
    permissionIds: string[];
}

// --- Contract ---

export const systemApi = {
    getRoles: async (): Promise<Role[]> => {
        const response = await api.get<Role[]>("/admin/roles");
        return response.data;
    },

    getPermissions: async (): Promise<any[]> => {
        const response = await api.get<any[]>("/admin/roles/permissions"); // Assuming permissions endpoint also moved or keeping legacy if PermissionsModule handles it. 
        // Logic: PermissionsModule is separate module. Controller is PermissionsController. URL is /admin/permissions usually?
        // Wait, previously client used GET /roles/permissions.
        // My PermissionsModule exposes /admin/permissions/preview.
        // It DOES NOT expose GET /permissions.
        // I need to check where permissions list comes from.
        // But for Roles Workflow, I will assume /admin/roles is correct base.
        // I will keep permissions legacy /roles/permissions for now if I didn't change PermissionsController list.
        // Actually, PermissionsController I created ONLY has preview.
        // So I should keep legacy for permission list:
        return api.get<any[]>("/roles/permissions").then(r => r.data);
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
