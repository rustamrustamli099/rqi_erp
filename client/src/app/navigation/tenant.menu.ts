import {
    LayoutDashboard,
    Users,
    CheckSquare,
    BadgeDollarSign,
    CreditCard
} from "lucide-react";

export const tenantMenu = [
    {
        icon: LayoutDashboard,
        label: "İdarə Paneli",
        href: "/dashboard",
    },
    {
        icon: Users,
        label: "İnsan Resursları (HR)",
        href: "/hr/employees",
    },
    {
        icon: CheckSquare,
        label: "Təsdiqləmələr",
        href: "/approvals/inbox",
    },
    {
        icon: BadgeDollarSign,
        label: "Maliyyə",
        href: "/finance/billing",
    },
    {
        icon: CreditCard,
        label: "Ödənişlər (Billing)",
        href: "/finance/billing",
    }
];
