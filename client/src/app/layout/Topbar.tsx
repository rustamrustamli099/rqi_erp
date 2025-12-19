import { Bell, Search, Moon, Sun, Globe } from "lucide-react"
import { MobileSidebar } from "./Sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/shared/components/ui/theme-provider"
import { useTranslation } from "react-i18next"
import { languages } from "@/locales"

import { useNavigate } from "react-router-dom"
import { useNotifications } from "@/shared/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { az } from "date-fns/locale"
import { ModuleHelpTrigger } from "@/shared/components/ui/ModuleHelpTrigger"

export function Topbar() {
    const { setTheme, theme } = useTheme()
    const { i18n } = useTranslation()
    const navigate = useNavigate()

    // Notifications Logic
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }

    const handleNotificationClick = (id: string, link?: string) => {
        markAsRead(id)
        if (link) navigate(link)
    }

    return (
        <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <MobileSidebar />
                <div className="flex items-center flex-1 max-w-xl gap-2 hidden md:flex mx-auto">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search across tenants, projects, or employees..."
                        className="h-9 border-none bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <ModuleHelpTrigger />
                {/* Theme Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")} className={theme === "light" ? "bg-accent text-accent-foreground" : ""}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} className={theme === "dark" ? "bg-accent text-accent-foreground" : ""}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")} className={theme === "system" ? "bg-accent text-accent-foreground" : ""}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="flex items-center justify-between px-4 py-2 border-b">
                            <DropdownMenuLabel className="p-0">Bildirişlər</DropdownMenuLabel>
                            {unreadCount > 0 && (
                                <span
                                    className="text-xs text-primary cursor-pointer hover:underline"
                                    onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                                >
                                    Hamısını oxunmuş et
                                </span>
                            )}
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-sm text-center text-muted-foreground py-8">
                                    Yeni bildiriş yoxdur
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                                        onClick={() => handleNotificationClick(notification.id, notification.link)}
                                    >
                                        <div className="flex w-full justify-between items-start">
                                            <span className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </span>
                                            {!notification.read && <span className="h-2 w-2 bg-blue-500 rounded-full" />}
                                        </div>
                                        <span className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/70 mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: az })}
                                        </span>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Language Switcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={i18n.language === lang.code ? "bg-accent text-accent-foreground" : ""}
                            >
                                {lang.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown Removed */}

            </div>
        </div>
    )
}
