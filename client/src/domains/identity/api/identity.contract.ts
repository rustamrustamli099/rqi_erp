import { api } from "@/shared/lib/api";

// Define User type to avoid circular dependency
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
    lastActive?: string;
    page?: string;
    isVerified?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    restrictions?: any;
}

import { MOCK_USERS } from "@/shared/constants/reference-data";

export interface CreateUserRequest {
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
    sendInvitation?: boolean;
}

export interface UpdateUserRequest {
    name?: string;
    role?: string;
    status?: "Active" | "Inactive";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    restrictions?: any;
}

export const identityApi = {
    getUsers: async (): Promise<User[]> => {
        try {
            // Try real API - API returns { statusCode, data: [...], timestamp }
            const response = await api.get<User[]>("/users");
            // Extract nested data if present
            const users = (response.data as any)?.data ?? response.data;
            console.log('[identityApi] getUsers result:', users);
            return users;
        } catch (e) {
            console.warn("Using mock users");
            return MOCK_USERS as unknown as User[];
        }
    },

    createUser: async (data: CreateUserRequest): Promise<User> => {
        const response = await api.post<User>("/users", data);
        return response.data;
    },

    updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
        const response = await api.patch<User>(`/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    inviteUser: async (id: number): Promise<void> => {
        await api.post(`/users/${id}/invite`, {});
    }
}
