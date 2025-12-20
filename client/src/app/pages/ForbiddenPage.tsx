import { ShieldAlert, ArrowLeft, LayoutDashboard, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-sm p-8 md:p-12 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-destructive/10 text-destructive w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight mb-3">Access Denied</h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    You do not have sufficient permissions to access this page.
                    If you believe this is an error, please contact your system administrator.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button variant="outline" size="lg" className="min-w-[140px] gap-2" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                    <Button size="lg" className="min-w-[140px] gap-2" onClick={() => navigate('/')}>
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Button>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-amber-600/80">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Security Event Logged</span>
                    </div>
                    <p className="text-xs opacity-70">
                        Error Code: 403_FORBIDDEN | Session ID: {Math.random().toString(36).substring(7)}
                    </p>
                </div>
            </div>
        </div>
    );
}
