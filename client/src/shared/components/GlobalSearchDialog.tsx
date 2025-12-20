import * as React from "react"
import {
    CreditCard,
    LayoutDashboard,
    Settings,
    User,
    Users,
    FileText,
    Building2,
    Shield,
    HardDrive,
    Search
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useNavigate } from "react-router-dom"
import { usePermissions } from "@/app/auth/hooks/usePermissions"
import { PermissionSlugs } from "@/app/security/permission-slugs"

export function GlobalSearchDialog() {
    const [open, setOpen] = React.useState(false)
    const navigate = useNavigate()
    const { can } = usePermissions()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
                if (
                    (e.target instanceof HTMLElement && e.target.isContentEditable) ||
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLSelectElement
                ) {
                    return
                }

                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Axtarış üçün yazın..." />
            <CommandList>
                <CommandEmpty>Nəticə tapılmadı.</CommandEmpty>

                <CommandGroup heading="Modullar">
                    <CommandItem
                        onSelect={() => runCommand(() => navigate("/admin/dashboard"))}
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Məlumat Paneli</span>
                        <CommandShortcut>🏠</CommandShortcut>
                    </CommandItem>

                    {can(PermissionSlugs.PLATFORM.USERS.READ) && (
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/admin/users"))}
                        >
                            <Users className="mr-2 h-4 w-4" />
                            <span>İstifadəçilər</span>
                        </CommandItem>
                    )}

                    {can(PermissionSlugs.PLATFORM.TENANTS.READ) && (
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/admin/tenants"))}
                        >
                            <Building2 className="mr-2 h-4 w-4" />
                            <span>Tenantlar</span>
                        </CommandItem>
                    )}

                    {can(PermissionSlugs.PLATFORM.BILLING.READ) && (
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/admin/billing"))}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Bilinq və Maliyyə</span>
                        </CommandItem>
                    )}
                    {can(PermissionSlugs.PLATFORM.APPROVALS.VIEW) && (
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/admin/approvals"))}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Təsdiqləmələr</span>
                        </CommandItem>
                    )}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Parametrlər">
                    <CommandItem
                        onSelect={() => runCommand(() => navigate("/admin/profile"))}
                    >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>

                    {can(PermissionSlugs.PLATFORM.SETTINGS.READ) && (
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/admin/settings"))}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Ayarlar</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    )}
                </CommandGroup>

                <CommandGroup heading="Alətlər">
                    {can(PermissionSlugs.PLATFORM.CONSOLE.READ) && (
                        <CommandItem
                            onSelect={() => runCommand(() => navigate("/admin/console"))}
                        >
                            <HardDrive className="mr-2 h-4 w-4" />
                            <span>Sistem Konsolu</span>
                        </CommandItem>
                    )}
                    <CommandItem
                        onSelect={() => runCommand(() => navigate("/admin/guide"))}
                    >
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Sistem Bələdçisi</span>
                    </CommandItem>
                </CommandGroup>

            </CommandList>
        </CommandDialog>
    )
}
