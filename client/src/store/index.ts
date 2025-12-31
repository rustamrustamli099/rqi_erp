import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '@/domains/auth/api/auth.contract';
import authReducer from '@/domains/auth/state/authSlice';

// SAP-GRADE Modular API
import { baseApi } from './api/baseApi';
// Import all API slices to register endpoints
import './api/roles.api';
import './api/permissions.api';
import './api/dictionaries.api';

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [baseApi.reducerPath]: baseApi.reducer, // SAP-Grade Modular Cache
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(baseApi.middleware), // SAP-Grade Cache Middleware
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export * from './useStore';

