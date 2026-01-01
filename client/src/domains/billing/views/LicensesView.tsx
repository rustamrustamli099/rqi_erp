
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Check, Shield, Zap, Box, History, Users, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { PermissionSlugs } from "@/app/security/permission-slugs";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";

const PLANS = [
    { id: "p1", name: "Başlanğıc (Starter)", price: "299 ₼/ay", users: "10", storage: "5 GB", features: ["HR Core", "Maliyyə Standart"] },
    { id: "p2", name: "Biznes Pro", price: "599 ₼/ay", users: "50", storage: "50 GB", features: ["HR Core", "Bordro", "Maliyyə", "Audit Pro"] },
    { id: "p3", name: "Enterprise", price: "1200 ₼/ay", users: "999+", storage: "1 TB", features: ["Bütün Modullar", "SSO", "API Gateway"] },
];

const AUDIT_LOGS = [
    { id: 1, date: "2024-12-15 14:30", action: "Plan Yeniləndi", details: "Enterprise paketinə keçid edildi", user: "Admin User", ip: "10.0.0.1" },
    { id: 2, date: "2024-11-10 09:15", action: "Ödəniş Uğurlu", details: "Faktura #INV-2024-110", user: "Sistem", ip: "-" },
    { id: 3, date: "2024-10-05 11:20", action: "Modul Əlavə Edildi", details: "'Audit Pro' aktivləşdirildi", user: "Admin User", ip: "192.168.1.50" },
    { id: 4, date: "2024-09-01 10:00", action: "Abunəlik Başladı", details: "Biznes Pro Sınaq Müddəti", user: "Admin User", ip: "192.168.1.50" },
];

