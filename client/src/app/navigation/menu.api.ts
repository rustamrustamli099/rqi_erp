import { api } from "@/lib/api";

export interface MenuItem {
    id: string;
    title: string;
    icon?: string;
    path?: string;
    children?: MenuItem[];
    badge?: number;
    permission?: { slug: string };
}

export const MenusService = {
    getSidebar: async (): Promise<MenuItem[]> => {
        // The backend returns a nested structure wrapped in the Menu model
        // { id, name, items: [...] }
        const response = await api.get('/menus/sidebar');
        // Robust handling:
        // 1. Direct array: response.data
        // 2. Wrapped array: response.data.data
        // 3. Object with items: response.data.items
        // 4. Wrapped object with items: response.data.data.items 

        const rawData = response.data;
        if (Array.isArray(rawData)) return rawData;
        if (Array.isArray(rawData?.data)) return rawData.data;
        if (Array.isArray(rawData?.items)) return rawData.items;
        if (Array.isArray(rawData?.data?.items)) return rawData.data.items;

        return [];
    }
};
