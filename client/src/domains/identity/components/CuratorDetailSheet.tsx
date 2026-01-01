import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Globe, Building, Briefcase, Eye, Edit3 } from "lucide-react";

/**
 * SAP FIORI STYLE: Curator Detail Sheet
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * READ-ONLY display component for viewing curator assignment details.
 * No form inputs - pure display mode (SAP SM30 style).
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Curator {
    id: string;
    user: string;
    scopeLevel: string;
    targetType: string;
    targetId: string;
    mode: string;
    visibility?: string;
}

interface CuratorDetailSheetProps {
    curator: Curator | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CuratorDetailSheet({ curator, open, onOpenChange }: CuratorDetailSheetProps) {
    if (!curator) return null;

    const scopeConfig: Record<string, { icon: typeof Globe; color: string; bg: string; label: string }> = {
        ADMIN_PANEL: { icon: Shield, color: "text-purple-600", bg: "bg-purple-50", label: "Admin Panel" },
        TENANT_PANEL: { icon: Building, color: "text-blue-600", bg: "bg-blue-50", label: "Tenant Panel" },
    };

    const modeConfig: Record<string, { icon: typeof Eye; color: string; bg: string; label: string }> = {
        READ: { icon: Eye, color: "text-green-600", bg: "bg-green-50", label: "Yalnız Oxu" },
        WRITE: { icon: Edit3, color: "text-amber-600", bg: "bg-amber-50", label: "Oxu və Yaz" },
    };

    const targetConfig: Record<string, { icon: typeof Globe; color: string; label: string }> = {
        SYSTEM: { icon: Globe, color: "text-indigo-600", label: "Sistem" },
        BRANCH: { icon: Building, color: "text-teal-600", label: "Filial" },
        DEPARTMENT: { icon: Briefcase, color: "text-orange-600", label: "Şöbə" },
    };

    const scope = scopeConfig[curator.scopeLevel] || scopeConfig.TENANT_PANEL;
    const mode = modeConfig[curator.mode] || modeConfig.READ;
    const target = targetConfig[curator.targetType] || targetConfig.SYSTEM;
    const ScopeIcon = scope.icon;
    const ModeIcon = mode.icon;
    const TargetIcon = target.icon;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[450px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="space-y-4 pb-6">
                    {/* Curator Avatar & Name Header */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle className="text-xl font-semibold">{curator.user}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-1">
                                <User className="h-4 w-4" />
                                Kurator Təyinatı
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className="my-4" />

                {/* SAP Fiori Style: Object Page Sections */}
                <div className="space-y-6">

                    {/* Section: Scope & Mode */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Səviyyə və Rejim
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Scope Card */}
                            <div className={`p-4 rounded-lg ${scope.bg} border`}>
                                <div className="flex items-center gap-2">
                                    <ScopeIcon className={`h-5 w-5 ${scope.color}`} />
                                    <span className={`font-medium ${scope.color}`}>{scope.label}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Panel Səviyyəsi</p>
                            </div>

                            {/* Mode Card */}
                            <div className={`p-4 rounded-lg ${mode.bg} border`}>
                                <div className="flex items-center gap-2">
                                    <ModeIcon className={`h-5 w-5 ${mode.color}`} />
                                    <span className={`font-medium ${mode.color}`}>{mode.label}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Əməliyyat Rejimi</p>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Section: Target */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Hədəf Məlumatları
                        </h3>
                        <div className="space-y-3">
                            {/* Target Type */}
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-3">
                                    <TargetIcon className={`h-5 w-5 ${target.color}`} />
                                    <div>
                                        <p className="font-medium">{target.label}</p>
                                        <p className="text-xs text-muted-foreground">Hədəf Növü</p>
                                    </div>
                                </div>
                                <Badge variant="outline">{curator.targetType}</Badge>
                            </div>

                            {/* Target ID */}
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm">Hədəf ID</span>
                                </div>
                                <span className="text-sm font-medium font-mono">
                                    {curator.targetId}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Section: Visibility */}
                    {curator.visibility && (
                        <>
                            <Separator />
                            <section className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    Görünürlük
                                </h3>
                                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                                    <Eye className="h-6 w-6 text-blue-600" />
                                    <div>
                                        <p className="font-medium">
                                            {curator.visibility === 'ALL_READ' ? 'Hamısını Görür' : 'Yalnız Özününküləri'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {curator.visibility === 'ALL_READ'
                                                ? 'Bütün qeydləri görə bilər'
                                                : 'Yalnız özünə bağlı qeydləri görür'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {/* Footer: ID */}
                    <Separator />
                    <div className="text-xs text-muted-foreground text-center py-4">
                        <span className="font-mono">Təyinat ID: {curator.id}</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
