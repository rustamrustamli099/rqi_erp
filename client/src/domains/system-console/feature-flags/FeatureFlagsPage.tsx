import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Edit, Flag, Globe, Layers, Plus, Users, Archive } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";

interface FeatureFlag {
    id: string;
    key: string;
    description: string;
    scope: "Global" | "Tenant" | "Role" | "User";
    status: boolean;
    environment: "Production" | "Staging" | "Dev";
    archived?: boolean;
}

const MOCK_FLAGS: FeatureFlag[] = [
    { id: "1", key: "new_billing_ui", description: "Biling səhifəsinin yeni dizaynı", scope: "Global", status: true, environment: "Production" },
    { id: "2", key: "beta_ai_assistant", description: "Süni intellekt köməkçisi", scope: "Tenant", status: false, environment: "Production" },
    { id: "3", key: "experimental_reports", description: "Eksperimental hesabatlar", scope: "Role", status: true, environment: "Staging" },
];

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FLAGS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<FeatureFlag>>({ scope: "Global", environment: "Production", status: false });

    const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, description: string, action: () => void, variant?: "destructive" | "default" }>({ isOpen: false, title: "", description: "", action: () => { }, variant: "default" });

    const handleSave = () => {
        if (editingFlag) {
            setFlags(prev => prev.map(f => f.id === editingFlag.id ? { ...f, ...formData } as FeatureFlag : f));
            toast.success("Fləq yeniləndi");
        } else {
            const newFlag = {
                id: Date.now().toString(),
                key: formData.key || "new_feature",
                description: formData.description || "",
                scope: formData.scope || "Global",
                status: formData.status || false,
                environment: formData.environment || "Production"
            } as FeatureFlag;
            setFlags(prev => [...prev, newFlag]);
            toast.success("Yeni fləq yaradıldı");
        }
        setIsModalOpen(false);
        setEditingFlag(null);
    };

    const toggleStatus = (id: string, current: boolean) => {
        setConfirmState({
            isOpen: true,
            title: !current ? "Fləqi Aktivləşdir" : "Fləqi Deaktiv Et",
            description: `Bu feature flag-i ${!current ? 'aktivləşdirmək' : 'deaktiv etmək'} istədiyinizə əminsiniz?`,
            variant: "default",
            action: () => {
                setFlags(prev => prev.map(f => f.id === id ? { ...f, status: !current } : f));
                toast.success(`Fləq ${!current ? 'aktivləşdirildi' : 'deaktiv edildi'}`);
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleArchive = (id: string) => {
        setConfirmState({
            isOpen: true,
            title: "Fləqi Arxivlə",
            description: "Bu feature flag-i arxivləmək istədiyinizə əminsiniz? O, siyahıdan gizlədiləcək.",
            variant: "destructive",
            action: () => {
                setFlags(prev => prev.map(f => f.id === id ? { ...f, archived: true, status: false } : f));
                toast.success("Fləq arxivləndi");
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const openEdit = (flag: FeatureFlag) => {
        setEditingFlag(flag);
        setFormData(flag);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingFlag(null);
        setFormData({ scope: "Global", environment: "Production", status: false });
        setIsModalOpen(true);
    };

    const getScopeIcon = (scope: string) => {
        switch (scope) {
            case "Global": return Globe;
            case "Tenant": return Layers;
            case "Role": return Users;
            default: return Flag;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2"><Flag className="w-5 h-5 text-primary" /> Feature Flags</h3>
                    <p className="text-sm text-muted-foreground">Funksionallıqların canlı idarəetməsi (Toggle).</p>
                </div>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Yeni Flag</Button>
            </div>

            <div className="border rounded-md bg-background">
                <div className="grid grid-cols-1 divide-y">
                    {flags.filter(f => !f.archived).map(flag => {
                        const Icon = getScopeIcon(flag.scope);
                        return (
                            <div key={flag.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${flag.status ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 font-medium">
                                            {flag.key}
                                            <Badge variant="outline" className="text-[10px] h-5">{flag.environment}</Badge>
                                            <Badge variant="secondary" className="text-[10px] h-5">{flag.scope}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{flag.description}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`switch-${flag.id}`} className="text-xs text-muted-foreground cursor-pointer">
                                            {flag.status ? 'Aktiv' : 'Deaktiv'}
                                        </Label>
                                        <Switch id={`switch-${flag.id}`} checked={flag.status} onCheckedChange={() => toggleStatus(flag.id, flag.status)} />
                                    </div>
                                    <div className="pl-4 border-l flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(flag)}>
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleArchive(flag.id)}>
                                            <Archive className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFlag ? "Flag Redaktə Et" : "Yeni Feature Flag"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Flag Key (Unikal)</Label>
                            <Input placeholder="feature_name_v1" value={formData.key || ""} onChange={e => setFormData({ ...formData, key: e.target.value })} />
                            <p className="text-[10px] text-muted-foreground">Kodu yoxlayarkən istifadə olunacaq açar söz.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Təsvir</Label>
                            <Input placeholder="Nə işə yarayır?" value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Əhatə Dairəsi (Scope)</Label>
                                <Select value={formData.scope} onValueChange={(val: any) => setFormData({ ...formData, scope: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Global">Global (Bütün Sistem)</SelectItem>
                                        <SelectItem value="Tenant">Tenant (Şirkət)</SelectItem>
                                        <SelectItem value="Role">Role (Vəzifə)</SelectItem>
                                        <SelectItem value="User">User (İstifadəçi)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Mühit (Env)</Label>
                                <Select value={formData.environment} onValueChange={(val: any) => setFormData({ ...formData, environment: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Production">Production</SelectItem>
                                        <SelectItem value="Staging">Staging</SelectItem>
                                        <SelectItem value="Dev">Development</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border p-3 rounded bg-muted/20">
                            <Switch id="form-status" checked={formData.status} onCheckedChange={(c) => setFormData({ ...formData, status: c })} />
                            <Label htmlFor="form-status">Defolt olaraq aktivdir?</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleSave}>Yadda Saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={confirmState.isOpen}
                onOpenChange={(val: boolean) => setConfirmState(prev => ({ ...prev, isOpen: val }))}
                title={confirmState.title}
                description={confirmState.description}
                onConfirm={confirmState.action}
                variant={confirmState.variant}
            />
        </div>
    )
}
