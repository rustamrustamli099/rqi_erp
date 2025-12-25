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
import { Shield, Building2, AlertTriangle, Users, Lock, Info, CheckCircle2, Eye, CircleSlash } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"
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
            <div className="p-12 text-center border rounded-lg bg-muted/10 text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
                <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                    <AlertTriangle className="w-8 h-8 text-amber-500 opacity-80" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Rol Tapılmadı</h3>
                <p className="text-sm opacity-70 mt-1 max-w-[300px]">Bu kateqoriyada ({scope}) heç bir rol mövcud deyil.</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                            <TableHead className="w-[220px] min-w-[220px] font-bold sticky left-0 top-0 z-20 bg-background border-r shadow-[4px_0_5px_-3px_rgba(0,0,0,0.05)] text-foreground">
                                Rol Adı
                            </TableHead>
                            {modules.map(module => (
                                <TableHead key={module.id} className="text-center font-semibold text-foreground min-w-[100px] text-xs px-2 cursor-help" title={`${module.label} permissions`}>
                                    <div className="flex flex-col items-center gap-1.5 py-2">
                                        <span className="whitespace-nowrap">{module.label}</span>
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
                                            {getLeafSlugs(module).length}
                                        </span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role, idx) => (
                            <TableRow key={role.id} className={cn("transition-colors hover:bg-muted/5", idx % 2 === 0 ? "bg-background" : "bg-muted/5")}>
                                <TableCell className="font-medium sticky left-0 z-10 bg-background border-r shadow-[4px_0_5px_-3px_rgba(0,0,0,0.05)] py-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate max-w-[160px] font-semibold text-sm text-foreground" title={role.name}>{role.name}</span>
                                            {role.isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80">
                                            <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] font-normal gap-1 bg-muted">
                                                <Users className="w-2.5 h-2.5" />
                                                {(role as any).usersCount ?? role._count?.userRoles ?? 0}
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                {modules.map(module => {
                                    const level = getAccessLevel(role, module);
                                    return (
                                        <TableCell key={role.id + module.id} className="text-center p-0 border-l border-border/20">
                                            <div className="h-full w-full py-4 flex items-center justify-center">
                                                {level === "full" && (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 fill-green-100" />
                                                )}
                                                {level === "view" && (
                                                    <Eye className="w-5 h-5 text-blue-500 fill-blue-50" />
                                                )}
                                                {level === "none" && (
                                                    <CircleSlash className="w-4 h-4 text-muted-foreground/20" />
                                                )}
                                            </div>
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export function PermissionMatrix({ roles = [] }: { roles?: Role[] }) {
    // Filter Data
    const systemRoles = roles.filter(r => r.scope === 'SYSTEM' || r.type === 'system');
    const tenantRoles = roles.filter(r => r.scope === 'TENANT' && r.type !== 'system');

    // Modules by scope
    const systemModules = permissionsStructure.filter(n => n.scope === 'SYSTEM' || n.scope === 'COMMON');
    const tenantModules = permissionsStructure.filter(n => n.scope === 'TENANT' || n.scope === 'COMMON');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">İcazə Matrisi</h2>
                        <p className="text-muted-foreground text-sm">Bütün rolların və onların modullar üzrə icazələrinin real-zamanlı icmalı.</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="SYSTEM" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="SYSTEM" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                            <Shield className="w-4 h-4" /> System Roles
                        </TabsTrigger>
                        <TabsTrigger value="TENANT" className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
                            <Building2 className="w-4 h-4" /> Tenant Roles
                        </TabsTrigger>
                    </TabsList>

                    {/* Legend - Inline */}
                    <div className="flex items-center gap-6 text-xs bg-muted/30 px-4 py-2 rounded-md border text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Tam Giriş</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span>Oxuma</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CircleSlash className="w-4 h-4 text-muted-foreground/50" />
                            <span>Giriş Yoxdur</span>
                        </div>
                    </div>
                </div>

                <TabsContent value="SYSTEM" className="mt-0">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-4 flex gap-3 text-sm text-blue-900">
                        <Info className="w-5 h-5 text-blue-600 shrink-0" />
                        <p>
                            <strong>System Scope:</strong> Bu rollar platforma inzibatçıları üçündür. Onlar yalnız "System" və "Common" modullarına daxil ola bilər.
                        </p>
                    </div>
                    <MatrixTable scope="SYSTEM" roles={systemRoles} modules={systemModules} />
                </TabsContent>

                <TabsContent value="TENANT" className="mt-0">
                    <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 mb-4 flex gap-3 text-sm text-orange-900">
                        <Info className="w-5 h-5 text-orange-600 shrink-0" />
                        <p>
                            <strong>Tenant Scope:</strong> Bu rollar müştəri (tenant) istifadəçiləri üçündür. Onlar yalnız "Tenant" və "Common" modullarına daxil ola bilər.
                        </p>
                    </div>
                    <MatrixTable scope="TENANT" roles={tenantRoles} modules={tenantModules} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
