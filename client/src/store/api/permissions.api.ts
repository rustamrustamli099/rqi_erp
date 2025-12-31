/**
 * SAP-GRADE Permissions API
 * 
 * Cache Strategy: 10 minutes (çox nadir dəyişir)
 * Tag: 'Permissions'
 */

import { baseApi } from './baseApi';

// Types
export interface Permission {
    id: string;
    slug: string;
    description?: string;
    scope?: 'SYSTEM' | 'TENANT';
}

// Inject endpoints
export const permissionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPermissions: builder.query<Permission[], void>({
            query: () => '/admin/permissions',
            transformResponse: (response: any): Permission[] =>
                Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [],
            providesTags: ['Permissions'],
            keepUnusedDataFor: 600, // 10 min cache
        }),

        getPermissionsByScope: builder.query<Permission[], 'SYSTEM' | 'TENANT'>({
            query: (scope) => `/admin/permissions?scope=${scope}`,
            transformResponse: (response: any): Permission[] =>
                Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [],
            providesTags: (result, error, scope) => [{ type: 'Permissions', id: scope }],
            keepUnusedDataFor: 600,
        }),
    }),
    overrideExisting: false,
});

// Export hooks
export const {
    useGetPermissionsQuery,
    useGetPermissionsByScopeQuery,
    useLazyGetPermissionsQuery,
} = permissionsApi;
