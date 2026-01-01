import { useState, useEffect, useMemo } from "react";
import {
    CreditCard, Package, ShoppingBag, BarChart3,
    Check, Plus, Settings, AlertTriangle, MoreHorizontal,
    Edit, Trash2, Eye, PauseCircle, PlayCircle, XCircle,
    Save, Building, Search, Filter, ArrowRight, Shield, Zap, Box, Link2, Boxes, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { Combobox } from "@/shared/components/ui/combobox";
import { Textarea } from "@/shared/components/ui/textarea";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LicensesView } from "./LicensesView";
import { InvoicesView } from "./InvoicesView";

// --- MOCK DATA FOR PLANS ---
const PLANS_MOCK = [
    { id: "p1", name: "Starter Pack", price: 29.99, currency: "AZN", interval: "monthly", userLimit: 10, storage: 5, active: true },
    { id: "p2", name: "Business Pro", price: 59.99, currency: "AZN", interval: "monthly", userLimit: 50, storage: 50, active: true },
    { id: "p3", name: "Enterprise", price: 199.99, currency: "AZN", interval: "yearly", userLimit: 999, storage: 1000, active: true },
];

function PlanDetailsDialog({ open, onOpenChange, plan }: { open: boolean, onOpenChange: (open: boolean) => void, plan: any }) {
    if (!plan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {plan.name}
                        <Badge variant={plan.active ? 'default' : 'secondary'} className={plan.active ? 'bg-green-600' : ''}>
                            {plan.active ? 'Aktiv' : 'Deaktiv'}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>Abunəlik planı haqqında ətraflı məlumat</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center bg-muted/40 p-4 rounded-lg">
                        <span className="text-muted-foreground font-medium">Qiymət</span>
                        <div className="text-xl font-bold">{plan.price} {plan.currency} <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 p-3 border rounded-md">
                            <span className="text-xs font-bold text-muted-foreground uppercase">İstifadəçi Limiti</span>
                            <div className="font-medium text-lg">{plan.userLimit}</div>
                        </div>
                        <div className="space-y-1 p-3 border rounded-md">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Yaddaş Həcmi</span>
                            <div className="font-medium text-lg">{plan.storage} GB</div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">Bağla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SubscriptionsView() {
    const [plans, setPlans] = useState<any[]>(PLANS_MOCK);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [viewingPlan, setViewingPlan] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, description: string, variant: "default" | "destructive", action: () => void }>({ isOpen: false, title: "", description: "", variant: "default", action: () => { } });

    // Permission State
    const { permissions } = usePermissions();
    const canCreate = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PLANS.CREATE);
    const canUpdate = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PLANS.UPDATE);
    const canDelete = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PLANS.DELETE);
    const canChangeStatus = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PLANS.CHANGE_STATUS);
    const canExport = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PLANS.EXPORT);

    const handleSavePlan = (data: any) => {
        if (editingPlan) {
            setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...data } : p));
            toast.success("Plan yeniləndi");
        } else {
            const newPlan = {
                id: `plan_${Date.now()}`,
                active: true,
                ...data
            };
            setPlans(prev => [...prev, newPlan]);
            toast.success("Yeni plan yaradıldı");
        }
        setIsSubModalOpen(false);
        setEditingPlan(null);
    };

    const handleDelete = (id: string) => {
        setConfirmState({
            isOpen: true,
            title: "Planı Sil",
            description: "Bu planı silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.",
            variant: "destructive",
            action: () => {
                setPlans(prev => prev.filter(p => p.id !== id));
                toast.success("Plan silindi");
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleToggleStatus = (id: string, currentStatus: boolean = true) => {
        const action = currentStatus ? "deaktiv etmək" : "aktivləşdirmək";
        setConfirmState({
            isOpen: true,
            title: "Statusu Dəyiş",
            description: `Bu planı ${action} istədiyinizə əminsiniz?`,
            variant: currentStatus ? "destructive" : "default",
            action: () => {
                toast.success(`Status dəyişdirildi`);
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleExport = () => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: "Planlar ixrac edilir...",
            success: "Planlar ixrac edildi",
            error: "Xəta baş verdi"
        });
    };

    const openEdit = (plan: any) => {
        setEditingPlan(plan);
        setFormData(plan);
        setIsSubModalOpen(true);
    };

    const openCreate = () => {
        setEditingPlan(null);
        setFormData({ currency: "AZN", interval: "monthly" });
        setIsSubModalOpen(true);
    };

    const handleChange = (key: string, val: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: val }));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /> Aktiv ({plans.filter(p => p.active).length})</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded-full" /> Deaktiv ({plans.filter(p => !p.active).length})</div>
                </div>
                <div className="flex items-center gap-2">
                    {canExport && (
                        <Button variant="outline" className="h-10" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" /> Excel-ə İxrac
                        </Button>
                    )}
                    {canCreate && (
                        <Button className="h-10" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Plan Yarat</Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4">
                {plans.map(plan => (
                    <Card key={plan.id} className="flex flex-col md:flex-row items-center justify-between p-4 px-6 gap-4 hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-base flex items-center gap-2">
                                    {plan.name}
                                    <Badge variant={plan.active ? 'default' : 'secondary'} className={`h-5 ${plan.active ? 'bg-green-600' : ''}`}>
                                        {plan.active ? 'Aktiv' : 'Arxiv'}
                                    </Badge>
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span>İstifadəçi: {plan.userLimit}</span>
                                    <span>•</span>
                                    <span>Yaddaş: {plan.storage}GB</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <div className="text-xl font-bold tabular-nums">{plan.price} {plan.currency === 'AZN' ? '₼' : plan.currency}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{plan.interval === 'monthly' ? 'Aylıq' : 'İllik'}</div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setViewingPlan(plan)}>
                                        <Eye className="mr-2 h-4 w-4" /> Detallar
                                    </DropdownMenuItem>

                                    {(canUpdate || canChangeStatus || canDelete) && <DropdownMenuSeparator />}

                                    {canUpdate && (
                                        <DropdownMenuItem onClick={() => openEdit(plan)}>
                                            <Edit className="mr-2 h-4 w-4" /> Redaktə Et
                                        </DropdownMenuItem>
                                    )}
                                    {canChangeStatus && (
                                        <DropdownMenuItem onClick={() => handleToggleStatus(plan.id, plan.active)}>
                                            {plan.active ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                                            {plan.active ? 'Deaktiv Et' : 'Aktivləşdir'}
                                        </DropdownMenuItem>
                                    )}
                                    {canDelete && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(plan.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Sil
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isSubModalOpen} onOpenChange={setIsSubModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? "Planı Redaktə Et" : "Yeni Plan Yarat"}</DialogTitle>
                        <DialogDescription>Abunəlik planının detallarını daxil edin.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Plan Adı</Label>
                                <Input placeholder="Məs: Standard Plan" value={formData.name || ""} onChange={e => handleChange('name', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Valyuta</Label>
                                    <Select defaultValue={formData.currency || "AZN"} onValueChange={(val) => handleChange('currency', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AZN">AZN</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Qiymət</Label>
                                    <Input type="number" defaultValue={formData.price} onChange={e => handleChange('price', parseFloat(e.target.value))} />
                                </div>
                            </div>
                        </div>

                        <Separator className="my-2" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>İstifadəçi Limiti</Label>
                                <Input type="number" defaultValue={formData.userLimit} onChange={e => handleChange('userLimit', parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Yaddaş (GB)</Label>
                                <Input type="number" defaultValue={formData.storage} onChange={e => handleChange('storage', parseInt(e.target.value))} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Ödəniş Dövrü</Label>
                            <Select defaultValue={formData.interval || "monthly"} onValueChange={(val) => handleChange('interval', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Aylıq</SelectItem>
                                    <SelectItem value="yearly">İllik</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsSubModalOpen(false)}>Ləğv et</Button>
                        <Button onClick={() => handleSavePlan(formData)}>Yadda Saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <PlanDetailsDialog
                open={!!viewingPlan}
                onOpenChange={(val) => !val && setViewingPlan(null)}
                plan={viewingPlan}
            />
            <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => setConfirmState(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmState.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmState.action}
                            className={confirmState.variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
                        >
                            Təsdiqlə
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// --- PRODUCT DIALOG COMPONENT (RED/YENI) ---




type ProductType = "Modul" | "İnteqrasiya" | "Funksiya" | "Təhlükəsizlik" | "Digər";

interface Product {
    id: string;
    name: string;
    type: ProductType;
    price: number;
    unit: "user/ay" | "fix/ay";
    description: string;
    currency?: string;
    required?: boolean;
    active: boolean;
    dependency?: string;
}

const MARKETPLACE_FEATURES: Product[] = [
    { id: "f1", name: "HR Core", type: "Modul", price: 29, unit: "user/ay", description: "Əməkdaş profilləri, struktur, məzuniyyət.", required: true, active: true },
    { id: "f2", name: "Bordro Mühərriki", type: "Modul", price: 49, unit: "fix/ay", description: "Avtomatik maaş hesablama və vergi.", dependency: "HR Core", active: true },
    { id: "f3", name: "İşə Qəbul (ATS)", type: "Funksiya", price: 19, unit: "fix/ay", description: "Vakansiya və namizəd izləmə.", active: true },
    { id: "f4", name: "Maliyyə Standart", type: "Modul", price: 99, unit: "fix/ay", description: "GL, AR/AP, Hesabatlar.", active: true },
    { id: "f5", name: "API Gateway", type: "İnteqrasiya", price: 150, unit: "fix/ay", description: "REST API və 1000rpm limit.", active: false },
    { id: "f6", name: "SSO / SAML", type: "Təhlükəsizlik", price: 200, unit: "fix/ay", description: "Enterprise Identity (Okta, Azure AD).", active: true },
    { id: "f7", name: "Audit Pro", type: "Digər", price: 50, unit: "fix/ay", description: "Sonsuz log tarixi və eksport.", active: true },
];

const PACKAGES = [
    { id: "pkg_1", name: "Starter Pack", basePrice: 299, userLimit: 10, modules: ["HR Core", "Maliyyə Standart"] },
    { id: "pkg_2", name: "Business Pro", basePrice: 599, userLimit: 50, modules: ["HR Core", "Bordro", "Maliyyə", "Audit Pro"] },
    { id: "pkg_3", name: "Enterprise", basePrice: 1200, userLimit: 999, modules: ["All Modules", "SSO", "API"] },
];

// --- BADGE HELPER ---
const getBadgeVariant = (type: ProductType) => {
    switch (type) {
        case "Modul": return "default"; // Primary
        case "İnteqrasiya": return "secondary";
        case "Funksiya": return "outline";
        case "Təhlükəsizlik": return "destructive";
        default: return "secondary";
    }
};

const getBadgeIcon = (type: ProductType) => {
    switch (type) {
        case "Modul": return Box;
        case "İnteqrasiya": return Link2;
        case "Funksiya": return Zap;
        case "Təhlükəsizlik": return Shield;
        default: return Boxes;
    }
};

import { PageHeader } from "@/shared/components/ui/page-header";

import { useSearchParams } from "react-router-dom";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { resolveNavigationTree } from "@/app/security/navigationResolver";

// Tab configuration for filtering
const BILLING_TABS = [
    { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { key: 'packages', label: 'Kompakt Paketlər', icon: Package },
    { key: 'subscriptions', label: 'Abunəlik Planları', icon: CreditCard },
    { key: 'invoices', label: 'Fakturalar', icon: BarChart3 },
    { key: 'licenses', label: 'Lisenziyalar', icon: Shield },
];

export default function BillingPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { permissions } = usePermissions();

    // SAP-GRADE: Single Decision Center - resolveNavigationTree once
    const navTree = useMemo(() => {
        return resolveNavigationTree('admin', permissions);
    }, [permissions]);

    // Get billing page node and tabs from children
    const pageNode = useMemo(() => navTree.find(p => p.pageKey === 'admin.billing'), [navTree]);
    const allowedTabs = useMemo(() => pageNode?.children ?? [], [pageNode]);
    const allowedKeys = useMemo(() => allowedTabs.map(t => t.tabKey || t.id), [allowedTabs]);

    // Filter visible tabs using resolver output
    const visibleTabs = useMemo(() => {
        return BILLING_TABS.filter(tab => allowedKeys.includes(tab.key));
    }, [allowedKeys]);

    // SAP-GRADE: Read tab from URL - NO [0] fallback
    const currentParam = searchParams.get("tab");
    const activeTab = currentParam && allowedKeys.includes(currentParam)
        ? currentParam
        : '';

    // SAP-GRADE: Clear pagination params when tab changes
    const handleTabChange = (val: string) => {
        if (!allowedKeys.includes(val)) return;
        setSearchParams(_prev => {
            // Start fresh - only navigation params
            const newParams = new URLSearchParams();
            newParams.set('tab', val);
            return newParams;
        });
    };

    if (allowedKeys.length === 0) {
        return (
            <div className="p-8">
                <p className="text-sm text-muted-foreground">You do not have permission to view Billing.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[80vh] h-auto bg-background animate-in fade-in-50 duration-500">
            <div className="px-8 pt-6 flex-shrink-0">
                <PageHeader
                    heading="Biling və Marketplace"
                    text="Məhsul, paket və abunəliklərin mərkəzləşdirilmiş idarəetməsi."
                />
            </div>

            <div className="flex-1 p-8 pt-4 overflow-hidden min-w-0">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full flex flex-col">
                    {/* Reusable Scrollable Tabs - Pill Style */}
                    <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent border-b flex-shrink-0">
                        <TabsList className="flex h-auto w-max justify-start gap-2 bg-transparent p-0">
                            {visibleTabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.key}
                                        value={tab.key}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background rounded-md px-4 py-2"
                                    >
                                        <Icon className="mr-2 h-4 w-4" /> {tab.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    {/* SAP-GRADE: Only render ALLOWED TabsContent */}
                    {allowedKeys.includes('marketplace') && (
                        <TabsContent value="marketplace" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <MarketplaceView />
                        </TabsContent>
                    )}
                    {allowedKeys.includes('packages') && (
                        <TabsContent value="packages" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <PackagesView />
                        </TabsContent>
                    )}
                    {allowedKeys.includes('subscriptions') && (
                        <TabsContent value="subscriptions" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <SubscriptionsView />
                        </TabsContent>
                    )}
                    {allowedKeys.includes('invoices') && (
                        <TabsContent value="invoices" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <InvoicesView />
                        </TabsContent>
                    )}
                    {allowedKeys.includes('licenses') && (
                        <TabsContent value="licenses" className="flex-1 overflow-y-auto pt-6 min-h-0">
                            <LicensesView />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

import { PermissionSlugs } from "@/app/security/permission-slugs";


function MarketplaceView() {
    // Data State
    const [products, setProducts] = useState<Product[]>(MARKETPLACE_FEATURES);

    // Permission State
    const { permissions } = usePermissions();
    const canCreate = permissions.includes(PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.CREATE);
    const canUpdate = permissions.includes(PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.UPDATE);
    const canDelete = permissions.includes(PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.DELETE);
    const canChangeStatus = permissions.includes(PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.CHANGE_STATUS);
    const canExport = permissions.includes(PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.EXPORT);

    // UI State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("All");

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: "destructive" | "default";
    }>({
        isOpen: false,
        title: "",
        description: "",
        action: () => { },
        variant: "default"
    });

    const filtered = products.filter(f =>
        (filterType === "All" || f.type === filterType) &&
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- HANDLERS ---

    const handleExport = () => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: "Excel faylı hazırlanır...",
            success: "Məhsullar ixrac edildi",
            error: "Xəta baş verdi"
        });
    };

    const handleDelete = (id: string) => {
        setConfirmState({
            isOpen: true,
            title: "Məhsulu Sil",
            description: "Bu məhsulu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.",
            variant: "destructive",
            action: () => {
                setProducts(prev => prev.filter(p => p.id !== id));
                toast.success("Məhsul silindi");
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        const action = currentStatus ? "deaktiv etmək" : "aktivləşdirmək";
        setConfirmState({
            isOpen: true,
            title: "Statusu Dəyiş",
            description: `Bu məhsulu ${action} istədiyinizə əminsiniz?`,
            variant: currentStatus ? "destructive" : "default",
            action: () => {
                setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
                toast.success(`Status dəyişdirildi`);
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleSaveProduct = (product: Partial<Product>) => {
        if (editingProduct) {
            // Edit
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...product } as Product : p));
            toast.success("Məhsul yeniləndi");
        } else {
            // Create
            const newProduct: Product = {
                id: `new_${Date.now()}`,
                name: product.name || "Yeni Məhsul",
                type: product.type || "Digər",
                price: product.price || 0,
                unit: product.unit || "fix/ay",
                description: product.description || "",
                active: true,
                ...product
            } as Product;
            setProducts(prev => [...prev, newProduct]);
            toast.success("Yeni məhsul yaradıldı");
        }
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openDetailsModal = (product: Product) => {
        setViewingProduct(product);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Məhsul axtar..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filtr: {filterType}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Məhsul Növü</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilterType("All")}>Hamısı</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("Modul")}>Modul</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("İnteqrasiya")}>İnteqrasiya</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("Funksiya")}>Funksiya</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterType("Təhlükəsizlik")}>Təhlükəsizlik</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                    {canExport && (
                        <Button variant="outline" className="h-10" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" /> Excel-ə İxrac
                        </Button>
                    )}
                    {canCreate && (
                        <Button className="h-10" onClick={openCreateModal}><Plus className="mr-2 h-4 w-4" /> Yeni Məhsul Yarat</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(feature => {
                    const Icon = getBadgeIcon(feature.type);
                    return (
                        <Card key={feature.id} className={`flex flex-col relative overflow-hidden group hover:shadow-md transition-all ${!feature.active ? 'opacity-70 bg-muted/40' : ''}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant={getBadgeVariant(feature.type) as any} className="gap-1 pl-1 pr-2">
                                        <Icon className="w-3 h-3" />
                                        {feature.type}
                                    </Badge>
                                    {canChangeStatus && (
                                        <div onClick={(e) => { e.stopPropagation(); handleToggleStatus(feature.id, feature.active); }}>
                                            <Switch checked={feature.active} className="scale-75 cursor-pointer" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-baseline mt-1">
                                    <CardTitle className="text-xl">{feature.name}</CardTitle>
                                    <div className="font-bold text-lg text-primary">{feature.price} ₼<span className="text-xs font-normal text-muted-foreground">/{feature.unit === 'user/ay' ? 'user' : 'ay'}</span></div>
                                </div>
                                <CardDescription className="line-clamp-2 min-h-[40px] mt-1">{feature.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-2">
                                {feature.dependency && (
                                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                        <AlertTriangle className="h-3 w-3" /> Tələb: {feature.dependency}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2 bg-muted/10 border-t flex justify-between">
                                <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={() => openDetailsModal(feature)}>
                                    <Eye className="w-3.5 h-3.5" /> Bax
                                </Button>
                                <div className="flex gap-1">
                                    {canUpdate && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600" onClick={() => openEditModal(feature)}>
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(feature.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* --- MODALS --- */}
            <ProductDialog
                open={isProductModalOpen}
                onOpenChange={setIsProductModalOpen}
                product={editingProduct}
                onSave={handleSaveProduct}
            />

            <ProductDetailsDialog
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                product={viewingProduct}
            />

            <ConfirmationDialog
                open={confirmState.isOpen}
                onOpenChange={(val: boolean) => setConfirmState(prev => ({ ...prev, isOpen: val }))}
                title={confirmState.title}
                description={confirmState.description}
                onConfirm={confirmState.action}
                variant={confirmState.variant}
            />
        </div>
    );
}

// --- PRODUCT DETAILS DIALOG (BAX) ---
function ProductDetailsDialog({ open, onOpenChange, product }: { open: boolean, onOpenChange: (open: boolean) => void, product: Product | null }) {
    if (!product) return null;
    const Icon = getBadgeIcon(product.type);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-muted rounded-full">
                            <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <Badge variant={getBadgeVariant(product.type) as any}>{product.type}</Badge>
                    </div>
                    <DialogTitle className="text-xl">{product.name}</DialogTitle>
                    <DialogDescription>Məhsul haqqında ətraflı məlumat.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs uppercase font-bold">Qiymət</span>
                            <div className="font-medium text-lg text-primary">{product.price} ₼ <span className="text-xs text-muted-foreground font-normal">/{product.unit}</span></div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs uppercase font-bold">Status</span>
                            <div>
                                <Badge variant={product.active ? "default" : "secondary"} className={product.active ? "bg-green-600" : ""}>
                                    {product.active ? "Aktiv" : "Deaktiv"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                        <span className="text-muted-foreground text-xs uppercase font-bold">Təsvir</span>
                        <p className="text-sm leading-relaxed">{product.description}</p>
                    </div>
                    {product.dependency && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-center gap-2 text-amber-800 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Tələb olunur: <strong>{product.dependency}</strong></span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Bağla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- PRODUCT DIALOG COMPONENT (RED/YENI) ---


function ProductDialog({ open, onOpenChange, product, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, product: Product | null, onSave: (p: Partial<Product>) => void }) {
    const [formData, setFormData] = useState<Partial<Product>>({});

    // Reset or Populate on simple effect
    if (open && product && formData.id !== product.id) {
        setFormData(product);
    } else if (open && !product && (!formData.id || formData.id.startsWith("new_") === false)) {
        // Reset logic handled by component unmount/remount usually or controlled state
    }

    const handleChange = (key: keyof Product, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Initialize form when opening
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product ? "Məhsulu Redaktə Et" : "Yeni Məhsul Yarat"}</DialogTitle>
                    <DialogDescription>Marketplace-də görünəcək məhsul məlumatlarını daxil edin.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ad</Label>
                            <Input defaultValue={product?.name || ""} onChange={e => handleChange('name', e.target.value)} placeholder="Məhsul adı" />
                        </div>
                        <div className="space-y-2">
                            <Label>Növ (Badge)</Label>
                            <Select defaultValue={product?.type || "Modul"} onValueChange={(val) => handleChange('type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Növ seç" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Modul">Modul</SelectItem>
                                    <SelectItem value="İnteqrasiya">İnteqrasiya</SelectItem>
                                    <SelectItem value="Funksiya">Funksiya</SelectItem>
                                    <SelectItem value="Təhlükəsizlik">Təhlükəsizlik</SelectItem>
                                    <SelectItem value="Digər">Digər</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Qiymət</Label>
                            <div className="flex gap-2">
                                <Select defaultValue="AZN" onValueChange={(val) => handleChange('currency', val)}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AZN">AZN (₼)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input type="number" className="flex-1" defaultValue={product?.price || 0} onChange={e => handleChange('price', parseFloat(e.target.value))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Vahid</Label>
                            <Select defaultValue={product?.unit || "fix/ay"} onValueChange={(val) => handleChange('unit', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Vahid seç" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fix/ay">Sabit / Aylıq</SelectItem>
                                    <SelectItem value="user/ay">İstifadəçi / Aylıq</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Təsvir</Label>
                        <Input defaultValue={product?.description || ""} onChange={e => handleChange('description', e.target.value)} placeholder="Qısa məlumat..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Ləğv et</Button>
                    <Button onClick={() => onSave(formData)}>Yadda Saxla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}





function PackageWizard({ isOpen, onClose, onSave, initialData }: { isOpen: boolean, onClose: () => void, onSave: (pkg: any) => void, initialData?: any }) {
    const [formData, setFormData] = useState<any>({
        name: "",
        basePrice: 0,
        userLimit: 10,
        storageLimit: 5,
        basePlan: "",
        modules: [] as string[],
        features: {
            support247: false,
            personalManager: false
        }
    });

    // Load initial data if provided
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else if (isOpen && !initialData) {
            setFormData({ name: "", basePrice: 0, userLimit: 10, storageLimit: 5, basePlan: "", modules: [], features: { support247: false, personalManager: false } });
        }
    }, [isOpen, initialData]);

    const handleChange = (key: string, val: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: val }));
    };

    const toggleModule = (modName: string) => {
        setFormData((prev: any) => {
            const modules = prev.modules.includes(modName)
                ? prev.modules.filter((m: string) => m !== modName)
                : [...prev.modules, modName];
            return { ...prev, modules };
        });
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Paketi Redaktə Et" : "Yeni Kompakt Paket"}</DialogTitle>
                    <DialogDescription>Paket konfiqurasiyası (Akkordion)</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                    <Accordion type="single" collapsible defaultValue="details" className="w-full">
                        <AccordionItem value="details">
                            <AccordionTrigger>Paket Detalları</AccordionTrigger>
                            <AccordionContent className="space-y-4 p-1">
                                <div className="space-y-2">
                                    <Label>Paket Adı</Label>
                                    <Input placeholder="Məs: Startup Bundle" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>İstifadəçi Limiti</Label>
                                        <Input type="number" value={formData.userLimit} onChange={e => handleChange('userLimit', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Yaddaş (GB)</Label>
                                        <Input type="number" value={formData.storageLimit} onChange={e => handleChange('storageLimit', parseInt(e.target.value))} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Baza Qiymət (Aylıq)</Label>
                                    <Input type="number" value={formData.basePrice} onChange={e => handleChange('basePrice', parseFloat(e.target.value))} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="modules">
                            <AccordionTrigger>Modullar və İnteqrasiyalar</AccordionTrigger>
                            <AccordionContent className="p-1">
                                <ScrollArea className="h-[200px] border rounded-md p-4">
                                    <div className="space-y-4">
                                        {MARKETPLACE_FEATURES.map(feat => (
                                            <div key={feat.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getBadgeVariant(feat.type) as any} className="w-20 justify-center">{feat.type}</Badge>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{feat.name}</span>
                                                        <span className="text-xs text-muted-foreground">{feat.price} ₼</span>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={formData.modules.includes(feat.name)}
                                                    onCheckedChange={() => toggleModule(feat.name)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="border-t pt-4 mt-4 bg-muted/10 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-muted-foreground">Təxmini Aylıq:</span>
                        <span className="text-2xl font-bold">{formData.basePrice} ₼</span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>Ləğv et</Button>
                        <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Paketi Yarat</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}

// Package Details Dialog
function PackageDetailsDialog({ open, onOpenChange, pkg }: { open: boolean, onOpenChange: (open: boolean) => void, pkg: any }) {

    if (!pkg) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center justify-between">
                        {pkg.name}
                        <Badge variant="outline" className="text-primary border-primary">{pkg.basePrice} ₼ / ay</Badge>
                    </DialogTitle>
                    <DialogDescription>Paket konfiqurasiyası detalları</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs uppercase font-bold">İstifadəçi Limiti</span>
                            <div className="font-medium">{pkg.userLimit} istifadəçi</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-xs uppercase font-bold">Yaddaş Limiti</span>
                            <div className="font-medium">{pkg.storageLimit || 5} GB</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <span className="text-muted-foreground text-xs uppercase font-bold px-1">Daxil olan Modullar</span>
                        <div className="flex flex-wrap gap-2">
                            {pkg.modules && pkg.modules.length > 0 ? (
                                pkg.modules.map((m: string) => (
                                    <Badge key={m} variant="secondary" className="px-3 py-1">{m}</Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground italic pl-1">Modul seçilməyib</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <span className="text-muted-foreground text-xs uppercase font-bold px-1">Funksionallıqlar</span>
                        <ul className="grid grid-cols-1 gap-2">
                            {(pkg.features || []).map((feat: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-sm bg-background border p-2 rounded-md">
                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">Bağla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Packages View Component
function PackagesView() {
    const [packages, setPackages] = useState(PACKAGES);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    // Edit & View States
    const [editingPackage, setEditingPackage] = useState<any | null>(null);
    const [viewingPackage, setViewingPackage] = useState<any | null>(null);

    // Permission State
    const { permissions } = usePermissions();
    const canCreate = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PACKAGES.CREATE);
    const canUpdate = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PACKAGES.UPDATE);
    const canDelete = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PACKAGES.DELETE);
    const canChangeStatus = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PACKAGES.CHANGE_STATUS);
    const canExport = permissions.includes(PermissionSlugs.SYSTEM.BILLING.PACKAGES.EXPORT);

    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: "destructive" | "default";
    }>({
        isOpen: false,
        title: "",
        description: "",
        action: () => { },
        variant: "default"
    });

    const handleCreateClick = () => {
        setEditingPackage(null); // Reset for create
        setIsWizardOpen(true);
    }

    const handleEditClick = (pkg: any) => {
        setEditingPackage(pkg);
        setIsWizardOpen(true);
    };

    const handleSavePackage = (pkg: any) => {
        if (editingPackage) {
            // Updated
            setPackages(prev => prev.map(p => p.id === pkg.id ? { ...pkg } : p));
            toast.success("Paket yeniləndi");
        } else {
            // Create
            const newPkg = { ...pkg, id: `pkg_${Date.now()}` }; // Ensure ID
            setPackages([...packages, newPkg]);
            toast.success("Paket uğurla yaradıldı");
        }
        setIsWizardOpen(false);
        setEditingPackage(null);
    };

    const handleExport = () => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: "Paketlər ixrac edilir...",
            success: "Paketlər ixrac edildi",
            error: "Xəta baş verdi"
        });
    };

    const handleDelete = (id: string) => {
        setConfirmState({
            isOpen: true,
            title: "Paketi Sil",
            description: "Bu paketi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.",
            variant: "destructive",
            action: () => {
                setPackages(prev => prev.filter(p => p.id !== id));
                toast.success("Paket silindi");
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleToggleStatus = (id: string, currentStatus: boolean = true) => {
        const action = currentStatus ? "deaktiv etmək" : "aktivləşdirmək";
        setConfirmState({
            isOpen: true,
            title: "Statusu Dəyiş",
            description: `Bu paketi ${action} istədiyinizə əminsiniz?`,
            variant: currentStatus ? "destructive" : "default",
            action: () => {
                toast.success(`Status dəyişdirildi`);
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium">Kompakt Paketlər</h3>
                    <p className="text-sm text-muted-foreground">Şirkətlər üçün hazır konfiqurasiya olunmuş planlar.</p>
                </div>
                <div className="flex items-center gap-2">
                    {canExport && (
                        <Button variant="outline" className="h-10" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" /> Excel-ə İxrac
                        </Button>
                    )}
                    {canCreate && (
                        <Button className="h-10" onClick={handleCreateClick}><Plus className="mr-2 h-4 w-4" /> Yeni Paket</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map(pkg => (
                    <Card key={pkg.id} className="flex flex-col relative group">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{pkg.name}</CardTitle>
                                {canChangeStatus && (
                                    <div onClick={(e) => { e.stopPropagation(); handleToggleStatus(pkg.id); }}>
                                        <Switch defaultChecked className="scale-75 cursor-pointer" />
                                    </div>
                                )}
                            </div>
                            <div className="text-2xl font-bold mt-2">{pkg.basePrice} ₼ <span className="text-sm font-normal text-muted-foreground">/ay</span></div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between border-b pb-1">
                                    <span>İstifadəçi</span>
                                    <span className="font-medium text-foreground">{pkg.userLimit}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {pkg.modules.map((m: string) => (
                                    <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 border-t bg-muted/5 flex justify-between">
                            <Button variant="outline" className="w-full mr-2" onClick={() => setViewingPackage(pkg)}>Detallar</Button>
                            <div className="flex gap-1">
                                {canUpdate && (
                                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-blue-600" onClick={() => handleEditClick(pkg)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-destructive" onClick={() => handleDelete(pkg.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <PackageWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSave={handleSavePackage}
                initialData={editingPackage}
            />

            <PackageDetailsDialog
                open={!!viewingPackage}
                onOpenChange={(val) => !val && setViewingPackage(null)}
                pkg={viewingPackage}
            />

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => setConfirmState(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmState.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmState.action}
                            className={confirmState.variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
                        >
                            Təsdiqlə
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

