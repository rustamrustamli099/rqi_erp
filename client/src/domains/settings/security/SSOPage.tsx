import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, Edit, Key, Lock, Plus, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SSOProvider {
    id: string;
    provider: "Google" | "Microsoft" | "Okta" | "Custom";
    clientId: string;
    status: "active" | "inactive";
    createdAt: string;
    domains: string[];
}

const INITIAL_PROVIDERS: SSOProvider[] = [
    { id: "1", provider: "Google", clientId: "8293...1923.apps.google.com", status: "active", createdAt: "2024-01-15", domains: ["company.com"] },
];

export default function SSOPage() {
    const [providers, setProviders] = useState<SSOProvider[]>(INITIAL_PROVIDERS);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<SSOProvider | null>(null);

    // Config Form State
    const [providerType, setProviderType] = useState<SSOProvider["provider"]>("Google");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [domains, setDomains] = useState("");

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: "destructive" | "default";
    }>({ isOpen: false, title: "", description: "", action: () => { }, variant: "default" });

    const handleSave = () => {
        if (editingProvider) {
            setProviders(prev => prev.map(p => p.id === editingProvider.id ? { ...p, clientId, domains: domains.split(",").map(d => d.trim()) } : p));
            toast.success("Konfiqurasiya yeniləndi");
        } else {
            const newProvider: SSOProvider = {
                id: Date.now().toString(),
                provider: providerType,
                clientId: clientId || "client-id-placeholder",
                status: "active",
                createdAt: new Date().toISOString().split('T')[0],
                domains: domains.split(",").map(d => d.trim())
            };
            setProviders(prev => [...prev, newProvider]);
            toast.success("Yeni SSO provayderi əlavə edildi");
        }
        setIsConfigOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setEditingProvider(null);
        setClientId("");
        setClientSecret("");
        setDomains("");
        setProviderType("Google");
    };

    const openCreate = () => {
        resetForm();
        setIsConfigOpen(true);
    };

    const openEdit = (p: SSOProvider) => {
        setEditingProvider(p);
        setProviderType(p.provider);
        setClientId(p.clientId);
        setDomains(p.domains.join(", "));
        setIsConfigOpen(true);
    };

    const handleDelete = (id: string) => {
        setConfirmState({
            isOpen: true,
            title: "Provayderi Sil",
            description: "Bu tənzimləməni silmək istədiyinizə əminsiniz? İstifadəçilər bu metodla giriş edə bilməyəcəklər.",
            variant: "destructive",
            action: () => {
                setProviders(prev => prev.filter(p => p.id !== id));
                toast.success("Provayder silindi");
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const toggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setConfirmState({
            isOpen: true,
            title: "Statusu Dəyiş",
            description: `Bu provayderi ${newStatus === 'active' ? 'aktivləşdirmək' : 'deaktiv etmək'} istədiyinizə əminsiniz?`,
            variant: newStatus === 'inactive' ? "destructive" : "default",
            action: () => {
                setProviders(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
                toast.success(`Status dəyişdirildi: ${newStatus}`);
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> SSO və OAuth</h3>
                    <p className="text-sm text-muted-foreground">İşçilərin korporativ hesablarla girişini təmin edin.</p>
                </div>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Yeni Provayder</Button>
            </div>

            <div className="grid gap-4">
                {providers.map(provider => (
                    <Card key={provider.id} className="flex flex-col md:flex-row items-center justify-between p-4 px-6 gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                {provider.provider[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-base flex items-center gap-2">
                                    {provider.provider}
                                    <Badge variant={provider.status === 'active' ? 'default' : 'secondary'} className={provider.status === 'active' ? "bg-green-600" : ""}>
                                        {provider.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                                    </Badge>
                                </h4>
                                <div className="text-sm text-muted-foreground mt-1 flex gap-2">
                                    <span>Client ID: {provider.clientId.substring(0, 10)}...</span>
                                    <span>•</span>
                                    <span>Domenlər: {provider.domains.join(", ")}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 mr-4">
                                <span className="text-sm text-muted-foreground">{provider.status === 'active' ? 'Aktiv' : 'Deaktiv'}</span>
                                <Switch checked={provider.status === 'active'} onCheckedChange={() => toggleStatus(provider.id, provider.status)} />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(provider)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(provider.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingProvider ? "Tənzimləmələri Redaktə Et" : "Yeni SSO Provayderi"}</DialogTitle>
                        <DialogDescription>OAuth 2.0 / SAML tənzimləmələrini daxil edin.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Provayder</Label>
                                <Select value={providerType} onValueChange={(v: any) => setProviderType(v)} disabled={!!editingProvider}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Google">Google Workspace</SelectItem>
                                        <SelectItem value="Microsoft">Microsoft Azure AD</SelectItem>
                                        <SelectItem value="Okta">Okta</SelectItem>
                                        <SelectItem value="Custom">Custom OAuth2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>İcazəli Domenlər (Vergüllə)</Label>
                                <Input placeholder="example.com, tech.io" value={domains} onChange={e => setDomains(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Client ID / App ID</Label>
                            <Input value={clientId} onChange={e => setClientId(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Client Secret</Label>
                            <Input type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="••••••••••••••••" />
                        </div>
                        <div className="bg-muted p-3 rounded-md text-xs font-mono break-all">
                            <div className="text-muted-foreground mb-1">Redirect URI (Callback):</div>
                            https://api.antigravity.az/auth/{providerType.toLowerCase()}/callback
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Switch id="auto-prov" defaultChecked />
                            <Label htmlFor="auto-prov" className="cursor-pointer">Avtomatik istifadəçi yaradılması (Auto-Provisioning)</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Ləğv et</Button>
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
    );
}
