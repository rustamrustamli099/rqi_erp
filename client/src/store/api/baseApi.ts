/**
 * SAP-GRADE Base API Configuration
 * 
 * Bu fayl bütün API slice-ların ortaq konfiqurasiyasını saxlayır.
 * Digər API faylları buradan injectEndpoints istifadə edəcək.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API Configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Base API - All endpoints inject here
 * 
 * Tag Types:
 * - Roles: Role data caching
 * - Permissions: Permission tree caching
 * - Dictionaries: Static lookup data
 * - Users: User list (dynamic, short cache)
 * - Tenants: Tenant list (admin only)
 */
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: [
        'Roles',
        'Permissions',
        'Dictionaries',
        'Users',
        'Tenants',
        'FeatureFlags',
        'Settings',
    ],
    endpoints: () => ({}), // Endpoints will be injected
});

// Export reducer and middleware for store
export const { reducerPath, reducer, middleware } = baseApi;
