import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Shield, Lock, Clock, Fingerprint, Loader2, Globe, Info, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// SAP-GRADE imports
import { type ResolvedNavNode } from "@/app/security/navigationResolver";
import { ScrollableSubTabsFromResolver } from "@/shared/components/ui/ScrollableSubTabs";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { PermissionSlugs } from "@/app/security/permission-slugs";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface SecurityConfig {
    password: {
        minLength: number;
        requireUppercase: boolean;
        requireNumbers: boolean;
        requireSymbols: boolean;
        expiryDays: number;
    };
    login: {
        maxAttempts: number;
        lockoutDuration: number;
        twoFactorEnforced: boolean;
    };
    session: {
        idleTimeout: number;
        concurrentSessions: boolean;
        maxConcurrentSessions: number;
    };
}

const DEFAULT_CONFIG: SecurityConfig = {
    password: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false,
        expiryDays: 90
    },
    login: {
        maxAttempts: 5,
        lockoutDuration: 30,
        twoFactorEnforced: false
    },
    session: {
        idleTimeout: 15,
        concurrentSessions: true,
        maxConcurrentSessions: 3
    }
};

interface SecuritySettingsFormProps {
    tabNode?: ResolvedNavNode;
}

export function SecuritySettingsForm({ tabNode }: SecuritySettingsFormProps) {
    const { permissions } = usePermissions();

    // Permission checks for each section
    const canUpdatePassword = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.SECURITY_POLICY.PASSWORD.UPDATE);
    const canUpdateLogin = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.SECURITY_POLICY.LOGIN.UPDATE);
    const canUpdateSession = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.SECURITY_POLICY.SESSION.UPDATE);

    const [config, setConfig] = useState<SecurityConfig>(DEFAULT_CONFIG);
    const [isSaving, setIsSaving] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // SAP-GRADE: Read subTab from URL
    const subTabs = tabNode?.children ?? [];
    const allowedKeys = subTabs.map(st => st.subTabKey || st.id);
    const urlSubTab = searchParams.get('subTab') || '';
    const currentSubTab = allowedKeys.includes(urlSubTab) ? urlSubTab : allowedKeys[0] || 'password';

    const handleTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('subTab', value);
        setSearchParams(newParams, { replace: true });
    };

    const handlePasswordChange = (key: keyof SecurityConfig['password'], value: any) => {
        if (!canUpdatePassword) return;
        setConfig(prev => ({ ...prev, password: { ...prev.password, [key]: value } }));
    };

    const handleLoginChange = (key: keyof SecurityConfig['login'], value: any) => {
        if (!canUpdateLogin) return;
        setConfig(prev => ({ ...prev, login: { ...prev.login, [key]: value } }));
    };

    const handleSessionChange = (key: keyof SecurityConfig['session'], value: any) => {
        if (!canUpdateSession) return;
        setConfig(prev => ({ ...prev, session: { ...prev.session, [key]: value } }));
    };

    const handleSaveSection = async (section: string) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(false);
        toast.success(`${section} yeniləndi.`);
    };

    // CONTENT MAP for each subTab
    const contentMap: Record<string, React.ReactNode> = {
        password: <PasswordPolicyTab config={config} handlePasswordChange={handlePasswordChange} handleSaveSection={handleSaveSection} canUpdate={canUpdatePassword} isSaving={isSaving} />,
        login: <LoginControlTab config={config} handleLoginChange={handleLoginChange} handleSaveSection={handleSaveSection} canUpdate={canUpdateLogin} isSaving={isSaving} />,
        session: <SessionManagementTab config={config} handleSessionChange={handleSessionChange} handleSaveSection={handleSaveSection} canUpdate={canUpdateSession} isSaving={isSaving} />,
        restrictions: <GlobalRestrictionsList />
    };

    const iconMap: Record<string, React.ReactNode> = {
        password: <Lock className="w-4 h-4" />,
        login: <Fingerprint className="w-4 h-4" />,
        session: <Clock className="w-4 h-4" />,
        restrictions: <Globe className="w-4 h-4" />
    };

    return (
        <Card className="border-t-4 border-t-red-600 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="h-5 w-5 text-red-600" />
                    Sistem Təhlükəsizliyi
                </CardTitle>
                <CardDescription>Qlobal təhlükəsizlik siyasətləri və giriş nəzarəti.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ScrollableSubTabsFromResolver
                    tabNode={tabNode}
                    value={currentSubTab}
                    onValueChange={handleTabChange}
                    contentMap={contentMap}
                    iconMap={iconMap}
                    variant="default"
                />
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PASSWORD POLICY TAB
// ═══════════════════════════════════════════════════════════════════════════
interface TabProps {
    config: SecurityConfig;
    handlePasswordChange?: (key: keyof SecurityConfig['password'], value: any) => void;
    handleLoginChange?: (key: keyof SecurityConfig['login'], value: any) => void;
    handleSessionChange?: (key: keyof SecurityConfig['session'], value: any) => void;
    handleSaveSection: (section: string) => void;
    canUpdate: boolean;
    isSaving: boolean;
}

function PasswordPolicyTab({ config, handlePasswordChange, handleSaveSection, canUpdate, isSaving }: TabProps) {
    return (
        <div className="space-y-6 pt-4 relative">
            {/* Read Mode Badge */}
            {!canUpdate && (
                <div className="absolute top-0 right-0">
                    <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200 flex items-center shadow-sm">
                        <Info className="w-3 h-3 mr-1" />
                        Oxu Rejimi
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Minimum Uzunluq: {config.password.minLength}</Label>
                        <Slider
                            min={6} max={32} step={1}
                            value={[config.password.minLength]}
                            onValueChange={(v) => handlePasswordChange?.('minLength', v[0])}
                            className="w-[150px]"
                            disabled={!canUpdate}
                        />
                    </div>
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                        <Label className="cursor-pointer" htmlFor="req-upper">Böyük hərflər (A-Z)</Label>
                        <Switch
                            id="req-upper"
                            checked={config.password.requireUppercase}
                            onCheckedChange={c => handlePasswordChange?.('requireUppercase', c)}
                            disabled={!canUpdate}
                        />
                    </div>
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                        <Label className="cursor-pointer" htmlFor="req-num">Rəqəmlər (0-9)</Label>
                        <Switch
                            id="req-num"
                            checked={config.password.requireNumbers}
                            onCheckedChange={c => handlePasswordChange?.('requireNumbers', c)}
                            disabled={!canUpdate}
                        />
                    </div>
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                        <Label className="cursor-pointer" htmlFor="req-sym">Simvollar (!@#)</Label>
                        <Switch
                            id="req-sym"
                            checked={config.password.requireSymbols}
                            onCheckedChange={c => handlePasswordChange?.('requireSymbols', c)}
                            disabled={!canUpdate}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Şifrənin Qüvvədə Olma Müddəti (Gün)</Label>
                    <Input
                        type="number"
                        value={config.password.expiryDays}
                        onChange={e => handlePasswordChange?.('expiryDays', parseInt(e.target.value))}
                        disabled={!canUpdate}
                    />
                    <p className="text-[10px] text-muted-foreground">0 = Müddətsiz. Tövsiyə olunan: 90 gün.</p>
                </div>
            </div>

            {canUpdate && (
                <div className="flex justify-end pt-4 mt-4 border-t">
                    <Button size="sm" onClick={() => handleSaveSection("Şifrə siyasəti")} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Yadda Saxla
                    </Button>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN CONTROL TAB
// ═══════════════════════════════════════════════════════════════════════════
function LoginControlTab({ config, handleLoginChange, handleSaveSection, canUpdate, isSaving }: TabProps) {
    const [show2FAConfirm, setShow2FAConfirm] = useState(false);
    const [pending2FA, setPending2FA] = useState(false);

    const handle2FAToggle = (enabled: boolean) => {
        setPending2FA(enabled);
        setShow2FAConfirm(true);
    };

    const confirm2FAChange = () => {
        handleLoginChange?.('twoFactorEnforced', pending2FA);
        toast.success(`Məcburi 2FA ${pending2FA ? 'aktivləşdirildi' : 'deaktiv edildi'}.`);
        setShow2FAConfirm(false);
    };

    return (
        <>
            <div className="space-y-6 pt-4 relative">
                {/* Read Mode Badge */}
                {!canUpdate && (
                    <div className="absolute top-0 right-0">
                        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200 flex items-center shadow-sm">
                            <Info className="w-3 h-3 mr-1" />
                            Oxu Rejimi
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Uğursuz Cəhdlər Limiti</Label>
                        <Input
                            type="number"
                            value={config.login.maxAttempts}
                            onChange={e => handleLoginChange?.('maxAttempts', parseInt(e.target.value))}
                            disabled={!canUpdate}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Bloklanma Müddəti (Dəqiqə)</Label>
                        <Input
                            type="number"
                            value={config.login.lockoutDuration}
                            onChange={e => handleLoginChange?.('lockoutDuration', parseInt(e.target.value))}
                            disabled={!canUpdate}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex justify-between items-center bg-orange-50 border border-orange-100 p-4 rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold text-orange-900">Məcburi 2FA (Bütün İstifadəçilər)</Label>
                            <p className="text-xs text-orange-700">Aktiv edildikdə, bütün istifadəçilərdən giriş zamanı OTP tələb olunacaq.</p>
                        </div>
                        <Switch
                            checked={config.login.twoFactorEnforced}
                            onCheckedChange={handle2FAToggle}
                            disabled={!canUpdate}
                        />
                    </div>
                </div>

                {canUpdate && (
                    <div className="flex justify-end pt-4 mt-4 border-t">
                        <Button size="sm" onClick={() => handleSaveSection("Giriş nəzarəti")} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Yadda Saxla
                        </Button>
                    </div>
                )}
            </div>

            <ConfirmationDialog
                open={show2FAConfirm}
                onOpenChange={setShow2FAConfirm}
                title="Məcburi 2FA Dəyişikliyi"
                description={`Bütün istifadəçilər üçün 2FA-nı ${pending2FA ? 'aktivləşdirmək' : 'deaktiv etmək'} istədiyinizə əminsiniz? Bu dəyişiklik dərhal qüvvəyə minəcək.`}
                confirmText="Təsdiqlə"
                cancelText="İmtina"
                onConfirm={confirm2FAChange}
                variant={pending2FA ? "default" : "destructive"}
            />
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT TAB
// ═══════════════════════════════════════════════════════════════════════════
function SessionManagementTab({ config, handleSessionChange, handleSaveSection, canUpdate, isSaving }: TabProps) {
    return (
        <div className="space-y-6 pt-4 relative">
            {/* Read Mode Badge */}
            {!canUpdate && (
                <div className="absolute top-0 right-0">
                    <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200 flex items-center shadow-sm">
                        <Info className="w-3 h-3 mr-1" />
                        Oxu Rejimi
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Sessiya Vaxtı (Timeout - Dəqiqə)</Label>
                    <Input
                        type="number"
                        value={config.session.idleTimeout}
                        onChange={e => handleSessionChange?.('idleTimeout', parseInt(e.target.value))}
                        disabled={!canUpdate}
                    />
                </div>
                <div className="flex items-start justify-between space-x-2 pt-2 border p-4 rounded-lg bg-slate-50">
                    <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="concurrent">Çoxsaylı Sessiyalar (Concurrent Login)</Label>
                            <Switch
                                id="concurrent"
                                checked={config.session.concurrentSessions}
                                onCheckedChange={c => handleSessionChange?.('concurrentSessions', c)}
                                disabled={!canUpdate}
                            />
                        </div>
                        {config.session.concurrentSessions && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-xs text-muted-foreground pb-1 block">Max Sessiya Sayı (Cihaz/İstifadəçi)</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="number"
                                        min={2}
                                        max={10}
                                        className="w-24 bg-white"
                                        value={config.session.maxConcurrentSessions}
                                        onChange={e => handleSessionChange?.('maxConcurrentSessions', parseInt(e.target.value))}
                                        disabled={!canUpdate}
                                    />
                                    <span className="text-sm text-muted-foreground">cihazdan girişə icazə verilir.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {canUpdate && (
                <div className="flex justify-end pt-4 mt-4 border-t">
                    <Button size="sm" onClick={() => handleSaveSection("Sessiya parametrləri")} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Yadda Saxla
                    </Button>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL RESTRICTIONS TAB
// ═══════════════════════════════════════════════════════════════════════════
import { restrictionColumns, type RestrictionPolicy } from "./restrictions-columns";
import { DataTable } from "@/shared/components/ui/data-table";
import { ExportModal } from "@/shared/components/ui/export-modal";
import { MultiSelect } from "@/shared/components/ui/multi-select";

const DAYS_OF_WEEK = [
    { id: 1, label: "Bazar Ertəsi" },
    { id: 2, label: "Çərşənbə Axşamı" },
    { id: 3, label: "Çərşənbə" },
    { id: 4, label: "Cümə Axşamı" },
    { id: 5, label: "Cümə" },
    { id: 6, label: "Şənbə" },
    { id: 0, label: "Bazar" },
];

const SCOPE_OPTIONS = [
    { label: "Bütün Tenantlar", value: "all_tenants" },
    { label: "Sistem İstifadəçiləri", value: "system_users" },
    { label: "Bütün İstifadəçilər", value: "all_users" },
    { label: "Müəyyən Tenant", value: "specific_tenant" }
];

function GlobalRestrictionsList() {
    const { permissions } = usePermissions();
    const canCreate = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.SECURITY_POLICY.RESTRICTIONS.CREATE);
    const canUpdate = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.SECURITY_POLICY.RESTRICTIONS.UPDATE);
    const canDelete = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.SECURITY_POLICY.RESTRICTIONS.DELETE);
    const canChangeStatus = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.SECURITY_POLICY.RESTRICTIONS.CHANGE_STATUS);
    const canExport = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.SECURITY.SECURITY_POLICY.RESTRICTIONS.EXPORT_TO_EXCEL);

    const [isExportOpen, setIsExportOpen] = useState(false);

    const [policies, setPolicies] = useState<RestrictionPolicy[]>([
        { id: 1, name: "Ofis Daxili Giriş", scope: ["Ofis İşçiləri"], status: "active", schedule: "B.E-C (09:00-18:00)", ip: "10.0.0.0/24" },
        { id: 2, name: "Remote Admin", scope: ["Sistem İstifadəçiləri"], status: "active", schedule: "Hər gün", ip: "VPN Only" }
    ]);
    const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);

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

    const [editingConfig, setEditingConfig] = useState<RestrictionPolicy | null>(null);
    const [newPolicyName, setNewPolicyName] = useState("");
    const [policyScope, setPolicyScope] = useState<string[]>([]);
    const [weeklySchedule, setWeeklySchedule] = useState<Record<number, { active: boolean; start: string; end: string }>>({
        1: { active: true, start: "09:00", end: "18:00" },
        2: { active: true, start: "09:00", end: "18:00" },
        3: { active: true, start: "09:00", end: "18:00" },
        4: { active: true, start: "09:00", end: "18:00" },
        5: { active: true, start: "09:00", end: "18:00" },
        6: { active: false, start: "10:00", end: "16:00" },
        0: { active: false, start: "10:00", end: "16:00" },
    });

    const handleScheduleChange = (dayId: number, field: "active" | "start" | "end", value: any) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], [field]: value }
        }));
    };

    const generateScheduleSummary = () => {
        const activeDays = Object.entries(weeklySchedule).filter(([_, s]) => s.active);
        if (activeDays.length === 0) return "Təyin edilməyib";
        if (activeDays.length === 7) return "Hər gün";
        const firstTime = activeDays[0][1];
        const sameTime = activeDays.every(([_, s]) => s.start === firstTime.start && s.end === firstTime.end);
        if (sameTime) {
            const count = activeDays.length;
            return `${count} gün (${firstTime.start}-${firstTime.end})`;
        }
        return "Fərdi Qrafik";
    };

    const handleSavePolicy = () => {
        const policyData = {
            name: newPolicyName || "Yeni Siyasət",
            scope: policyScope.length > 0 ? policyScope : ["Bütün İstifadəçilər"],
            status: "active" as const,
            schedule: generateScheduleSummary(),
            ip: "Məhdudiyyət Yoxdur",
            rawSchedule: weeklySchedule
        };

        if (editingConfig) {
            setPolicies(prev => prev.map(p => p.id === editingConfig.id ? { ...p, ...policyData, id: p.id } : p));
            toast.success("Siyasət yeniləndi");
        } else {
            setPolicies(prev => [...prev, { id: Date.now(), ...policyData }]);
            toast.success("Yeni məhdudiyyət siyasəti yaradıldı");
        }
        closeModal();
    };

    const closeModal = () => {
        setIsInternalModalOpen(false);
        setEditingConfig(null);
        setNewPolicyName("");
        setPolicyScope([]);
    };

    const toggleStatus = (id: number) => {
        if (!canChangeStatus) {
            toast.error("Status dəyişmək üçün icazəniz yoxdur.");
            return;
        }
        const policy = policies.find(p => p.id === id);
        if (!policy) return;

        const actionText = policy.status === "active" ? "deaktiv etmək" : "aktivləşdirmək";
        const newStatus = policy.status === "active" ? "inactive" : "active";

        setConfirmState({
            isOpen: true,
            title: `Statusu Dəyiş`,
            description: `Bu siyasəti ${actionText} istədiyinizə əminsiniz?`,
            variant: policy.status === "active" ? "destructive" : "default",
            action: () => {
                setPolicies(prev => prev.map(p =>
                    p.id === id ? { ...p, status: newStatus } : p
                ));
                toast.success(`Status dəyişdirildi: ${newStatus === "active" ? "Aktiv" : "Deaktiv"}`);
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const deletePolicy = (id: number) => {
        if (!canDelete) {
            toast.error("Bu əməliyyat üçün icazəniz yoxdur.");
            return;
        }
        setConfirmState({
            isOpen: true,
            title: "Siyasəti Sil",
            description: "Bu məhdudiyyət siyasətini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.",
            variant: "destructive",
            action: () => {
                setPolicies(prev => prev.filter(p => p.id !== id));
                toast.success("Siyasət silindi");
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleEditPolicy = (policy: RestrictionPolicy) => {
        if (!canUpdate) {
            toast.error("Bu əməliyyat üçün icazəniz yoxdur.");
            return;
        }
        setEditingConfig(policy);
        setNewPolicyName(policy.name);
        setPolicyScope(Array.isArray(policy.scope) ? policy.scope : [policy.scope]);
        if (policy.rawSchedule) {
            setWeeklySchedule(policy.rawSchedule);
        }
        setIsInternalModalOpen(true);
    };

    const columns = restrictionColumns(toggleStatus, deletePolicy, handleEditPolicy, { canUpdate, canDelete, canChangeStatus });

    const handleExport = (format: string) => {
        toast.success(`Məhdudiyyət siyahısı ${format.toUpperCase()} formatında ixrac edilir...`);
        setIsExportOpen(false);
    };

    return (
        <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Sistemə giriş üçün qlobal qaydalar və məhdudiyyətlər.</p>

            <Dialog open={isInternalModalOpen} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingConfig ? "Məhdudiyyətə Düzəliş Et" : "Yeni Məhdudiyyət Siyasəti"}</DialogTitle>
                        <DialogDescription>Sistemə giriş qaydaları və məhdudiyyətlər yaradın.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label>Siyasət Adı</Label>
                            <Input placeholder="Məs: Ofis İşçiləri" value={newPolicyName} onChange={e => setNewPolicyName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tətbiq Sahəsi (Scope)</Label>
                            <MultiSelect
                                options={SCOPE_OPTIONS}
                                selected={policyScope}
                                onChange={setPolicyScope}
                                placeholder="Kimlərə tətbiq olunacaq?"
                            />
                        </div>
                    </div>

                    <Tabs defaultValue="schedule" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="schedule">İş Rejimi (Schedule)</TabsTrigger>
                            <TabsTrigger value="ip">IP Məhdudiyyətləri</TabsTrigger>
                        </TabsList>

                        <TabsContent value="schedule" className="space-y-4 py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Həftəlik Cədvəl</Label>
                                    <div className="border rounded-md p-2 space-y-2 text-sm">
                                        <div className="grid grid-cols-12 gap-2 font-medium text-muted-foreground px-2">
                                            <div className="col-span-4">Gün</div>
                                            <div className="col-span-8">Saat Aralığı</div>
                                        </div>

                                        {DAYS_OF_WEEK.map((day) => (
                                            <div key={day.id} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded-sm hover:bg-muted/40 transition-colors">
                                                <div className="col-span-4 flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`day-${day.id}`}
                                                        checked={weeklySchedule[day.id]?.active}
                                                        onCheckedChange={(checked) => handleScheduleChange(day.id, 'active', !!checked)}
                                                    />
                                                    <Label htmlFor={`day-${day.id}`} className="cursor-pointer truncate">{day.label}</Label>
                                                </div>
                                                <div className="col-span-8 flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={weeklySchedule[day.id]?.start}
                                                        onChange={(e) => handleScheduleChange(day.id, 'start', e.target.value)}
                                                        disabled={!weeklySchedule[day.id]?.active}
                                                        className="h-8 text-xs"
                                                    />
                                                    <span className="text-muted-foreground">-</span>
                                                    <Input
                                                        type="time"
                                                        value={weeklySchedule[day.id]?.end}
                                                        onChange={(e) => handleScheduleChange(day.id, 'end', e.target.value)}
                                                        disabled={!weeklySchedule[day.id]?.active}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100 flex items-center gap-2">
                                    <span className="font-semibold">Xülasə: </span>
                                    {generateScheduleSummary()}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="ip" className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>İcazə Verilən IP Ünvanları (CIDR)</Label>
                                <Textarea placeholder={"192.168.1.0/24\n10.0.0.1"} rows={5} />
                                <p className="text-xs text-muted-foreground">Hər sətirdə bir IP və ya CIDR qeyd edin.</p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal}>Ləğv et</Button>
                        <Button onClick={handleSavePolicy}>{editingConfig ? "Yadda Saxla" : "Yarat"}</Button>
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
                entityName="məhdudiyyət"
            />

            <div className="border rounded-md">
                <DataTable
                    columns={columns}
                    data={policies}
                    searchKey="name"
                    onAddClick={canCreate ? () => setIsInternalModalOpen(true) : undefined}
                    addLabel="Yeni Məhdudiyyət"
                    onExportClick={canExport ? () => setIsExportOpen(true) : undefined}
                />
            </div>
        </div>
    );
}
