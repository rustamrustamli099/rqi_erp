/**
 * SAP-Grade BillingConfigForm — Resolver-Driven
 * 
 * NO URL-derived access decisions.
 * Uses getAllowedSubTabs() from navigationResolver.
 */

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, Shield, CreditCard, Bell, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { getAllowedSubTabs } from "@/app/security/navigationResolver";
import { Inline403 } from "@/shared/components/security/Inline403";

// Static sub-tab config (should match registry)
const BILLING_SUBTABS = [
    { key: 'pricing', label: 'Qiymət Qaydaları' },
    { key: 'limits', label: 'Limitlər və Kvotalar' },
    { key: 'overuse', label: 'Limit Aşıldıqda' },
    { key: 'grace', label: 'Güzəşt Müddəti' },
    { key: 'currency', label: 'Valyuta və Vergi' },
    { key: 'invoice', label: 'Faktura Qaydaları' },
    { key: 'events', label: 'Hadisələr' },
    { key: 'security', label: 'Giriş və Təhlükəsizlik' }
];

export function BillingConfigForm() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { permissions, isLoading } = usePermissions();

    // SAP-GRADE: Get allowed subTabs from resolver (NOT from URL)
    const allowedSubTabs = useMemo(() => {
        return getAllowedSubTabs('admin.settings', 'billing_config', permissions, 'admin');
    }, [permissions]);

    const allowedKeys = useMemo(() => allowedSubTabs.map(st => st.key), [allowedSubTabs]);

    // URL clamp to allowed
    const urlSubTab = searchParams.get('subTab');
    const currentSubTab = urlSubTab && allowedKeys.includes(urlSubTab)
        ? urlSubTab
        : allowedKeys[0] || '';

    // Sync URL if clamped
    useEffect(() => {
        if (!isLoading && currentSubTab && currentSubTab !== urlSubTab) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('subTab', currentSubTab);
            setSearchParams(newParams, { replace: true });
        }
    }, [currentSubTab, urlSubTab, setSearchParams, isLoading, searchParams]);

    const handleTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('subTab', value);
        setSearchParams(newParams, { replace: true });
    };

    if (isLoading) {
        return (
            <div className="flex h-[30vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (allowedKeys.length === 0) {
        return <Inline403 message="Billing konfiqurasiyasını görmək üçün icazəniz yoxdur." />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Billing Konfiqurasiyası</h3>
                <p className="text-sm text-muted-foreground">Qiymət, limitlər və billing qaydaları üçün qlobal konfiqurasiya.</p>
            </div>

            <Tabs value={currentSubTab} onValueChange={handleTabChange} className="space-y-4">
                <div className="w-full overflow-x-auto pb-2">
                    {/* SAP-GRADE: Only render ALLOWED subTabs */}
                    <TabsList className="flex h-auto w-max justify-start gap-2 bg-transparent p-0">
                        {allowedSubTabs.map(st => (
                            <TabsTrigger
                                key={st.key}
                                value={st.key}
                                data-subtab={st.key}
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background"
                            >
                                {st.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* SAP-GRADE: Only render ALLOWED TabsContent */}
                {allowedKeys.includes('pricing') && (
                    <TabsContent value="pricing">
                        <Card>
                            <CardHeader>
                                <CardTitle>Qiymət Qaydaları</CardTitle>
                                <CardDescription>Baza qiymət modelləri və endirimlər.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between border p-3 rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label>Aylıq / İllik Rejimi Aktivdir</Label>
                                        <p className="text-xs text-muted-foreground">İstifadəçilərə illik ödəniş seçimi təklif et.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Endirim Növü (İllik)</Label>
                                        <Select defaultValue="percent">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percent">Faiz (%)</SelectItem>
                                                <SelectItem value="fixed">Sabit Məbləğ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Endirim Dəyəri</Label>
                                        <Input type="number" defaultValue="20" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Minimum Məbləğ (Charge Floor)</Label>
                                    <Input type="number" defaultValue="1.00" />
                                    <p className="text-xs text-muted-foreground">Bundan aşağı məbləğlər üçün faktura yaradılmayacaq.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {allowedKeys.includes('limits') && (
                    <TabsContent value="limits">
                        <Card>
                            <CardHeader>
                                <CardTitle>Limitlər və Kvotalar</CardTitle>
                                <CardDescription>Yeni tenantlar üçün defolt limitlər.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Maks. İstifadəçi (User Cap)</Label>
                                        <Input type="number" defaultValue="1000" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Storage Limiti (GB)</Label>
                                        <Input type="number" defaultValue="500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>API Sorğu Limiti (req/min)</Label>
                                        <Input type="number" defaultValue="60" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {allowedKeys.includes('overuse') && (
                    <TabsContent value="overuse">
                        <Card>
                            <CardHeader>
                                <CardTitle>Limit Aşıldıqda Davranış</CardTitle>
                                <CardDescription>Resurs limitləri keçildikdə sistem reaksiyası.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Limit növünə görə reaksiya</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>User Limiti Bitdikdə</Label>
                                            <Select defaultValue="soft_block">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="warn">Xəbərdarlıq (Warn)</SelectItem>
                                                    <SelectItem value="soft_block">Soft Block (Yeni user yoxdur)</SelectItem>
                                                    <SelectItem value="hard_block">Full Block (Giriş yoxdur)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Storage Dolduqda</Label>
                                            <Select defaultValue="warn">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="warn">Xəbərdarlıq</SelectItem>
                                                    <SelectItem value="soft_block">Soft Block (Yalnız Oxu)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Bildirişlər</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Xəbərdarlıq Həddi (%)</Label>
                                            <Input type="number" defaultValue="80" />
                                            <p className="text-xs text-muted-foreground">Limit bu faizə çatanda bildiriş göndər.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bloklama Həddi (%)</Label>
                                            <Input type="number" defaultValue="100" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {allowedKeys.includes('grace') && (
                    <TabsContent value="grace">
                        <Card>
                            <CardHeader>
                                <CardTitle>Güzəşt Müddəti (Grace Period)</CardTitle>
                                <CardDescription>Ödəniş gecikmələri zamanı davranış.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Oxu-Rejimi Müddəti (Gün)</Label>
                                        <Input type="number" defaultValue="7" />
                                        <p className="text-xs text-muted-foreground">Ödəniş vaxtı bitdikdən sonra neçə gün sistem açıq qalsın.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tam Bloklama (Gün)</Label>
                                        <Input type="number" defaultValue="14" />
                                        <p className="text-xs text-muted-foreground">Bu müddətdən sonra giriş tamamilə bağlanır.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    Bloklanmış tenantların məlumatları 90 gün sonra arxivlənir.
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {allowedKeys.includes('currency') && (
                    <TabsContent value="currency">
                        <Card>
                            <CardHeader>
                                <CardTitle>Valyuta və Vergi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Default Valyuta</Label>
                                        <Select defaultValue="AZN">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AZN">AZN (₼)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>ƏDV (VAT) Tətbiq Et</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Vergi Adı</Label>
                                            <Input defaultValue="ƏDV" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dərəcə (%)</Label>
                                            <Input type="number" defaultValue="18" />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch />
                                        <Label>Qiymətə Daxildir (Inclusive)</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {allowedKeys.includes('invoice') && (
                    <TabsContent value="invoice">
                        <Card>
                            <CardHeader>
                                <CardTitle>Faktura Qaydaları</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border p-3 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label>Avtomatik Faktura</Label>
                                            <p className="text-xs text-muted-foreground">Yenilənmə zamanı PDF faktura avtomatik yaradılır.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <Label>Ödəniş Xatırlatmaları (Gün əvvəl)</Label>
                                        <Input defaultValue="7, 3, 1" placeholder="e.g. 7, 3, 1" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {allowedKeys.includes('events') && (
                    <TabsContent value="events">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Hadisələri (Events)</CardTitle>
                                <CardDescription>Sistem hadisələri və bildiriş triggerləri.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { id: "overdue", label: "Payment Overdue (Ödəniş Gecikməsi)" },
                                    { id: "expired", label: "Subscription Expired (Abunəlik Bitdi)" },
                                    { id: "limit", label: "Limit Exceeded (Limit Aşıldı)" },
                                    { id: "upgrade", label: "Plan Upgrade/Downgrade" }
                                ].map(event => (
                                    <div key={event.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{event.label}</span>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {allowedKeys.includes('security') && (
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Girişi və Təhlükəsizlik</CardTitle>
                                <CardDescription>Billing moduluna giriş icazələri.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between border p-3 rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label>Billing üçün Təsdiqli İstifadəçi</Label>
                                        <p className="text-xs text-muted-foreground">Yalnız email təsdiqi olan istifadəçilər faktura görə bilər.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between border p-3 rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label>Yalnız 'Billing Admin' Rolu</Label>
                                        <p className="text-xs text-muted-foreground">Tenant adminləri daxil olmaqla, yalnız xüsusi rola malik olanlar.</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between border p-3 rounded-lg opacity-80">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Label>SSO İlə Məhdudlaşdır</Label>
                                            <Badge variant="outline" className="text-[10px]">Enterprise</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Billing əməliyyatları üçün təkrar SSO tələb et.</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="p-4 bg-muted rounded flex items-start gap-3 mt-4">
                                    <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium">Təhlükəsizlik Qeydi</p>
                                        <p className="text-muted-foreground">
                                            Billing məlumatları həssasdır. Zəhmət olmasa "Billing Admin" rolunu yalnız maliyyə məsuliyyətli şəxslərə verin.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => toast.message("Dəyişikliklər ləğv edildi")}>Ləğv et</Button>
                <Button onClick={() => toast.success("Konfiqurasiya yadda saxlanıldı")}>Yadda Saxla</Button>
            </div>
        </div>
    );
}
