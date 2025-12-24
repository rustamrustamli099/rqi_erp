
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Role } from "../types";
import { api } from "@/shared/lib/api";

// Mock Data if API fails
const MOCK_ROLES: Role[] = [
    { id: "admin", name: "Admin", description: "Full Access", scope: "SYSTEM", status: "ACTIVE", permissions: ["*"] },
    { id: "manager", name: "Manager", description: "Department Manager", scope: "TENANT", status: "ACTIVE", permissions: ["system.tenants.view"] }
];

export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log("Fetching roles...");
            // Corrected endpoint to match backend RolesController
            const res = await api.get<any>("/admin/roles");
            console.log("Roles Response:", res);

            // Check if response is paginated { items: [], meta: ... } or direct array
            // Logs show structure: res.data -> { data: { items: [...] }, statusCode: ... }
            const responseData = res.data;
            let rolesData = [];

            if (responseData.data && responseData.data.items && Array.isArray(responseData.data.items)) {
                // Nested within standard API wrapper: { data: { items: [] } }
                rolesData = responseData.data.items;
            } else if (responseData.items && Array.isArray(responseData.items)) {
                // Direct pagination: { items: [] }
                rolesData = responseData.items;
            } else if (Array.isArray(responseData)) {
                // Direct array: []
                rolesData = responseData;
            } else if (responseData.data && Array.isArray(responseData.data)) {
                // Wrapper with direct array: { data: [] }
                rolesData = responseData.data;
            } else {
                console.warn("Unexpected rol response structure:", responseData);
            }

            console.log("Parsed Roles Data:", rolesData);
            setRoles(rolesData);
        } catch (err: any) {
            console.error("Fetch Roles Error:", err);
            // Fallback to mock for dev
            if (roles.length === 0) setRoles(MOCK_ROLES);
        } finally {
            setIsLoading(false);
        }
    }, [roles.length]);

    // Initial fetch
    useEffect(() => {
        fetchRoles();
    }, []);

    const createRole = async (data: Role) => {
        try {
            await api.post("/admin/roles", data);
            toast.success("Rol yaradıldı");
            fetchRoles();
        } catch (e: any) {
            toast.error("Xəta baş verdi: " + e.message);
        }
    };

    const updateRole = async (id: string, data: Partial<Role>) => {
        try {
            await api.patch(`/admin/roles/${id}`, data);
            toast.success("Rol yeniləndi");
            fetchRoles();
        } catch (e: any) {
            toast.error("Xəta: " + e.message);
        }
    };

    const updateRolePermissions = async (id: string, permissions: string[]) => {
        try {
            await api.put(`/admin/roles/${id}/permissions`, { permissions });
            toast.success("İcazələr yeniləndi");
            fetchRoles();
        } catch (e: any) {
            toast.error("Xəta: " + e.message);
        }
    };

    const deleteRole = async (id: string) => {
        try {
            await api.delete(`/admin/roles/${id}`);
            toast.success("Rol silindi");
            fetchRoles();
        } catch (e: any) {
            toast.error("Xəta: " + e.message);
        }
    };

    // Approval Workflow
    const submitRole = async (id: string, reason: string, diff: any) => {
        try {
            await api.post(`/admin/iam/role-approvals`, { roleId: id, reason, diff });
            toast.success("Təsdiqə göndərildi");
            fetchRoles();
        } catch (e: any) {
            toast.error("Xəta: " + e.message);
        }
    };

    const approveRole = async (id: string) => {
        try {
            await api.post(`/admin/iam/role-approvals/${id}/approve`, {});
            toast.success("Təsdiqləndi");
            fetchRoles();
        } catch (e: any) {
            toast.error("Xəta: " + e.message);
        }
    };

    const rejectRole = async (id: string, reason: string) => {
        try {
            await api.post(`/admin/iam/role-approvals/${id}/reject`, { reason });
            toast.success("İmtina edildi");
            fetchRoles();
        } catch (e: any) {
            toast.error("Xəta: " + e.message);
        }
    };


    return {
        roles,
        isLoading,
        error,
        fetchRoles,
        createRole,
        updateRole,
        deleteRole,
        updateRolePermissions,
        submitRole,
        approveRole,
        rejectRole
    };
}
