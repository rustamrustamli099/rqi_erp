import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from "@/domains/auth/state/authSlice";

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/api/v1',
        prepareHeaders: (headers) => {
            // Logic to add token if exists in state (for future protected routes)
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: responseBody } = await queryFulfilled;
                    console.log("[AuthApi] Login Response:", responseBody);

                    // Handle NestJS TransformInterceptor wrapping: { statusCode: 201, data: { access_token, user } }
                    // OR raw response if interceptor is disabled.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const payload = (responseBody as any).data || responseBody;

                    if (payload && payload.access_token && payload.user) {
                        console.log("[AuthApi] Dispatching Credentials...", payload.user);
                        dispatch(setCredentials({
                            user: {
                                id: payload.user.id,
                                email: payload.user.email,
                                fullName: payload.user.fullName,
                                role: payload.user.roles?.[0], // Deprecated fallback
                                roles: payload.user.roles || [],
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                permissions: payload.user.permissions || [],
                                isOwner: payload.user.isOwner || payload.isOwner || false,
                            } as any,
                            token: payload.access_token
                        }));
                    } else {
                        console.error("[AuthApi] Unexpected payload structure", payload);
                    }
                } catch (err) {
                    console.error("[AuthApi] Login Failed", err);
                }
            },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        impersonate: builder.mutation<{ access_token: string; user: any }, { userId: string }>({
            query: (body) => ({
                url: '/auth/impersonate',
                method: 'POST',
                body,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Handle wrapped response if interceptor stays
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const payload = (data as any).data || (data as any);

                    if (payload && payload.access_token) {
                        dispatch(setCredentials({
                            user: payload.user,
                            token: payload.access_token
                        }));
                        // Force reload or redirect to clear state/cache
                        window.location.href = '/';
                    }
                } catch (_err) {
                    // Impersonation Failed
                }
            },
        }),
    }),
});

export const { useLoginMutation, useImpersonateMutation } = authApi;
