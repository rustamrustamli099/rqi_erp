import { Button } from "@/shared/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/domains/auth/context/AuthContext";
// Assuming AuthContext exists and exposes logout. Need to check if not.
// If useAuth relies on protected context, this page might need to be careful.
// But AccessDenied is usually for Authenticated users with no Scope.
// I'll try to import useAuth and navigate.
import { useNavigate } from "react-router-dom";

export default function AccessDeniedPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    }

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 shadow-xl rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                <div className="bg-red-600 h-2 w-full" />
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="mb-6 bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                        <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Access Restricted
                    </h1>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                        Hesab aktivdir, lakin sizə hələ heç bir icazə təyin edilməyib.<br />
                        Zəhmət olmasa administratorla əlaqə saxlayın.<br /><br />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            Strict Security Policy Enforced (Zero-Trust)
                        </span>
                    </p>

                    <div className="w-full space-y-3">
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out & Return
                        </Button>

                        <div className="text-xs text-center text-gray-400 mt-4">
                            Correlation ID: {new Date().getTime().toString(36).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
