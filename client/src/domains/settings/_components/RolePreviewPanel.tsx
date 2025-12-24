
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Eye, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { calculateUserAccess } from "../utils/permission-preview-engine"; // Import engine
import { Separator } from "@/components/ui/separator";

interface RolePreviewPanelProps {
    roleName: string;
    permissions: string[];
    isLocked?: boolean;
}

export function RolePreviewPanel({ roleName, permissions, isLocked }: RolePreviewPanelProps) {
    const access = useMemo(() => calculateUserAccess(permissions), [permissions]);

    return (
        <div className="h-full flex flex-col space-y-4">
            <Card className="flex-1 flex flex-col border-muted/60 shadow-none bg-muted/5">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            İstifadəçi Nə Görəcək?
                        </CardTitle>
                        {isLocked && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>}
                    </div>
                    <CardDescription className="text-xs">
                        {permissions.length} icazə əsasında hesablanmış görüntü.
                    </CardDescription>
                </CardHeader>

                <ScrollArea className="flex-1">
                    <CardContent className="space-y-6 pt-2">

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-background rounded p-2 border text-center">
                                <span className="block text-xl font-bold text-foreground">{access.stats.visibleMenus}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">Menyu</span>
                            </div>
                            <div className="bg-background rounded p-2 border text-center">
                                <span className="block text-xl font-bold text-foreground">{access.stats.accessibleTabs}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">Tablar</span>
                            </div>
                            <div className="bg-background rounded p-2 border text-center">
                                <span className="block text-xl font-bold text-red-600">{access.riskFlags.length}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">Risklər</span>
                            </div>
                        </div>

                        {/* First Landing */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">İlk Giriş (Landing)</h4>
                            <div className="flex items-center gap-2 p-2 bg-background border rounded-md text-sm font-medium text-green-700">
                                <CheckCircle2 className="w-4 h-4" />
                                {access.firstAllowedRoute || "Giriş Yoxdur (No Access)"}
                            </div>
                        </div>

                        {/* Risk Analysis */}
                        {access.riskFlags.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> Risk Analizi
                                </h4>
                                <div className="space-y-1">
                                    {access.riskFlags.map((perm, i) => (
                                        <div key={i} className="flex items-center gap-2 p-1.5 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                                            <AlertTriangle className="w-3 h-3 shrink-0" />
                                            <span className="truncate" title={perm}>{perm}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Access Map */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Açıq Modullar</h4>
                            {Object.entries(access.visibleTabs).length === 0 ? (
                                <p className="text-sm text-muted-foreground italic pl-1">Heç bir modul görünmür.</p>
                            ) : (
                                <div className="space-y-3">
                                    {Object.entries(access.visibleTabs).map(([path, tabs]) => (
                                        <div key={path} className="space-y-1">
                                            <div className="text-xs font-medium bg-background px-2 py-1 rounded border inline-block">
                                                {path}
                                            </div>
                                            <div className="pl-2 flex flex-wrap gap-1">
                                                {tabs.map(t => (
                                                    <Badge key={t} variant="secondary" className="text-[10px] font-normal">
                                                        {t.replace('tab=', '').replace('&subTab=', ' > ')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </CardContent>
                </ScrollArea>
            </Card>
        </div>
    );
}
