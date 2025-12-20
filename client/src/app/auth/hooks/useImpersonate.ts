
import { useAuth } from '@/domains/auth/context/AuthContext';
import { toast } from 'sonner';

export const useImpersonate = () => {
    const { impersonate, stopImpersonating, isImpersonating, user } = useAuth();

    const startImpersonation = async (userId: string, userName?: string) => {
        try {
            await impersonate(userId);
            toast.success(`Impersonating ${userName || 'user'}...`);
        } catch (err) {
            toast.error("Failed to start impersonation");
        }
    };

    const stop = async () => {
        try {
            await stopImpersonating();
            toast.info("Impersonation ended");
        } catch (err) {
            toast.error("Failed to stop impersonation");
        }
    };

    return {
        impersonate: startImpersonation,
        stopImpersonating: stop,
        isImpersonating,
        currentUser: user
    };
};
