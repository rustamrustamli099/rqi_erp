
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { HelpCircle, PlayCircle, BookOpen, ExternalLink } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { VideoPlayerDialog } from "@/shared/components/ui/VideoPlayerDialog";

export function ModuleHelpTrigger() {
    const location = useLocation();
    const navigate = useNavigate();
    const [videoOpen, setVideoOpen] = useState(false);

    // Mock Context Logic - In real app, this comes from backend or route meta
    const getContext = () => {
        const path = location.pathname;
        if (path.includes('users')) return { title: "İstifadəçilər Modulu", video: "https://www.youtube.com/embed/dQw4w9WgXcQ" };
        if (path.includes('billing')) return { title: "Billing & Ödənişlər", video: null };
        if (path.includes('monitoring')) return { title: "Monitorinq Paneli", video: "https://www.youtube.com/embed/dQw4w9WgXcQ" };
        return { title: "Sistem Bələdçisi", video: null };
    };

    const context = getContext();

    return (
        <>
            <VideoPlayerDialog
                open={videoOpen}
                onOpenChange={setVideoOpen}
                title={context.title}
                videoUrl={context.video || ""}
                sourceType="youtube"
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                        <HelpCircle className="h-5 w-5" />
                        <span className="sr-only">Kömək</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col">
                        <span>Kömək & Dəstək</span>
                        <span className="text-[10px] font-normal text-muted-foreground">{context.title}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {context.video && (
                        <DropdownMenuItem onClick={() => setVideoOpen(true)}>
                            <PlayCircle className="mr-2 h-4 w-4 text-blue-500" />
                            <span>Video Təlimat</span>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigate('/admin/guide/platform')}>
                        <BookOpen className="mr-2 h-4 w-4 text-green-500" />
                        <span>Bələdçini Aç</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.open('https://support.rqi.az', '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Dəstək Mərkəzi</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
