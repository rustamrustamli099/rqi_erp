import { ShieldAlert } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 animate-in fade-in zoom-in duration-300">
            <div className="max-w-md w-full text-center space-y-6 p-8 border rounded-lg bg-card shadow-lg">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Giriş məhduddur</h1>
                    <p className="text-muted-foreground">
                        Hesabınız aktivdir, lakin sizə heç bir səlahiyyət təyin edilməyib.
                        <br />
                        Zəhmət olmasa sistem administratoru ilə əlaqə saxlayın.
                    </p>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                    <Button variant="destructive" onClick={handleLogout}>
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
