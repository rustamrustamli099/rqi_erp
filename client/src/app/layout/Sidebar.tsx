import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logout } from "@/domains/auth/state/authSlice"
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Menu,
    LogOut,
    User,
    RefreshCw,
    ShieldAlert
} from "lucide-react"
import * as LucideIcons from "lucide-react"
import { useMenu } from "@/app/navigation/useMenu";
import { type MenuItem } from "@/app/navigation/menu.definitions";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"

import logo from "@/assets/logo.png"

const DesktopMenuItem = ({
    item,
    collapsed,
    level = 0,
    isOpen,
    onToggle,
    navigate,
    location
}: {
    item: MenuItem,
    collapsed: boolean,
    level?: number,
    isOpen?: boolean,
    navigate: any,
    location: any,
    onToggle?: (label: string) => void
}) => {
    // Determine active state strictly (exact match or child match)
    // Note: item.path is optional for parents
    const isActiveLink = item.path === location.pathname;

    // FORCE FLAT RENDERING: User wants sub-menus to exist in data (for permissions/tabs) 
    // but NOT be displayed in the sidebar. The sidebar should act as a flat list of top-level items.
    const hasChildren = false; // item.children && item.children.length > 0;

    const isChildActive = item.children?.some(c => c.path?.split('?')[0] === location.pathname);
    const isMainActive = isActiveLink || isChildActive;

    // Icon handling: Item has component or string?
    // In new definition it is component. In legacy it might be string. 
    // We cover both.
    let Icon = item.icon as any;
    if (typeof item.icon === 'string') {
        Icon = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
    }

    // Fallback if no icon
    if (!Icon && level === 0) Icon = LucideIcons.Circle;

    const iconSize = level > 0 ? "h-4 w-4" : "h-5 w-5";
    const isSubmenu = level > 0;

    // In-Place Expansion Logic
    if (hasChildren) {
        return (
            <Collapsible
                open={isOpen}
                onOpenChange={() => onToggle && onToggle(item.label)}
                className="w-full"
            >
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 mb-1 h-10 relative group hover:bg-muted/50 overflow-hidden",
                            isMainActive && "bg-primary/15 text-primary font-semibold hover:bg-primary/20",
                            collapsed ? "px-0 justify-center" : "px-4"
                        )}
                        style={!collapsed ? { paddingLeft: `${16 + (level * 12)}px` } : {}}
                        onClick={(e) => {
                            // Fix: Explicitly handle toggle to ensure reliable expansion
                            e.stopPropagation();
                            if (onToggle) onToggle(item.label);
                        }}
                    >
                        {isMainActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary rounded-r-full" />
                        )}
                        {collapsed ? (
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center justify-center w-full h-full relative">
                                            {Icon && <Icon className={cn(iconSize, "shrink-0 transition-all", isSubmenu && "ml-1")} />}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {item.label} (Click to expand)
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <>
                                {Icon && <Icon className={cn(iconSize, "shrink-0")} />}
                                <div className="flex flex-1 items-center justify-between overflow-hidden">
                                    <span className="truncate font-medium">{item.label}</span>
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 shrink-0 transition-transform duration-200",
                                            isOpen ? "rotate-180" : ""
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className={cn("space-y-1 mt-1", collapsed && "bg-muted/10 rounded-md py-1 border border-border/20")}>
                        {item.children?.map((child, idx) => (
                            <DesktopMenuItem
                                key={idx}
                                item={child}
                                collapsed={collapsed}
                                level={level + 1}
                                navigate={navigate}
                                location={location}
                                isOpen={isOpen}
                            />
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        )
    }

    // Leaf Node
    return (
        collapsed ? (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-center mb-1 h-10 px-0 hover:bg-muted/50",
                                isMainActive && "bg-primary/15 text-primary font-semibold hover:bg-primary/20"
                            )}
                            onClick={() => item.path && navigate(item.path)}
                        >
                            <div className="flex items-center justify-center w-full h-full">
                                {Icon && <Icon className={cn(iconSize, "shrink-0 transition-all", isSubmenu && "ml-1")} />}
                            </div>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {item.label}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ) : (
            <Button
                variant="ghost"
                className={cn(
                    "w-full justify-start gap-3 mb-1 h-10 hover:bg-muted/50 relative group",
                    isMainActive && "bg-primary/15 text-primary font-semibold hover:bg-primary/20",
                    "px-4"
                )}
                style={{ paddingLeft: `${16 + (level * 12)}px` }}
                onClick={() => {
                    let targetPath = item.path;
                    // SMART LOGIC: If no path but has children, use first child's path
                    if (!targetPath && item.children && item.children.length > 0) {
                        targetPath = item.children[0].path;
                        console.log("Sidebar: Auto-Resolved Child Path", targetPath);
                    }

                    console.log("Sidebar: Clicked Item", item.label, "Target:", targetPath);

                    if (targetPath) {
                        navigate(targetPath);
                    } else {
                        console.warn("Sidebar: Clicked Item HAS NO PATH & NO CHILDREN", item.label);
                    }
                }}
            >
                {isMainActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary rounded-r-full" />
                )}
                {Icon && <Icon className={cn(iconSize, "shrink-0")} />}
                <span className={cn("truncate font-medium flex-1 text-left", !Icon && "pl-0")}>{item.label}</span>
            </Button>
        )
    )
}

