
import { useMemo, useState } from "react"
import { SimulatorEngine } from "./simulator-engine"
import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Lock, CheckCircle2, XCircle, LayoutDashboard, ChevronRight, ChevronDown, ShieldAlert } from "lucide-react"

interface PermissionPreviewSimulatorProps {
    permissions: string[]
    context?: 'admin' | 'tenant'
    className?: string
}

export function PermissionPreviewSimulator({ permissions, context = 'admin', className }: PermissionPreviewSimulatorProps) {
    const simulation = useMemo(() => SimulatorEngine.run(permissions, context), [permissions, context])
    const isAccessDenied = permissions.length === 0;

    if (isAccessDenied) {
        return (
            <div className={cn("grid place-items-center h-[500px] bg-slate-50 border rounded-lg", className)}>
                <div className="text-center space-y-4 max-w-sm p-8 bg-white rounded-xl shadow-sm border border-red-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Giriş Qadağandır</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Bu istifadəçinin heç bir icazəsi yoxdur. Sistemə daxil olduqda birbaşa
                            <span className="font-mono text-xs bg-red-50 text-red-700 px-1 py-0.5 rounded mx-1">/access-denied</span>
                            səhifəsinə yönləndiriləcək.
                        </p>
                    </div>
                    <div className="pt-2">
                        <Badge variant="destructive" className="px-4 py-1">ACCESS DENIED</Badge>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-[280px_1fr] border rounded-lg overflow-hidden h-[500px] bg-slate-50", className)}>

            {/* LEFT: Menu Preview */}
            <div className="border-r bg-white flex flex-col">
                <div className="p-3 border-b bg-muted/20 text-xs font-semibold uppercase text-muted-foreground flex justify-between items-center">
                    <span>Menu Preview</span>
                    <Badge variant="outline" className="text-[10px]">{context.toUpperCase()}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {simulation.menuTree.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-40">
                            <Lock className="w-8 h-8 mb-2 opacity-20" />
                            <span>Menyu Görünmür</span>
                            <span className="text-[10px] opacity-60">(Dashboard icazəsi yoxdur)</span>
                        </div>
                    ) : (
                        simulation.menuTree.map((item) => (
                            <div key={item.id} className="space-y-1">
                                <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100">
                                    {item.icon ? (
                                        typeof item.icon === 'string' ? (
                                            <span className="w-4 h-4">{item.icon}</span>
                                        ) : (
                                            <item.icon className="w-4 h-4" />
                                        )
                                    ) : (
                                        <LayoutDashboard className="w-4 h-4" />
                                    )}
                                    <span>{item.label}</span>
                                </div>
                                {/* Submenu */}
                                {item.children && (
                                    <div className="pl-6 space-y-0.5 border-l ml-3 my-1 border-slate-200">
                                        {item.children.map(child => (
                                            <div key={child.id} className="px-2 py-1 text-xs text-slate-600 rounded hover:bg-slate-50 cursor-default flex items-center justify-between">
                                                <span>{child.label}</span>
                                                <Badge variant="secondary" className="h-4 px-1 text-[8px] opacity-50">PAGE</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Stats & details */}
            <div className="bg-slate-50 p-6 overflow-y-auto">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            Simulyasiya Nəticəsi
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Seçilmiş icazələr əsasında istifadəçinin görəcəyi menyu və daxil ola biləcəyi səhifələr.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="text-muted-foreground text-xs uppercase font-bold mb-1">Görünən Menyu Elementləri</div>
                            <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                                {simulation.visibleMenuIds.length}
                                <CheckCircle2 className="w-5 h-5 text-green-500 opacity-50" />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="text-muted-foreground text-xs uppercase font-bold mb-1">Əlçatan Səhifələr (Routes)</div>
                            <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                                {simulation.accessibleRoutes.length}
                                <ChevronRight className="w-5 h-5 text-blue-500 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-semibold">Təsdiqlənmiş Routlar (URL):</div>
                        <div className="bg-white border rounded-md p-2 h-40 overflow-y-auto text-xs font-mono text-slate-600 space-y-1">
                            {simulation.accessibleRoutes.length > 0 ? (
                                simulation.accessibleRoutes.map(r => (
                                    <div key={r} className="flex items-center gap-2">
                                        <span className="text-green-500">GET</span>
                                        <span>{r}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-muted-foreground italic">Heç bir səhifəyə giriş yoxdur.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
