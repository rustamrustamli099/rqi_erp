import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { Building, Mail, Phone, Globe, Calendar, CreditCard, Database, Users, ShieldAlert, FileText, Activity } from "lucide-react";
import type { Tenant } from "../../api/tenant.contract";

interface TenantDetailSheetProps {
    tenant: Tenant | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TenantDetailSheet({ tenant, open, onOpenChange }: TenantDetailSheetProps) {
    if (!tenant) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <StatusBadge status={tenant.status as any} />
                        <Badge variant="outline" className="font-mono">{tenant.subdomain}.rqi-erp.com</Badge>
                    </div>
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        <Building className="h-6 w-6 text-primary" />
                        {tenant.name}
                    </SheetTitle>
                    <SheetDescription>
                        {tenant.id ? `ID: ${tenant.id}` : ''}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Əlaqə Məlumatları */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Əlaqə Məlumatları
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email:</div>
                                <div className="col-span-2 font-medium break-all">{tenant.contactEmail}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Telefon:</div>
                                <div className="col-span-2 font-medium">{tenant.contactPhone}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Vebsayt:</div>
                                <div className="col-span-2 font-medium break-all">
                                    {tenant.website ? <a href={tenant.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{tenant.website}</a> : '-'}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-muted-foreground">Ünvan:</div>
                                <div className="col-span-2">{tenant.address || '-'}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Müqavilə və Plan */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Müqavilə və Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                <span className="text-sm font-medium">Cari Plan</span>
                                <Badge variant="secondary" className="text-sm">{tenant.plan}</Badge>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground">Başlama Tarixi</span>
                                    <div className="flex items-center gap-1 font-medium text-sm mt-1">
                                        <Calendar className="h-3 w-3" /> {tenant.createdAt}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Bitmə Tarixi</span>
                                    <div className="flex items-center gap-1 font-medium text-sm mt-1">
                                        <Calendar className="h-3 w-3" /> {tenant.contractEndDate}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground">Balans</span>
                                    <div className="font-medium text-sm mt-1 text-green-600">
                                        {tenant.balance} {tenant.currency}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">VÖEN (TIN)</span>
                                    <div className="font-medium text-sm mt-1">{tenant.tin}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resurs İstifadəsi */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Resurs İstifadəsi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> İstifadəçilər</span>
                                    <span className="text-muted-foreground">{tenant.usersCount} / {tenant.maxUsers}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${Math.min((tenant.usersCount / tenant.maxUsers) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Storage (GB)</span>
                                    <span className="text-muted-foreground">{tenant.storageUsed} / {tenant.maxStorage}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full"
                                        style={{ width: `${Math.min((tenant.storageUsed / tenant.maxStorage) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ödəniş Tarixləri */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-muted/30">
                            <CardContent className="pt-4">
                                <span className="text-xs text-muted-foreground">Son Ödəniş</span>
                                <div className="font-medium text-sm mt-1">{tenant.lastPaymentDate}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                            <CardContent className="pt-4">
                                <span className="text-xs text-muted-foreground">Növbəti Ödəniş</span>
                                <div className="font-medium text-sm mt-1">{tenant.nextPaymentDate}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
