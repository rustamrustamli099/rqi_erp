import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface User {
    id: string; // Backend uses UUID
    name: string; // used for display
    fullName?: string; // Backend sends this
    email: string;
    // role: string; // DEPRECATED: Use roles[]
    roles: string[]; // Multi-Role
    permissions: string[];
    isOwner?: boolean;
    managedTenantIds?: string[];
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
}

// Mock initial state for development
// Check local storage for existing token
const token = localStorage.getItem('accessToken');
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;

const initialState: AuthState = {
    user: user,
    token: token,
    isAuthenticated: !!token
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = user
            state.token = token
            state.isAuthenticated = true
            localStorage.setItem('accessToken', token)
            localStorage.setItem('user', JSON.stringify(user))
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')
        },
    },
})

export const { setCredentials, logout } = authSlice.actions

export default authSlice.reducer

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selectCurrentUser = (state: any) => state.auth.user;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
