
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
        const response = await api.get<Role[]>("/roles");
        return response.data;
    },

    getPermissions: async (): Promise<any[]> => {
        const response = await api.get<any[]>("/roles/permissions");
        return response.data;
    },

    createRole: async (data: CreateRoleRequest): Promise<Role> => {
        const response = await api.post<Role>("/roles", data);
        return response.data;
    },

    updateRole: async (id: string, data: UpdateRoleRequest): Promise<Role> => {
        const response = await api.patch<Role>(`/roles/${id}`, data);
        return response.data;
    },

    deleteRole: async (id: string): Promise<void> => {
        await api.delete(`/roles/${id}`);
    }
};
