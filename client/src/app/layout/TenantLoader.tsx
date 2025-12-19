
// --- Tenant Loader (Context) ---
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PageLoader } from "@/shared/components/PageLoader";

interface TenantContextType {
    tenantId: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings: Record<string, any>;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({ tenantId: null, settings: {}, isLoading: true });

// Move hook to its own file or disable lint for this line if co-location is preferred
// eslint-disable-next-line react-refresh/only-export-components
export const useTenant = () => useContext(TenantContext);

export const TenantLoader = ({ children }: { children: ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tenant, setTenant] = useState<{ id: string | null, settings: any, loading: boolean }>({
        id: null,
        settings: {},
        loading: true
    });

    useEffect(() => {
        // Simulation of fetching tenant config from subdomain or local storage
        const loadTenant = async () => {
            // Mock API call
            await new Promise(r => setTimeout(r, 500));
            setTenant({
                id: 'tenant-1',
                settings: { theme: 'light', modules: ['crm', 'billing'] },
                loading: false
            });
        };
        loadTenant();
    }, []);

    if (tenant.loading) return <PageLoader />;

    return (
        <TenantContext.Provider value={{ tenantId: tenant.id, settings: tenant.settings, isLoading: tenant.loading }}>
            {children}
        </TenantContext.Provider>
    );
};
