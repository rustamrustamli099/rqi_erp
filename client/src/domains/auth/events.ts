export const AUTH_EVENTS = {
    USER_LOGGED_IN: 'auth:logged_in',
    USER_LOGGED_OUT: 'auth:logged_out',
    SESSION_EXPIRED: 'auth:session_expired',
} as const;

export interface UserLoggedInPayload {
    userId: string;
    email: string;
    role: string;
    timestamp: string;
}
