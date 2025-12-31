/**
 * SAP-GRADE useRoles Hook (RTK Query Wrapper)
 * 
 * Bu hook RTK Query hooks-unu wrap edərək köhnə interface-i saxlayır.
 * Əvvəlki komponentlər refaktor edilmədən işləyə bilir.
 * 
 * Cache: 5 dəqiqə (roles.api.ts-dən)
 */

import { toast } from "sonner";
import {
    useGetRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useUpdateRolePermissionsMutation,
    useSubmitRoleMutation,
    useApproveRoleMutation,
    useRejectRoleMutation,
    type Role,
    type RolesQueryParams,
} from "@/store/api";

// Re-export type for backward compatibility
export type { Role };

export interface UseRolesOptions {
    scope?: 'SYSTEM' | 'TENANT';
    status?: string;
    skip?: boolean;
}

export function useRoles(options: UseRolesOptions = {}) {
    // RTK Query - cached data
    const queryParams: RolesQueryParams = {
        scope: options.scope,
        status: options.status,
    };

    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch
    } = useGetRolesQuery(queryParams, {
        skip: options.skip,
        refetchOnMountOrArgChange: false, // Use cache
    });

    // Mutations with toast notifications
    const [createRoleMutation, { isLoading: isCreating }] = useCreateRoleMutation();
    const [updateRoleMutation, { isLoading: isUpdating }] = useUpdateRoleMutation();
    const [deleteMutation, { isLoading: isDeleting }] = useDeleteRoleMutation();
    const [updatePermsMutation] = useUpdateRolePermissionsMutation();
    const [submitMutation] = useSubmitRoleMutation();
    const [approveMutation] = useApproveRoleMutation();
    const [rejectMutation] = useRejectRoleMutation();

    // Wrapped mutations with toast
    const createRole = async (roleData: Partial<Role>) => {
        try {
            await createRoleMutation(roleData).unwrap();
            toast.success("Rol yaradıldı");
        } catch (e: any) {
            toast.error("Xəta baş verdi: " + (e.data?.message || e.message));
            throw e;
        }
    };

    const updateRole = async (id: string, roleData: Partial<Role>) => {
        try {
            await updateRoleMutation({ id, data: roleData }).unwrap();
            toast.success("Rol yeniləndi");
        } catch (e: any) {
            toast.error("Xəta: " + (e.data?.message || e.message));
            throw e;
        }
    };

    const deleteRole = async (id: string) => {
        try {
            await deleteMutation(id).unwrap();
            toast.success("Rol silindi");
        } catch (e: any) {
            toast.error("Xəta: " + (e.data?.message || e.message));
            throw e;
        }
    };

    const updateRolePermissions = async (
        id: string,
        permissionSlugs: string[],
        expectedVersion: number = 1,
        comment?: string
    ) => {
        try {
            await updatePermsMutation({ id, expectedVersion, permissionSlugs, comment }).unwrap();
            toast.success("İcazələr yeniləndi");
        } catch (e: any) {
            toast.error("Xəta: " + (e.data?.message || e.message));
            throw e;
        }
    };

    const submitRole = async (id: string) => {
        try {
            await submitMutation(id).unwrap();
            toast.success("Təsdiqə göndərildi");
        } catch (e: any) {
            toast.error("Xəta: " + (e.data?.message || e.message));
            throw e;
        }
    };

    const approveRole = async (id: string) => {
        try {
            await approveMutation(id).unwrap();
            toast.success("Təsdiqləndi");
        } catch (e: any) {
            toast.error("Xəta: " + (e.data?.message || e.message));
            throw e;
        }
    };

    const rejectRole = async (id: string, reason: string) => {
        try {
            await rejectMutation({ id, reason }).unwrap();
            toast.success("İmtina edildi");
        } catch (e: any) {
            toast.error("Xəta: " + (e.data?.message || e.message));
            throw e;
        }
    };

    return {
        // Data
        roles: data?.items ?? [],
        meta: data?.meta,

        // Loading states
        isLoading,
        isFetching,
        isCreating,
        isUpdating,
        isDeleting,

        // Error
        error: error as Error | null,

        // Actions
        refetch,           // Manual refetch (RTK Query)
        fetchRoles: refetch, // Backward compat alias
        createRole,
        updateRole,
        deleteRole,
        updateRolePermissions,
        submitRole,
        approveRole,
        rejectRole,
    };
}

// Default export for backward compatibility
export default useRoles;
