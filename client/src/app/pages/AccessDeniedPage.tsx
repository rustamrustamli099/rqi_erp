import { ShieldAlert, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logout } from "@/domains/auth/state/authSlice";
import { useNavigate } from "react-router-dom";

export default function AccessDeniedPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4 animate-in fade-in zoom-in duration-300">
            <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl shadow-lg border border-border/50">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-2">
                    <ShieldAlert className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Giriş Məhdudlaşdırılıb</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Hesabınız aktivdir, lakin sizə heç bir səlahiyyət təyin edilməyib.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                    <Button
                        variant="destructive"
                        className="w-full sm:w-auto"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıxış Et
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                    Security ID: {Math.random().toString(36).substring(7).toUpperCase()} • RQI ERP Enterprise
                </div>
            </div>
        </div>
    );
}
