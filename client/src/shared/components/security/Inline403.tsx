
import React from 'react';
import { Lock } from 'lucide-react';

interface Inline403Props {
    permission?: string;
    message?: string;
}

export const Inline403: React.FC<Inline403Props> = ({
    permission,
    message = "Bu bölməni görmək üçün icazəniz yoxdur." // "You do not have permission to view this section."
}) => {
    const isDev = import.meta.env.DEV;

    return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 my-4">
            <Lock className="w-8 h-8 mb-3 opacity-60" />
            <p className="font-medium text-sm">{message}</p>
            {isDev && permission && (
                <p className="mt-2 text-xs font-mono bg-amber-100 px-2 py-1 rounded">
                    Missing: {permission}
                </p>
            )}
        </div>
    );
};
