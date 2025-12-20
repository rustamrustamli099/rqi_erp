
// Basic Permission Logger (SAP-Grade)

export const PermissionLogger = {
    logDenied: (permission: string, userId?: string, context?: string) => {
        console.warn(`[SECURITY] Permission Denied: ${permission}`, {
            userId,
            context,
            timestamp: new Date().toISOString()
        });

        PermissionLogger.sendToBackend({
            eventType: 'PERMISSION_DENIED',
            permission,
            context,
            userId,
            timestamp: new Date().toISOString()
        });
    },

    logAccess: (permission: string, userId?: string) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[SECURITY] Access Granted: ${permission}`, { userId });
        }
    },

    sendToBackend: async (payload: any) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            // Fire-and-forget
            fetch('http://localhost:3000/api/v1/logs/ui-events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            }).catch(err => console.error("Failed to ship log", err));
        } catch (e) {
            // Squelch errors to not block UI
        }
    }
};