export function LicensesView() {
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>("p3"); // Mock selection
    const [seatCount, setSeatCount] = useState(5); // Additional seats

    // Permission Check
    const { permissions } = usePermissions();
    const canChangePlan = permissions.includes(PermissionSlugs.SYSTEM.BILLING.LICENSES.CHANGE_PLAN);
    const canManageSeats = permissions.includes(PermissionSlugs.SYSTEM.BILLING.LICENSES.MANAGE_SEATS);
    const canCancel = permissions.includes(PermissionSlugs.SYSTEM.BILLING.LICENSES.CANCEL);
    const canViewAudit = permissions.includes(PermissionSlugs.SYSTEM.BILLING.LICENSES.VIEW_AUDIT);

    const handleChangePlan = () => {
        setIsPlanModalOpen(false);
        toast.success("Plan dəyişikliyi sorğusu qəbul edildi");
    };

    const handleUpdateSeats = () => {
        setIsSeatModalOpen(false);
        toast.success(`${seatCount} əlavə istifadəçi yeri əlavə edildi`);
    };

    const handleCancelSubscription = () => {
        setConfirmCancel(false);
        toast.error("Abunəlik ləğv edildi");
    };

    return (
        <div className="space-y-6">
            {/* Top Overview Card */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                        <Badge className="mb-2 bg-primary text-primary-foreground hover:bg-primary">AKTİV PLAN</Badge>
                        <CardTitle className="text-3xl font-bold">Enterprise Plan</CardTitle>
                        <CardDescription>
                            Abunəlik bitmə tarixi: <span className="font-medium text-foreground">10 Yanvar 2025</span> (26 gün qalıb)
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end max-w-[50%]">
                        {canViewAudit && (
                            <Button variant="outline" size="sm" onClick={() => setIsAuditModalOpen(true)}>
                                <History className="w-4 h-4 mr-2" /> Audit Tarixçəsi
                            </Button>
                        )}
                        {canManageSeats && (
                            <Button variant="outline" size="sm" onClick={() => setIsSeatModalOpen(true)}>
                                <Users className="w-4 h-4 mr-2" /> İstifadəçi Limitini Artır
                            </Button>
                        )}
                        {canChangePlan && (
                            <Button size="sm" onClick={() => setIsPlanModalOpen(true)}>Planı Dəyiş</Button>
                        )}
                        {canCancel && (
                            <Button variant="destructive" size="sm" onClick={() => setConfirmCancel(true)}>
                                <Ban className="w-4 h-4 mr-2" /> Ləğv Et
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">İstifadəçilər</span>
                                <span className="font-medium">45 / 50</span>
                            </div>
                            <Progress value={90} className="h-2" />
                            <p className="text-xs text-muted-foreground">Limitə çatmağa az qalıb (90%)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Yaddaş (Storage)</span>
                                <span className="font-medium">450 GB / 1 TB</span>
                            </div>
                            <Progress value={45} className="h-2 bg-blue-100" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">API Sorğuları</span>
                                <span className="font-medium">15k / 100k</span>
                            </div>
                            <Progress value={15} className="h-2 bg-green-100" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Active Modules */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-blue-600" /> Aktiv Modullar
                        </CardTitle>
                        <CardDescription>Cari planda aktiv olan sistem modulları.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: "HR Core", desc: "Əməkdaş profilləri və struktur" },
                            { name: "Maliyyə Standart", desc: "GL, AR/AP, Hesabatlar" },
                            { name: "Sənəd Dövriyyəsi", desc: "Daxili yazışmalar və əmrlər" }
                        ].map((mod, i) => (
                            <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                <div className="mt-1 bg-green-100 p-1 rounded-full"><Check className="w-3 h-3 text-green-700" /></div>
                                <div>
                                    <p className="font-medium text-sm">{mod.name}</p>
                                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Capabilities & Packages */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-orange-600" /> Funksionallıq və Paketlər
                        </CardTitle>
                        <CardDescription>Əlavə paketlər və xüsusi icazələr.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-muted/30 rounded-lg border">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-sm">Startup Bundle</span>
                                <Badge variant="secondary">Paket</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Əsas HR və Maliyyə modullarını əhatə edir.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Aktiv Funksiyalar</h4>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="font-normal text-xs"><Shield className="w-3 h-3 mr-1" /> SSO / SAML</Badge>
                                <Badge variant="outline" className="font-normal text-xs">Audit Pro</Badge>
                                <Badge variant="outline" className="font-normal text-xs">API Access</Badge>
                                <Badge variant="outline" className="font-normal text-xs">Mobile App</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Change Plan Modal */}
            <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Abunəlik Planını Dəyiş</DialogTitle>
                        <DialogDescription>
                            Ehtiyaclarınıza uyğun planı seçin. Dəyişikliklər dərhal tətbiq olunacaq.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                        {PLANS.map(plan => (
                            <div
                                key={plan.id}
                                className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                onClick={() => setSelectedPlan(plan.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold">{plan.name}</h4>
                                    {selectedPlan === plan.id && <Check className="w-4 h-4 text-primary" />}
                                </div>
                                <div className="text-2xl font-bold mb-4">{plan.price}</div>
                                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                                    <li className="flex items-center"><Check className="w-3 h-3 mr-2" /> {plan.users} İstifadəçi</li>
                                    <li className="flex items-center"><Check className="w-3 h-3 mr-2" /> {plan.storage} Yaddaş</li>
                                </ul>
                                <div className="text-xs bg-muted p-2 rounded">
                                    {plan.features.slice(0, 2).join(", ")} {plan.features.length > 2 && "..."}
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleChangePlan}>Təsdiqlə və Dəyiş</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Seats Modal */}
            <Dialog open={isSeatModalOpen} onOpenChange={setIsSeatModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>İstifadəçi Limitini Artır</DialogTitle>
                        <DialogDescription>
                            Cari plana əlavə istifadəçi yeri əlavə edin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="seats" className="text-right">
                                Say
                            </Label>
                            <Input
                                id="seats"
                                type="number"
                                value={seatCount}
                                onChange={(e) => setSeatCount(parseInt(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground ml-auto w-3/4">
                            Hər əlavə istifadəçi yeri üçün: <span className="font-bold">10 ₼/ay</span>
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSeatModalOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleUpdateSeats}>Yenilə</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Audit History Modal */}
            <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Lisenziya və Biling Tarixçəsi</DialogTitle>
                        <DialogDescription>
                            Bütün plan dəyişiklikləri və ödəniş əməliyyatları.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarix</TableHead>
                                    <TableHead>Əməliyyat</TableHead>
                                    <TableHead>Detallar</TableHead>
                                    <TableHead>İstifadəçi</TableHead>
                                    <TableHead>IP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {AUDIT_LOGS.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-xs">{log.date}</TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell className="text-muted-foreground">{log.details}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">A</div>
                                                {log.user}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{log.ip}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsAuditModalOpen(false)}>Bağla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation */}
            <ConfirmationDialog
                open={confirmCancel}
                onOpenChange={setConfirmCancel}
                title="Abunəliyi Ləğv Et"
                description="Abunəliyinizi ləğv etmək istədiyinizə əminsiniz? Bu əməliyyat bütün xidmətləri dayandıracaq."
                variant="destructive"
                onConfirm={handleCancelSubscription}
            />
        </div>
    );
}
