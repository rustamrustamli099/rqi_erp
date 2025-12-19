
import {
    LayoutDashboard,
    ShieldCheck,
    Settings,
    Users,
    Building,
    Code,
    BookOpen,
    FolderOpen,
    CheckSquare,
    CreditCard,
    TerminalSquare
} from "lucide-react";

export const adminMenu = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin/dashboard"
    },
    {
        label: "Tenants",
        icon: Users,
        href: "/admin/tenants",
        description: "Manage Tenants"
    },
    {
        label: "Bölmələr (Branches)",
        icon: Building,
        href: "/admin/branches"
    },
    {
        label: "İstifadəçilər",
        icon: Users,
        href: "/admin/users"
    },
    {
        label: "Ödənişlər (Billing)",
        icon: CreditCard,
        href: "/admin/billing"
    },
    {
        label: "Təsdiqləmələr",
        icon: CheckSquare,
        href: "/admin/approvals"
    },
    {
        label: "Fayl Meneceri",
        icon: FolderOpen,
        href: "/admin/files"
    },
    {
        label: "Sistem Bələdçisi",
        icon: BookOpen,
        href: "/admin/guide"
    },
    {
        label: "Tənzimləmələr",
        icon: Settings,
        href: "/admin/settings"
    },
    {
        label: "System Console",
        icon: TerminalSquare,
        href: "/admin/console",
        requiredPermission: "system.console.view",
        description: "Core, Security, Jobs"
    },
    {
        label: "Developer Hub",
        icon: Code,
        href: "/admin/developer",
        requiredPermission: "developer.access",
        description: "API, Docs"
    }
];
