
import React from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LogOut } from 'lucide-react';

export const ImpersonationBanner = () => {
    const { isImpersonating, user, stopImpersonating } = useAuth();

    if (!isImpersonating) return null;

    return (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-md z-50 relative">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-bold">IMPERSONATION MODE</span>
                <span className="opacity-90">— Acting as {user?.email || 'User'}</span>
            </div>
            <Button
                variant="secondary"
                size="sm"
                onClick={stopImpersonating}
                className="bg-white text-amber-600 hover:bg-amber-50 border-none font-semibold flex items-center gap-2"
            >
                <LogOut className="h-4 w-4" />
                Exit Impersonation
            </Button>
        </div>
    );
};