export function Sidebar() {
    return <DesktopSidebar />
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <div className="h-16 flex items-center justify-center border-b border-border/50 bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-primary/20">
                            <img src={logo} alt="Logo" className="object-cover w-full h-full" />
                        </div>
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-bold text-lg">
                            RQI ERP
                        </span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export function DesktopSidebar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()

    const { menu, loading: menuLoading } = useMenu();

    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebarCollapsed")
        return saved ? JSON.parse(saved) : false
    })

    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    const [openBaseMenus, setOpenBaseMenus] = useState<Record<string, boolean>>({
        "Admin Panel": true
    })

    const toggleMenu = (label: string) => {
        setOpenBaseMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }))
    }

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed))
    }, [collapsed])

    const filteredMenuItems = menu || [];
    const loading = menuLoading;

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/api/v1/auth/logout', { method: 'POST' });
        } catch { }
        dispatch(logout())
        navigate('/login')
        setShowLogoutDialog(false)
    }

    return (
        <motion.div
            className={cn(
                "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 relative z-20",
                collapsed ? "w-[80px]" : "w-64"
            )}
        >
            {/* Collapse Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md z-50 hover:bg-accent"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </Button>

            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-3 font-bold text-xl px-4 w-full overflow-hidden whitespace-nowrap">
                    {collapsed ? (
                        <div className="h-9 w-9 relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-primary/20 mx-auto">
                            <img src={logo} alt="Logo" className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-primary/20">
                                <img src={logo} alt="Logo" className="object-cover w-full h-full" />
                            </div>
                            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-bold text-lg">
                                RQI ERP
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                <div className="px-3 space-y-1">
                    {loading ? (
                        <div className="space-y-2 mt-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-10 w-full bg-muted/10 animate-pulse rounded-md",
                                        collapsed ? "w-10 mx-auto" : "w-full"
                                    )}
                                />
                            ))}
                        </div>
                    ) : filteredMenuItems.length > 0 ? (
                        filteredMenuItems.map((item, index) => (
                            <DesktopMenuItem
                                key={index}
                                item={item}
                                collapsed={collapsed}
                                isOpen={openBaseMenus[item.label]}
                                onToggle={toggleMenu}
                                navigate={navigate}
                                location={location}
                            />
                        ))
                    ) : (
                        <div className={cn("flex flex-col items-center justify-center py-12 text-center px-4", collapsed && "hidden")}>
                            <ShieldAlert className="h-8 w-8 text-muted-foreground/50 mb-3" />
                            <p className="text-xs text-muted-foreground mb-3">
                                Naviqasiya menyusu boşdur. Səlahiyyətlərinizi yoxlayın.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs w-full"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="h-3 w-3 mr-2" /> Yenilə
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* User Profile Section - Direct Link */}
            <div className="p-4 border-t border-border/50">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn("w-full justify-start gap-3 p-2 h-auto text-left hover:bg-muted/50", collapsed && "justify-center px-0")}
                        >
                            <Avatar className="h-8 w-8 border border-border shrink-0">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <div className="flex flex-col items-start overflow-hidden w-full">
                                    <span className="text-sm font-medium truncate w-full">Admin User</span>
                                    <span className="text-xs text-muted-foreground truncate w-full">Profilə Keçid</span>
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={10}>
                        <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setShowLogoutDialog(true)}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Çıxış</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Çıxış etmək istədiyinizə əminsiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Sessiyanız sonlandırılacaq və siz giriş səhifəsinə yönləndiriləcəksiniz.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                                Çıxış
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </motion.div>
    )
}
