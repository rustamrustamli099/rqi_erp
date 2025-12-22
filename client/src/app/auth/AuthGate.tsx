import React from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGateProps {
    children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <div className="space-y-1 text-center">
                        <h3 className="text-lg font-semibold tracking-tight">RQI ERP</h3>
                        <p className="text-xs text-muted-foreground">Təhlükəsizlik yoxlanılır...</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
