import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { User as UserType } from "../api/identity.contract";

/**
 * SAP FIORI STYLE: User Detail Sheet
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * READ-ONLY display component for viewing user details.
 * No form inputs - pure display mode (SAP SM30 style).
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface UserDetailSheetProps {
    user: UserType | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserDetailSheet({ user, open, onOpenChange }: UserDetailSheetProps) {
    if (!user) return null;

    const statusConfig = {
        Active: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Aktiv" },
        Inactive: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Deaktiv" },
    };

    const status = statusConfig[user.status] || statusConfig.Inactive;
    const StatusIcon = status.icon;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[450px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="space-y-4 pb-6">
                    {/* User Avatar & Name Header */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle className="text-xl font-semibold">{user.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-1">
                                <Mail className="h-4 w-4" />
                                {user.email}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Separator className="my-4" />

                {/* SAP Fiori Style: Object Page Sections */}
                <div className="space-y-6">

                    {/* Section: Status & Role */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Status və Rol
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Status Card */}
                            <div className={`p-4 rounded-lg ${status.bg} border`}>
                                <div className="flex items-center gap-2">
                                    <StatusIcon className={`h-5 w-5 ${status.color}`} />
                                    <span className={`font-medium ${status.color}`}>{status.label}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Hesab Statusu</p>
                            </div>

                            {/* Role Card */}
                            <div className="p-4 rounded-lg bg-blue-50 border">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium text-blue-600">{user.role}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Sistem Rolu</p>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Section: Verification */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Təsdiq Vəziyyəti
                        </h3>
                        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                            {user.isVerified ? (
                                <>
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-600">E-poçt Təsdiqlənib</p>
                                        <p className="text-sm text-muted-foreground">İstifadəçi hesabını təsdiqləyib</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                    <div>
                                        <p className="font-medium text-amber-600">Təsdiqlənməyib</p>
                                        <p className="text-sm text-muted-foreground">Dəvət göndərilməlidir</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <Separator />

                    {/* Section: Activity */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Aktivlik Məlumatları
                        </h3>
                        <div className="space-y-3">
                            {/* Last Active */}
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm">Son Aktivlik</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {user.lastActive || "Məlumat yoxdur"}
                                </span>
                            </div>

                            {/* Current Page */}
                            {user.page && (
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm">Cari Səhifə</span>
                                    </div>
                                    <Badge variant="outline">{user.page}</Badge>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section: Restrictions (if any) */}
                    {user.restrictions && Object.keys(user.restrictions).length > 0 && (
                        <>
                            <Separator />
                            <section className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    Məhdudiyyətlər
                                </h3>
                                <div className="p-4 rounded-lg border bg-amber-50">
                                    <pre className="text-xs text-amber-800 overflow-x-auto">
                                        {JSON.stringify(user.restrictions, null, 2)}
                                    </pre>
                                </div>
                            </section>
                        </>
                    )}

                    {/* Footer: ID */}
                    <Separator />
                    <div className="text-xs text-muted-foreground text-center py-4">
                        <span className="font-mono">ID: {user.id}</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
