import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Check, Eye, Minus, Shield, Building2, AlertTriangle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { Label } from "@/shared/components/ui/label"
import type { Role } from "@/domains/system-console/api/system.contract";
import { permissionsStructure } from "@/domains/settings/_components/permission-data";
import { getLeafSlugs } from "@/domains/settings/_components/permission-utils";
import type { PermissionNode } from "@/domains/settings/_components/permission-utils";

// Helper to determine access level
const getAccessLevel = (role: Role, moduleNode: PermissionNode): 'full' | 'view' | 'none' => {
    const roleSlugs = (role.permissions || []).map((p: any) => p.permission?.slug || p.slug || p.permissionId || p);
    const moduleSlugs = getLeafSlugs(moduleNode);
    if (moduleSlugs.length === 0) return 'none';
    const coveredSlugs = moduleSlugs.filter(s => roleSlugs.includes(s));
    if (coveredSlugs.length === 0) return 'none';
    if (coveredSlugs.length === moduleSlugs.length) return 'full';
    const hasRead = coveredSlugs.some(s => s.endsWith('.read') || s.endsWith('.view') || s.endsWith('.list'));
    if (hasRead) return 'view';
    return 'none';
}

function MatrixTable({ scope, roles, modules }: { scope: 'SYSTEM' | 'TENANT', roles: Role[], modules: PermissionNode[] }) {
    if (roles.length === 0) {
        return (
            <div className="p-8 text-center border rounded-md bg-muted/10 text-muted-foreground flex flex-col items-center">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                <span>Bu kateqoriyada heç bir rol tapılmadı.</span>
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-card overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px] font-bold sticky left-0 bg-muted/50 z-10 border-r shadow-sm">
                            Rol Adı
                        </TableHead>
                        {modules.map(module => (
                            <TableHead key={module.id} className="text-center font-bold text-foreground min-w-[120px] text-xs">
                                <div className="flex flex-col items-center gap-1">
                                    <span>{module.label}</span>
                                    <span className="text-[9px] text-muted-foreground font-normal">({getLeafSlugs(module).length})</span>
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map(role => (
                        <TableRow key={role.id} className="hover:bg-muted/5">
                            <TableCell className="font-medium sticky left-0 bg-card z-10 border-r shadow-[4px_0_5px_-3px_rgba(0,0,0,0.05)]">
                                {role.name}
                                {role.isLocked && <span className="text-[10px] text-muted-foreground ml-2">(Locked)</span>}
                            </TableCell>
                            {modules.map(module => {
                                const level = getAccessLevel(role, module);
                                return (
                                    <TableCell key={role.id + module.id} className="text-center p-2 border-l">
                                        <div className="flex justify-center">
                                            {level === "full" && <Badge className="bg-green-600/10 text-green-600 hover:bg-green-600/20 border-green-200 w-7 h-7 flex justify-center items-center rounded-md p-0"><Check className="w-3.5 h-3.5" /></Badge>}
                                            {level === "view" && <Badge className="bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 border-blue-200 w-7 h-7 flex justify-center items-center rounded-md p-0"><Eye className="w-3.5 h-3.5" /></Badge>}
                                            {level === "none" && <Minus className="w-3.5 h-3.5 text-muted-foreground/20" />}
                                        </div>
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export function PermissionMatrix({ roles = [] }: { roles?: Role[] }) {
    const [scope, setScope] = useState<'SYSTEM' | 'TENANT'>('SYSTEM');

    // Filter Data
    const relevantRoles = roles.filter(r => (scope === 'SYSTEM' ? (r.scope === 'SYSTEM' || r.type === 'system') : (r.scope === 'TENANT' && r.type !== 'system')));
    const relevantModules = permissionsStructure.filter(n => n.scope === scope || n.scope === 'COMMON');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight">İcazə Matrisi (Live)</h2>
                    <p className="text-muted-foreground">Sistemdəki mövcud rolların və onların modul icazələrinin real zamanlı icmalı.</p>
                </div>

                {/* Radio Group Switcher */}
                <div className="bg-muted/50 p-1.5 rounded-lg border">
                    <RadioGroup defaultValue="SYSTEM" value={scope} onValueChange={(v) => setScope(v as any)} className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SYSTEM" id="r-system" className="text-blue-600 border-blue-600" />
                            <Label htmlFor="r-system" className="cursor-pointer font-medium flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-600" /> System Scope
                            </Label>
                        </div>
                        <div className="w-[1px] h-4 bg-border" />
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="TENANT" id="r-tenant" className="text-orange-600 border-orange-600" />
                            <Label htmlFor="r-tenant" className="cursor-pointer font-medium flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-orange-600" /> Tenant Scope
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            <div className={`rounded-lg border p-4 mb-4 ${scope === 'SYSTEM' ? 'bg-blue-50/30 border-blue-100' : 'bg-orange-50/30 border-orange-100'}`}>
                <h4 className={`font-semibold flex items-center gap-2 ${scope === 'SYSTEM' ? 'text-blue-800' : 'text-orange-800'}`}>
                    {scope === 'SYSTEM' ? <Shield className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    {scope === 'SYSTEM' ? 'System Scope (Admin)' : 'Tenant Scope (Müştəri)'}
                </h4>
                <p className={`text-sm mt-1 ${scope === 'SYSTEM' ? 'text-blue-600' : 'text-orange-600'}`}>
                    {scope === 'SYSTEM'
                        ? 'Platforma səviyyəli rollar. Tenant istifadəçiləri burada göstərilən heç bir modula daxil ola bilməz.'
                        : 'Müştəri tenantları üçün nəzərdə tutulmuş rollar.'}
                </p>
            </div>

            <MatrixTable scope={scope} roles={relevantRoles} modules={relevantModules} />

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {/* Legend same as before... */}
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <Badge className="bg-green-600/10 text-green-600 border-green-200 w-8 h-8 flex justify-center items-center"><Check className="w-4 h-4" /></Badge>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Full Access</span>
                        <span className="text-[10px] text-muted-foreground">Bütün alt-icazələr aktivdir</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <Badge className="bg-blue-600/10 text-blue-600 border-blue-200 w-8 h-8 flex justify-center items-center"><Eye className="w-4 h-4" /></Badge>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Partial / View</span>
                        <span className="text-[10px] text-muted-foreground">Qismən və ya yalnız oxuma</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="w-8 h-8 flex justify-center items-center"><Minus className="w-4 h-4 text-muted-foreground/30" /></div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">No Access</span>
                        <span className="text-[10px] text-muted-foreground">Giriş yoxdur</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
