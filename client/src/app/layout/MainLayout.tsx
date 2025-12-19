import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { usePermissions } from "@/app/auth/hooks/usePermissions"

interface MainLayoutProps {
    children: React.ReactNode
}

import { useLocation } from "react-router-dom";
import { GlobalFeedbackTrigger } from "@/shared/components/GlobalFeedbackTrigger";
import { GuideDrawer } from "@/domains/system-guide/views/GuideDrawer";
import { GlobalSearchDialog } from "@/shared/components/GlobalSearchDialog";
import { FloatingHelpButton } from "@/shared/components/FloatingHelpButton";

export function MainLayout({ children }: MainLayoutProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user: _user } = usePermissions();
    const location = useLocation();

    // eslint-disable-next-line no-console
    console.log('[MainLayout] Location changed:', location.pathname);

    return (
        <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
            {/* Sidebar: Sticky so it stays visible while scrolling content */}
            <aside className="hidden md:block shrink-0 bg-background z-20">
                <div className="h-full">
                    <Sidebar />
                </div>
            </aside>

            {/* Main Content: Grows with content, enables window scroll */}
            <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                <div className="shrink-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Topbar />
                </div>
                {/* Main Content Area */}
                <main className="flex-1 bg-muted/10 p-4 overflow-y-auto">
                    {children}
                </main>
            </div>
            <GlobalFeedbackTrigger />
            <GuideDrawer />
            <FloatingHelpButton />
            <GlobalSearchDialog />
        </div>
    )
}

