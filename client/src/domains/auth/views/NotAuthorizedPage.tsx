
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotAuthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center text-center space-y-4 max-w-md p-8 bg-background rounded-lg border border-border shadow-sm">
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <Lock className="h-8 w-8 text-destructive" />
                </div>
                
                <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
                <p className="text-muted-foreground">
                    You do not have the required permissions to access this specific resource. 
                    Please contact your system administrator if you believe this is an error.
                </p>

                <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                    <Button onClick={() => navigate("/")}>
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
