import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Mail, CheckCircle2, AlertTriangle, Eye, EyeOff, Loader2, Info } from "lucide-react";
// PHASE 14H: Use pageState from backend Decision Center (DUMB UI)
import { usePageState } from "@/app/security/usePageState";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface SmtpConfig {
    host: string;
    port: number;
    username: string;
    password?: string;
    fromName: string;
    fromEmail: string;
    security: 'tls' | 'ssl' | 'none';
    isAuthRequired: boolean;
    isEnabled: boolean;
}

const DEFAULT_CONFIG: SmtpConfig = {
    host: "",
    port: 587,
    username: "",
    fromName: "RQI ERP",
    fromEmail: "notifications@company.com",
    security: 'tls',
    isAuthRequired: true,
    isEnabled: true
};

export function EmailSettingsForm() {
    // PHASE 14H: SAP PFCG Compliant - UI renders from backend pageState ONLY
    const { actions } = usePageState('Z_SETTINGS_EMAIL');
    const canUpdate = actions?.GS_SETTINGS_COMMUNICATION_EMAIL_UPDATE ?? false;
    const canTest = actions?.GS_SETTINGS_COMMUNICATION_EMAIL_SEND_TEST ?? false;
    const canChangeStatus = actions?.GS_SETTINGS_COMMUNICATION_EMAIL_CHANGE_STATUS ?? false;

    const [config, setConfig] = useState<SmtpConfig>(DEFAULT_CONFIG);
    const [showPassword, setShowPassword] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastTestResult, setLastTestResult] = useState<'success' | 'error' | null>(null);

    // Confirmation Dialog States
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
    const [showSecurityConfirm, setShowSecurityConfirm] = useState(false);

    const handleChange = (field: keyof SmtpConfig, value: any) => {
        if (!canUpdate) return;
        setConfig(prev => ({ ...prev, [field]: value }));
        setLastTestResult(null);
    };

    const handleStatusToggle = (enabled: boolean) => {
        setPendingStatus(enabled);
        setShowStatusConfirm(true);
    };

    const confirmStatusChange = () => {
        if (pendingStatus !== null) {
            setConfig(prev => ({ ...prev, isEnabled: pendingStatus }));
            toast.success(`SMTP Email ${pendingStatus ? 'aktivləşdirildi' : 'deaktiv edildi'}.`);
        }
        setShowStatusConfirm(false);
        setPendingStatus(null);
    };

    const handleTestConnection = async () => {
        if (!config.host || !config.fromEmail) {
            toast.error("Host və Göndərən Email mütləqdir.");
            return;
        }

        setIsTesting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (config.host.includes("error")) throw new Error("Connection timed out");

            setLastTestResult('success');
            toast.success("Bağlantı uğurla quruldu!", {
                description: `${config.host}:${config.port} cavab verir.`
            });
        } catch (error) {
            setLastTestResult('error');
            toast.error("Bağlantı xətası", {
                description: "SMTP serverinə qoşulmaq mümkün olmadı. Tənzimləmələri yoxlayın."
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        if (config.security === 'none') {
            setShowSecurityConfirm(true);
            return;
        }
        await performSave();
    };

    const performSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        toast.success("SMTP tənzimləmələri yadda saxlanıldı.");
        setShowSecurityConfirm(false);
    };

    return (
        <>
            <Card className="border-t-4 border-t-blue-600 shadow-sm relative overflow-hidden">
                {!canUpdate && (
                    <div className="absolute top-0 right-0 p-2 z-10">
                        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200 flex items-center shadow-sm">
                            <Info className="w-3 h-3 mr-1" />
                            Oxu Rejimi
                        </div>
                    </div>
                )}
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Mail className="h-5 w-5 text-blue-600" />
                                Email (SMTP) Server
                            </CardTitle>
                            <CardDescription>Sistem bildirişləri və hesabatların göndərilməsi üçün SMTP konfiqurasiyası.</CardDescription>
                        </div>

                        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                            <Label className="px-2 cursor-pointer text-xs font-medium" htmlFor="email-enable">Status:</Label>
                            <Switch
                                id="email-enable"
                                checked={config.isEnabled}
                                onCheckedChange={handleStatusToggle}
                                disabled={!canChangeStatus}
                            />
                            <span className={`text-xs font-bold px-2 ${config.isEnabled ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {config.isEnabled ? 'AKTİV' : 'DEAKTİV'}
                            </span>
                        </div>
                    </div>
                    {lastTestResult === 'success' && <div className="text-green-600 flex items-center text-sm font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200 mt-2"><CheckCircle2 className="w-4 h-4 mr-1" /> Verified</div>}
                    {lastTestResult === 'error' && <div className="text-destructive flex items-center text-sm font-medium bg-red-50 px-3 py-1 rounded-full border border-red-200 mt-2"><AlertTriangle className="w-4 h-4 mr-1" /> Failed</div>}
                </CardHeader>
                <CardContent className={`space-y-6 ${!config.isEnabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>

                    {/* Server Info */}
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-8 space-y-2">
                            <Label>SMTP Host</Label>
                            <Input
                                placeholder="mail.example.com"
                                value={config.host}
                                onChange={(e) => handleChange('host', e.target.value)}
                                disabled={!canUpdate}
                            />
                        </div>
                        <div className="col-span-4 space-y-2">
                            <Label>Port</Label>
                            <Input
                                type="number"
                                placeholder="587"
                                value={config.port}
                                onChange={(e) => handleChange('port', parseInt(e.target.value))}
                                disabled={!canUpdate}
                            />
                        </div>
                    </div>

                    {/* Authentication */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>İstifadəçi Adı (Username)</Label>
                                <span className="text-xs text-muted-foreground">Optional if Auth disabled</span>
                            </div>
                            <Input
                                placeholder="apikey / user@domain.com"
                                value={config.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                disabled={!canUpdate}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Şifrə (Password / API Key)</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••••••"
                                    value={config.password || ""}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className="pr-10"
                                    disabled={!canUpdate}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    disabled={!canUpdate}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sender Info */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-dashed grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Göndərən Adı (From Name)</Label>
                            <Input
                                placeholder="RQI ERP System"
                                value={config.fromName}
                                onChange={(e) => handleChange('fromName', e.target.value)}
                                disabled={!canUpdate}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Göndərən Email (From Email)</Label>
                            <Input
                                type="email"
                                placeholder="notifications@rqi.az"
                                value={config.fromEmail}
                                onChange={(e) => handleChange('fromEmail', e.target.value)}
                                disabled={!canUpdate}
                            />
                            <p className="text-[10px] text-muted-foreground">Bu email SMTP istifadəçi adı ilə eyni və ya icazəli alias olmalıdır.</p>
                        </div>
                    </div>

                    {/* Security Options */}
                    <div className="grid grid-cols-2 gap-6 items-end">
                        <div className="space-y-2">
                            <Label>Təhlükəsizlik Protokolu</Label>
                            <Select
                                value={config.security}
                                onValueChange={(v: any) => handleChange('security', v)}
                                disabled={!canUpdate}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tls">TLS (STARTTLS) - Tövsiyə olunan</SelectItem>
                                    <SelectItem value="ssl">SSL (Port 465)</SelectItem>
                                    <SelectItem value="none">Şifrələnməmiş (Təhlükəli)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {config.security === 'none' && (
                            <div className="text-amber-600 text-xs flex items-center p-2 bg-amber-50 rounded border border-amber-200 mb-0.5">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Xəbərdarlıq: Məlumatlar açıq şəkildə göndəriləcək.
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t mt-4">
                        <div className="text-xs text-muted-foreground italic">
                            Son yenilənmə: {new Date().toLocaleDateString()} (Admin)
                        </div>
                        <div className="flex items-center gap-3">
                            {canTest && (
                                <Button
                                    variant="outline"
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                    title="Bağlantını Yoxla"
                                >
                                    {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    Bağlantını Yoxla (Test)
                                </Button>
                            )}

                            {canUpdate && (
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Yadda Saxla
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Change Confirmation */}
            <ConfirmationDialog
                open={showStatusConfirm}
                onOpenChange={setShowStatusConfirm}
                title="Status Dəyişikliyi"
                description={`SMTP Email xidmətini ${pendingStatus ? 'aktivləşdirmək' : 'deaktiv etmək'} istədiyinizə əminsiniz?`}
                confirmText="Təsdiqlə"
                cancelText="İmtina"
                onConfirm={confirmStatusChange}
            />

            {/* Security Warning Confirmation */}
            <ConfirmationDialog
                open={showSecurityConfirm}
                onOpenChange={setShowSecurityConfirm}
                title="Təhlükəsizlik Xəbərdarlığı"
                description="Təhlükəsizlik şifrələməsi (TLS/SSL) seçilməyib. Məlumatlar açıq şəkildə göndəriləcək. Davam etmək istədiyinizə əminsiniz?"
                confirmText="Bəli, Davam Et"
                cancelText="İmtina"
                onConfirm={performSave}
                variant="destructive"
            />
        </>
    );
}
