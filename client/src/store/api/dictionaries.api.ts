/**
 * SAP-GRADE Dictionaries API
 * 
 * Cache Strategy: 30 minutes (demək olar statik)
 * Tag: 'Dictionaries'
 * 
 * Covers: currencies, countries, sectors, units, timezones, etc.
 */

import { baseApi } from './baseApi';

// Types
export interface DictionaryItem {
    id: string;
    name: string;
    code?: string;
    symbol?: string;
    isActive: boolean;
    isDefault?: boolean;
}

export interface Country extends DictionaryItem {
    isoCode: string;
    phoneCode?: string;
}

export interface Currency extends DictionaryItem {
    symbol: string;
    isoCode: string;
}

export interface Sector extends DictionaryItem {
    parentId?: string;
}

// Dictionary types enum
export type DictionaryType =
    | 'currencies'
    | 'countries'
    | 'sectors'
    | 'units'
    | 'timezones'
    | 'cities'
    | 'districts';

// Inject endpoints
export const dictionariesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Generic dictionary endpoint
        getDictionary: builder.query<DictionaryItem[], DictionaryType>({
            query: (type) => `/admin/dictionaries/${type}`,
            transformResponse: (response: any): DictionaryItem[] =>
                Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [],
            providesTags: (result, error, type) => [{ type: 'Dictionaries', id: type }],
            keepUnusedDataFor: 1800, // 30 min cache
        }),

        // Specific typed endpoints for better DX
        getCurrencies: builder.query<Currency[], void>({
            query: () => '/admin/dictionaries/currencies',
            transformResponse: (response: any): Currency[] =>
                Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [],
            providesTags: [{ type: 'Dictionaries', id: 'currencies' }],
            keepUnusedDataFor: 1800,
        }),

        getCountries: builder.query<Country[], void>({
            query: () => '/admin/dictionaries/countries',
            transformResponse: (response: any): Country[] =>
                Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [],
            providesTags: [{ type: 'Dictionaries', id: 'countries' }],
            keepUnusedDataFor: 1800,
        }),

        getSectors: builder.query<Sector[], void>({
            query: () => '/admin/dictionaries/sectors',
            transformResponse: (response: any): Sector[] =>
                Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [],
            providesTags: [{ type: 'Dictionaries', id: 'sectors' }],
            keepUnusedDataFor: 1800,
        }),

        getUnits: builder.query<DictionaryItem[], void>({
            query: () => '/admin/dictionaries/units',
            transformResponse: (response: any): DictionaryItem[] =>
                Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [],
            providesTags: [{ type: 'Dictionaries', id: 'units' }],
            keepUnusedDataFor: 1800,
        }),

        getTimezones: builder.query<DictionaryItem[], void>({
            query: () => '/admin/dictionaries/timezones',
            transformResponse: (response: any): DictionaryItem[] =>
                Array.isArray(response.data) ? response.data :
                    Array.isArray(response) ? response : [],
            providesTags: [{ type: 'Dictionaries', id: 'timezones' }],
            keepUnusedDataFor: 1800,
        }),

        // Mutations for dictionary management
        createDictionaryItem: builder.mutation<DictionaryItem, { type: DictionaryType; data: Partial<DictionaryItem> }>({
            query: ({ type, data }) => ({
                url: `/admin/dictionaries/${type}`,
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: (result, error, { type }) => [{ type: 'Dictionaries', id: type }],
        }),

        updateDictionaryItem: builder.mutation<DictionaryItem, { type: DictionaryType; id: string; data: Partial<DictionaryItem> }>({
            query: ({ type, id, data }) => ({
                url: `/admin/dictionaries/${type}/${id}`,
                method: 'PATCH',
                body: data,
            }),
            transformResponse: (response: any) => response.data || response,
            invalidatesTags: (result, error, { type }) => [{ type: 'Dictionaries', id: type }],
        }),

        deleteDictionaryItem: builder.mutation<void, { type: DictionaryType; id: string }>({
            query: ({ type, id }) => ({
                url: `/admin/dictionaries/${type}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { type }) => [{ type: 'Dictionaries', id: type }],
        }),
    }),
    overrideExisting: false,
});

// Export hooks
export const {
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
} = dictionariesApi;
