/**
 * SAP-GRADE Roles API
 * 
 * Cache Strategy: 5 minutes (nadir dəyişir)
 * Tag: 'Roles'
 */

import { baseApi } from './baseApi';

// Types
export interface Role {
    id: string;
    name: string;
    description: string;
    scope: 'SYSTEM' | 'TENANT';
    level: number;
    type: 'system' | 'custom';
    isLocked: boolean;
    isEnabled: boolean;
    usersCount: number;
    version: number;
    status?: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
    permissions?: { id: string; slug: string }[];
    _count?: { userRoles: number };
}

export interface RolesResponse {
    items: Role[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
    };
}

export interface RolesQueryParams {
    scope?: 'SYSTEM' | 'TENANT';
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

// Inject endpoints
export const rolesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ========================================
        // QUERIES
        // ========================================
        getRoles: builder.query<RolesResponse, RolesQueryParams | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                queryParams.append('pageSize', String(params?.pageSize || 100));
                queryParams.append('page', String(params?.page || 1));
                if (params?.scope) queryParams.append('filters[scope]', params.scope);
                if (params?.status) queryParams.append('filters[status]', params.status);
                if (params?.search) queryParams.append('search', params.search);
                return `/admin/roles?${queryParams.toString()}`;
            },
            transformResponse: (response: any): RolesResponse => {
                // Handle nested response structure
                if (response.data?.items) {
                    return { items: response.data.items, meta: response.data.meta || {} };
                }
                if (response.items) {
                    return { items: response.items, meta: response.meta || {} };
                }
                const items = Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [];
                return { items, meta: { total: items.length, page: 1, pageSize: items.length } };
            },
            providesTags: (result) =>
                result?.items
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'Roles' as const, id })),
                        { type: 'Roles', id: 'LIST' },
                    ]
                    : [{ type: 'Roles', id: 'LIST' }],
            keepUnusedDataFor: 300, // 5 min cache
        }),

        getRoleById: builder.query<Role, string>({
            query: (id) => `/admin/roles/${id}`,
            transformResponse: (response: any) => response.data || response,
            providesTags: (result, error, id) => [{ type: 'Roles', id }],
            keepUnusedDataFor: 300,
        }),

        // ========================================
        // MUTATIONS (Invalidate cache)
        // ========================================
        createRole: builder.mutation<Role, Partial<Role>>({
            query: (body) => ({
                url: '/admin/roles',
                method: 'POST',
                body,
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: [{ type: 'Roles', id: 'LIST' }],
        }),

        updateRole: builder.mutation<Role, { id: string; data: Partial<Role> }>({
            query: ({ id, data }) => ({
                url: `/admin/roles/${id}`,
                method: 'PATCH',
                body: data,
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: (result, error, { id }) => [
                { type: 'Roles', id },
                { type: 'Roles', id: 'LIST' },
            ],
        }),

        updateRolePermissions: builder.mutation<Role, { id: string; expectedVersion: number; permissionSlugs: string[]; comment?: string }>({
            query: ({ id, ...body }) => ({
                url: `/admin/roles/${id}/permissions`,
                method: 'PUT',
                body,
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: (result, error, { id }) => [
                { type: 'Roles', id },
                { type: 'Roles', id: 'LIST' },
            ],
        }),

        deleteRole: builder.mutation<void, string>({
            query: (id) => ({
                url: `/admin/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Roles', id },
                { type: 'Roles', id: 'LIST' },
            ],
        }),

        // Workflow
        submitRole: builder.mutation<Role, string>({
            query: (id) => ({
                url: `/admin/roles/${id}/submit`,
                method: 'POST',
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: (result, error, id) => [{ type: 'Roles', id }],
        }),

        approveRole: builder.mutation<Role, string>({
            query: (id) => ({
                url: `/admin/roles/${id}/approve`,
                method: 'POST',
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: (result, error, id) => [
                { type: 'Roles', id },
                { type: 'Roles', id: 'LIST' },
            ],
        }),

        rejectRole: builder.mutation<Role, { id: string; reason: string }>({
            query: ({ id, reason }) => ({
                url: `/admin/roles/${id}/reject`,
                method: 'POST',
                body: { reason },
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: (result, error, { id }) => [{ type: 'Roles', id }],
        }),
    }),
    overrideExisting: false,
});

// Export hooks
export const {
    useGetRolesQuery,
    useGetRoleByIdQuery,
    useLazyGetRolesQuery,
    useLazyGetRoleByIdQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useUpdateRolePermissionsMutation,
    useDeleteRoleMutation,
    useSubmitRoleMutation,
    useApproveRoleMutation,
    useRejectRoleMutation,
} = rolesApi;
