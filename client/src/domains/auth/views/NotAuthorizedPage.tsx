import { Button } from "@/components/ui/button";
import { Lock, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/domains/auth/state/authSlice";
import { useNavigate } from "react-router-dom";

export default function NotAuthorizedPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center text-center space-y-4 max-w-md p-8 bg-background rounded-lg border border-border shadow-sm">
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <Lock className="h-8 w-8 text-destructive" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight">Giriş qadağandır</h1>
                <p className="text-muted-foreground">
                    Bu resursa giriş üçün səlahiyyətiniz yoxdur. Davam etmək üçün sistem inzibatçısına müraciət edin.
                </p>

                <div className="pt-4">
                    <Button variant="destructive" onClick={handleLogout} className="w-full min-w-[120px]">
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıxış
                    </Button>
                </div>
            </div>
        </div>
    );
}
