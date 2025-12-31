import { axiosInstance } from "@/services/axiosInstance";

export interface PermissionDto {
    id: string;
    slug: string;
    description?: string;
    scope?: 'SYSTEM' | 'TENANT';
}

export const PermissionsApi = {
    getAll: async (scope?: 'SYSTEM' | 'TENANT'): Promise<{ data: PermissionDto[] }> => {
        const url = scope ? `/admin/permissions?scope=${scope}` : '/admin/permissions';
        return axiosInstance.get(url);
    }
};
