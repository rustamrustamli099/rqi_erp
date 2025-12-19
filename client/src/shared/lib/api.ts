import axios from 'axios';
import { store } from '@/store'; // Correct path based on directory structure
import { setCredentials, logout } from '@/domains/auth/state/authSlice';

export const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    withCredentials: true, // Important for cookies
});

// Request Interceptor: Add Token
api.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle 401 & Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            window.location.href = '/403';
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint
                // Note: We use a separate axios instance or raw fetch to avoid infinite loops if this fails
                // But using 'api' is risky if /refresh also returns 401. 
                // However, /refresh logic usually doesn't require Bearer token (it uses cookie). 
                // But the interceptor above adds it if it exists. 

                // Let's force no auth header for refresh?
                const rs = await axios.post('http://localhost:3000/api/v1/auth/refresh', {}, {
                    withCredentials: true
                });

                const { access_token } = rs.data?.data || rs.data; // Handle nested structure if any

                // Update Redux
                store.dispatch(setCredentials({
                    token: access_token,
                    user: store.getState().auth.user as any // Keep user, just update token
                }));

                // Update Header
                api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                return api(originalRequest);
            } catch (error: unknown) {
                // If refresh fails, logout
                store.dispatch(logout());
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
