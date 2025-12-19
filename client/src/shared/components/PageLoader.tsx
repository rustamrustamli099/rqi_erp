import { Loader2 } from "lucide-react";

export const PageLoader = () => (
    <div className="flex items-center justify-center h-screen w-full bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);
