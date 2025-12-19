import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, Minus } from "lucide-react"

// Mock Data for Matrix
const ROLES = ["SuperAdmin", "TenantAdmin", "Manager", "HR", "Finance", "User"]
const MODULES = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "İstifadəçilər" },
    { id: "hr", label: "İnsan Resursları" },
    { id: "finance", label: "Maliyyə" },
    { id: "crm", label: "CRM" },
    { id: "inventory", label: "Anbar" },
    { id: "settings", label: "Tənzimləmələr" },
]

// Mock Permission logic
const getPermission = (role: string, module: string) => {
    if (role === "SuperAdmin") return "full"
    if (role === "TenantAdmin") return "full"

    if (role === "HR" && module === "hr") return "full"
    if (role === "HR" && module === "users") return "view"

    if (role === "Finance" && module === "finance") return "full"
    if (role === "Finance" && module === "dashboard") return "view"

    if (role === "Manager" && (module === "crm" || module === "inventory")) return "full"
    if (role === "Manager" && module === "dashboard") return "view"

    if (role === "User" && module === "dashboard") return "view"

    return "none"
}

export function PermissionMatrix() {
    return (
        <div className="rounded-md border bg-card">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">İcazə Matrisi</h3>
                <p className="text-sm text-muted-foreground">Bütün rollar üzrə giriş hüquqlarının icmalı.</p>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Modul / Rol</TableHead>
                        {ROLES.map(role => (
                            <TableHead key={role} className="text-center">{role}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {MODULES.map(module => (
                        <TableRow key={module.id}>
                            <TableCell className="font-medium">{module.label}</TableCell>
                            {ROLES.map(role => {
                                const perm = getPermission(role, module.id)
                                return (
                                    <TableCell key={role + module.id} className="text-center p-2">
                                        <div className="flex justify-center">
                                            {perm === "full" && <Badge className="bg-green-600 hover:bg-green-700 w-8 h-6 flex justify-center"><Check className="w-3 h-3" /></Badge>}
                                            {perm === "view" && <Badge variant="secondary" className="w-8 h-6 flex justify-center"><Check className="w-3 h-3 opacity-50" /></Badge>}
                                            {perm === "none" && <Minus className="w-4 h-4 text-muted-foreground/30" />}
                                        </div>
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="p-4 flex gap-4 text-xs text-muted-foreground border-t bg-muted/20">
                <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 w-4 h-4 p-0" /> <span className="pt-0.5">Tam Giriş</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-4 h-4 p-0" /> <span className="pt-0.5">Yalnız Baxış</span>
                </div>
                <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4" /> <span className="pt-0.5">Giriş Yoxdur</span>
                </div>
            </div>
        </div>
    )
}
