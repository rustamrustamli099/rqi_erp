/**
 * SAP-GRADE API Module - Central Export
 * 
 * Re-exports all API hooks and utilities from modular files.
 * Import from here: import { useGetRolesQuery } from '@/store/api';
 */

// Base API (for store configuration)
export { baseApi, reducerPath, reducer, middleware } from './baseApi';

// Roles API
export {
    rolesApi,
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
    type Role,
    type RolesResponse,
    type RolesQueryParams,
} from './roles.api';

// Permissions API
export {
    permissionsApi,
    useGetPermissionsQuery,
    useGetPermissionsByScopeQuery,
    useLazyGetPermissionsQuery,
    type Permission,
} from './permissions.api';

// Dictionaries API
export {
    dictionariesApi,
    useGetDictionaryQuery,
    useGetCurrenciesQuery,
    useGetCountriesQuery,
    useGetSectorsQuery,
    useGetUnitsQuery,
    useGetTimezonesQuery,
    useLazyGetDictionaryQuery,
    useCreateDictionaryItemMutation,
    useUpdateDictionaryItemMutation,
    useDeleteDictionaryItemMutation,
    type DictionaryItem,
    type Country,
    type Currency,
    type Sector,
    type DictionaryType,
} from './dictionaries.api';

// Cache invalidation utilities
export const invalidateCache = {
    roles: () => baseApi.util.invalidateTags([{ type: 'Roles', id: 'LIST' }]),
    permissions: () => baseApi.util.invalidateTags(['Permissions']),
    dictionaries: (type: string) => baseApi.util.invalidateTags([{ type: 'Dictionaries', id: type }]),
    all: () => baseApi.util.resetApiState(),
};

// Re-export baseApi for advanced usage
import { baseApi } from './baseApi';
export default baseApi;
