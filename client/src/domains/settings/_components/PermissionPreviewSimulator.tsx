import { useMemo, useState } from "react"
import { SimulatorEngine } from "./simulator-engine"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Lock, CheckCircle2, XCircle, LayoutDashboard, ChevronRight, ChevronDown, ShieldAlert, Search } from "lucide-react"

interface PermissionPreviewSimulatorProps {
    permissions: string[]
    context?: 'admin' | 'tenant'
    className?: string
}

export function PermissionPreviewSimulator({ permissions, context = 'admin', className }: PermissionPreviewSimulatorProps) {
    const simulation = useMemo(() => SimulatorEngine.run(permissions, context), [permissions, context])
    const isAccessDenied = permissions.length === 0;
    const [searchTerm, setSearchTerm] = useState("")

    const filteredRoutes = useMemo(() => {
        if (!searchTerm) return simulation.accessibleRoutes;
        return simulation.accessibleRoutes.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [simulation.accessibleRoutes, searchTerm]);

    if (isAccessDenied) {
        return (
            <div className={cn("grid place-items-center h-[500px] bg-muted/10 border border-border rounded-lg", className)}>
                <div className={cn("text-center space-y-4 max-w-sm p-8 bg-card rounded-xl shadow-sm border border-destructive/20")}>
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Giriş Qadağandır</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Bu istifadəçinin heç bir icazəsi yoxdur. Sistemə daxil olduqda birbaşa
                            <span className="font-mono text-xs bg-destructive/10 text-destructive px-1 py-0.5 rounded mx-1">/access-denied</span>
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
        <div className={cn("grid grid-cols-1 md:grid-cols-[280px_1fr] border border-border rounded-lg overflow-hidden h-[500px] bg-background", className)}>

            {/* LEFT: Menu Preview */}
            <div className="border-r border-border bg-card flex flex-col overflow-hidden h-full">
                <div className="p-3 border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground flex justify-between items-center shrink-0">
                    <span>Menu Preview</span>
                    <Badge variant="outline" className="text-[10px] uppercase">{context}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {simulation.menuTree.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-40">
                            <Lock className="w-8 h-8 mb-2 opacity-20" />
                            <span>Menyu Görünmür</span>
                            <span className="text-[10px] opacity-60">(Dashboard icazəsi yoxdur)</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Recursive Render Helper */}
                            {(() => {
                                const renderMenuItem = (item: any, depth = 0) => {
                                    return (
                                        <div key={item.id} className={cn("space-y-1", depth > 0 && "ml-3 border-l border-border pl-2")}>
                                            <div
                                                className={cn(
                                                    "flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-foreground rounded-md hover:bg-accent/50 transition-colors select-none",
                                                    depth > 0 && "text-xs text-muted-foreground"
                                                )}
                                            >
                                                {item.icon ? (
                                                    typeof item.icon === 'string' ? (
                                                        <span className="w-4 h-4 opacity-70">{item.icon}</span>
                                                    ) : (
                                                        <item.icon className="w-4 h-4 opacity-70" />
                                                    )
                                                ) : depth === 0 ? (
                                                    <LayoutDashboard className="w-4 h-4 opacity-70" />
                                                ) : (
                                                    // Dot for sub-items
                                                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                                )}
                                                <span>{item.label}</span>
                                            </div>

                                            {/* Children */}
                                            {item.children && item.children.length > 0 && (
                                                <div className="space-y-0.5 mt-0.5">
                                                    {item.children.map((child: any) => renderMenuItem(child, depth + 1))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                };

                                return simulation.menuTree.map(item => renderMenuItem(item));
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Stats & details */}
            <div className="bg-background p-6 overflow-y-auto">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-foreground">
                            Simulyasiya Nəticəsi
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Seçilmiş icazələr əsasında istifadəçinin görəcəyi menyu və daxil ola biləcəyi səhifələr.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                            <div className="text-muted-foreground text-xs uppercase font-bold mb-1">Görünən Menyu Elementləri</div>
                            <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                                {simulation.visibleMenuIds.length}
                                <CheckCircle2 className="w-5 h-5 opacity-50" />
                            </div>
                        </div>
                        <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                            <div className="text-muted-foreground text-xs uppercase font-bold mb-1">Əlçatan Səhifələr (Routes)</div>
                            <div className="text-2xl font-bold text-blue-500 flex items-center gap-2">
                                {simulation.accessibleRoutes.length}
                                <ChevronRight className="w-5 h-5 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-foreground">Təsdiqlənmiş Routlar (URL):</div>
                            <div className="relative w-48">
                                <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                <Input
                                    placeholder="Axtar..."
                                    className="h-8 pl-8 text-xs bg-background"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-md p-2 h-40 overflow-y-auto text-xs font-mono text-muted-foreground space-y-1">
                            {filteredRoutes.length > 0 ? (
                                filteredRoutes.map(r => (
                                    <div key={r} className="flex items-center gap-2 hover:bg-accent/30 p-1 rounded">
                                        <span className="text-green-500 font-bold">GET</span>
                                        <span className="text-foreground">{r}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-muted-foreground italic p-2 block text-center">
                                    {searchTerm ? "Nəticə tapılmadı." : "Heç bir səhifəyə giriş yoxdur."}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
