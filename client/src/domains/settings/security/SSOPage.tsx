import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, Edit, Eye, Info, Loader2, Plus, ShieldCheck, Trash2, Download } from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// PHASE 14H: Use pageState from backend Decision Center (DUMB UI)
import { usePageState } from "@/app/security/usePageState";
import { ExportModal } from "@/shared/components/ui/export-modal";
import { DataTable } from "@/shared/components/ui/data-table";
import { ssoProviderColumns, type SSOProvider } from "./_components/sso-columns";

const INITIAL_PROVIDERS: SSOProvider[] = [
    { id: "1", provider: "Google", clientId: "8293...1923.apps.google.com", status: "active", createdAt: "2024-01-15", domains: ["company.com"] },
];

export default function SSOPage() {
    // PHASE 14H: SAP PFCG Compliant - UI renders from backend pageState ONLY
    const { actions } = usePageState('Z_SETTINGS_SSO_OAUTH');

    // Actions from backend Decision Center (GS_* semantic keys)
    const canCreate = actions?.GS_SETTINGS_SECURITY_SSO_OAUTH_CREATE ?? false;
    const canUpdate = actions?.GS_SETTINGS_SECURITY_SSO_OAUTH_UPDATE ?? false;
    const canDelete = actions?.GS_SETTINGS_SECURITY_SSO_OAUTH_DELETE ?? false;
    const canChangeStatus = actions?.GS_SETTINGS_SECURITY_SSO_OAUTH_CHANGE_STATUS ?? false;
    const canTestConnection = actions?.GS_SETTINGS_SECURITY_SSO_OAUTH_TEST_CONNECTION ?? false;
    const canExport = actions?.GS_SETTINGS_SECURITY_SSO_OAUTH_EXPORT_TO_EXCEL ?? false;

    const [providers, setProviders] = useState<SSOProvider[]>(INITIAL_PROVIDERS);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<SSOProvider | null>(null);
    const [viewMode, setViewMode] = useState(false); // True = read-only view

    // Config Form State
    const [providerType, setProviderType] = useState<SSOProvider["provider"]>("Google");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [domains, setDomains] = useState("");
    const [isTesting, setIsTesting] = useState(false);

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: "destructive" | "default";
    }>({ isOpen: false, title: "", description: "", action: () => { }, variant: "default" });

    const [isExportOpen, setIsExportOpen] = useState(false);

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
        setViewMode(false);
    };

    const openCreate = () => {
        if (!canCreate) {
            toast.error("Bu əməliyyat üçün icazəniz yoxdur.");
            return;
        }
        resetForm();
        setIsConfigOpen(true);
    };

    const openView = (p: SSOProvider) => {
        setEditingProvider(p);
        setProviderType(p.provider);
        setClientId(p.clientId);
        setDomains(p.domains.join(", "));
        setViewMode(true);
        setIsConfigOpen(true);
    };

    const openEdit = (p: SSOProvider) => {
        if (!canUpdate) {
            toast.error("Bu əməliyyat üçün icazəniz yoxdur.");
            return;
        }
        setEditingProvider(p);
        setProviderType(p.provider);
        setClientId(p.clientId);
        setDomains(p.domains.join(", "));
        setViewMode(false);
        setIsConfigOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!canDelete) {
            toast.error("Bu əməliyyat üçün icazəniz yoxdur.");
            return;
        }
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
        if (!canChangeStatus) {
            toast.error("Status dəyişmək üçün icazəniz yoxdur.");
            return;
        }
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

    const handleTestConnection = async () => {
        if (!canTestConnection) {
            toast.error("Test bağlantısı üçün icazəniz yoxdur.");
            return;
        }
        setIsTesting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsTesting(false);
        toast.success("OAuth bağlantısı uğurla test edildi!");
    };

    const handleExport = (format: string) => {
        toast.success(`SSO provayder siyahısı ${format.toUpperCase()} formatında ixrac edilir...`);
        setIsExportOpen(false);
    };

    const columns = ssoProviderColumns(openView, openEdit, toggleStatus, handleDelete, { canUpdate, canDelete, canChangeStatus });

    return (
        <div className="space-y-6 relative">
            {/* Read Mode Badge */}
            {!canUpdate && !canCreate && (
                <div className="absolute top-0 right-0">
                    <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200 flex items-center shadow-sm">
                        <Info className="w-3 h-3 mr-1" />
                        Oxu Rejimi
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> SSO və OAuth</h3>
                    <p className="text-sm text-muted-foreground">İşçilərin korporativ hesablarla girişini təmin edin.</p>
                </div>
            </div>

            <div className="border rounded-md p-3">
                <DataTable
                    columns={columns}
                    data={providers}
                    searchKey="provider"
                    onAddClick={canCreate ? openCreate : undefined}
                    addLabel="Yeni Provayder"
                >
                    {canExport && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8 ml-auto" onClick={() => setIsExportOpen(true)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Excel-ə İxrac</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </DataTable>
            </div>

            {/* Config Modal */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {viewMode ? "Provayder Məlumatları" : editingProvider ? "Tənzimləmələri Redaktə Et" : "Yeni SSO Provayderi"}
                        </DialogTitle>
                        <DialogDescription>OAuth 2.0 / SAML tənzimləmələrini daxil edin.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Provayder</Label>
                                <Select value={providerType} onValueChange={(v: any) => setProviderType(v)} disabled={!!editingProvider || viewMode}>
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
                                <Input placeholder="example.com, tech.io" value={domains} onChange={e => setDomains(e.target.value)} disabled={viewMode} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Client ID / App ID</Label>
                            <Input value={clientId} onChange={e => setClientId(e.target.value)} disabled={viewMode} />
                        </div>
                        {!viewMode && (
                            <div className="space-y-2">
                                <Label>Client Secret</Label>
                                <Input type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="••••••••••••••••" />
                            </div>
                        )}
                        <div className="bg-muted p-3 rounded-md text-xs font-mono break-all">
                            <div className="text-muted-foreground mb-1">Redirect URI (Callback):</div>
                            https://api.antigravity.az/auth/{providerType.toLowerCase()}/callback
                        </div>
                        {!viewMode && (
                            <div className="flex items-center gap-2 mt-2">
                                <Switch id="auto-prov" defaultChecked />
                                <Label htmlFor="auto-prov" className="cursor-pointer">Avtomatik istifadəçi yaradılması (Auto-Provisioning)</Label>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {canTestConnection && editingProvider && (
                            <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                                {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                Test Bağlantısı
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                            {viewMode ? "Bağla" : "Ləğv et"}
                        </Button>
                        {!viewMode && (
                            <Button onClick={handleSave}>Yadda Saxla</Button>
                        )}
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

            <ExportModal
                open={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                onExport={handleExport}
                isExporting={false}
                entityName="provayder"
            />
        </div>
    );
}
