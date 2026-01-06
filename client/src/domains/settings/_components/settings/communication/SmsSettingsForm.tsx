import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MessageSquare, Smartphone, Zap, Eye, EyeOff, Loader2, AlertTriangle, Info } from "lucide-react";
import { usePermissions } from "@/app/auth/hooks/usePermissions";
import { PermissionSlugs } from "@/app/security/permission-slugs";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type SmsProviderType = 'twilio' | 'infobip' | 'msm' | 'custom';

interface SmsConfig {
    provider: SmsProviderType;
    senderId: string;
    isEnabled: boolean;
    credentials: Record<string, string>;
}

const PROVIDERS = {
    twilio: { label: "Twilio", fields: ['Account SID', 'Auth Token'] },
    infobip: { label: "Infobip", fields: ['API Key', 'Base URL'] },
    msm: { label: "Lsim / MSM (Azərbaycan)", fields: ['API Username', 'API Password'] },
    custom: { label: "Custom Webhook", fields: ['Webhook URL', 'API Key / Token'] }
};

export function SmsSettingsForm() {
    const { permissions } = usePermissions();
    const canUpdate = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.SMTP_SMS.UPDATE);
    const canTest = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.SMTP_SMS.SEND_TEST);
    const canChangeStatus = permissions.includes(PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.SMTP_SMS.CHANGE_STATUS);

    const [config, setConfig] = useState<SmsConfig>({
        provider: 'twilio',
        senderId: '',
        isEnabled: true,
        credentials: {}
    });

    const [showSecrets, setShowSecrets] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Confirmation Dialog States
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);

    const handleCredentialChange = (key: string, value: string) => {
        if (!canUpdate) return;
        setConfig(prev => ({
            ...prev,
            credentials: { ...prev.credentials, [key]: value }
        }));
    };

    const handleStatusToggle = (enabled: boolean) => {
        setPendingStatus(enabled);
        setShowStatusConfirm(true);
    };

    const confirmStatusChange = () => {
        if (pendingStatus !== null) {
            setConfig(prev => ({ ...prev, isEnabled: pendingStatus }));
            toast.success(`SMS Gateway ${pendingStatus ? 'aktivləşdirildi' : 'deaktiv edildi'}.`);
        }
        setShowStatusConfirm(false);
        setPendingStatus(null);
    };

    const handleSendTest = () => {
        if (!config.senderId) {
            toast.error("Sender ID daxil edilməyib.");
            return;
        }

        const testPhone = window.prompt("Test SMS üçün nömrə daxil edin (məs: +99450xxxxxxx):");
        if (testPhone) {
            toast.promise(
                new Promise(resolve => setTimeout(resolve, 2000)),
                {
                    loading: 'SMS göndərilir...',
                    success: 'Test SMS uğurla göndərildi!',
                    error: 'Xəta baş verdi.'
                }
            );
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        toast.success("SMS Gateway tənzimləmələri yeniləndi.");
    };

    const currentProviderFields = PROVIDERS[config.provider].fields;

    return (
        <>
            <Card className="border-t-4 border-t-purple-600 shadow-sm relative overflow-hidden">
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
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                                SMS Gateway
                            </CardTitle>
                            <CardDescription>Müştərilərə və işçilərə SMS bildirişlərinin göndərilməsi.</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                            <Label className="px-2 cursor-pointer text-xs font-medium" htmlFor="sms-enable">Status:</Label>
                            <Switch
                                checked={config.isEnabled}
                                onCheckedChange={handleStatusToggle}
                                id="sms-enable"
                                disabled={!canChangeStatus}
                            />
                            <span className={`text-xs font-bold px-2 ${config.isEnabled ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {config.isEnabled ? 'AKTİV' : 'DEAKTİV'}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className={`space-y-6 ${!config.isEnabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>

                    {/* Provider Selection */}
                    <div className="grid gap-2">
                        <Label>SMS Provayderi</Label>
                        <Select
                            value={config.provider}
                            onValueChange={(v: SmsProviderType) => setConfig(p => ({ ...p, provider: v, credentials: {} }))}
                            disabled={!canUpdate}
                        >
                            <SelectTrigger className="h-12 text-lg">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PROVIDERS).map(([key, info]) => (
                                    <SelectItem key={key} value={key}>{info.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Credentials */}
                        <div className="space-y-4 border p-4 rounded-lg bg-card/50">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Autentifikasiya</h4>

                            {currentProviderFields.map((field) => (
                                <div key={field} className="space-y-2">
                                    <Label>{field}</Label>
                                    <div className="relative">
                                        <Input
                                            type={field.toLowerCase().includes("token") || field.toLowerCase().includes("password") || field.toLowerCase().includes("key") ? (showSecrets ? "text" : "password") : "text"}
                                            placeholder={`Enter ${field}...`}
                                            value={config.credentials[field] || ""}
                                            onChange={(e) => handleCredentialChange(field, e.target.value)}
                                            className="pr-10 font-mono text-sm"
                                            disabled={!canUpdate}
                                        />
                                        {(field.toLowerCase().includes("token") || field.toLowerCase().includes("password") || field.toLowerCase().includes("key")) && (
                                            <button
                                                type="button"
                                                onClick={() => setShowSecrets(!showSecrets)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                disabled={!canUpdate}
                                            >
                                                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {config.provider === 'custom' && (
                                <div className="space-y-2">
                                    <Label>Payload Template (JSON)</Label>
                                    <Textarea
                                        className="font-mono text-xs"
                                        rows={5}
                                        placeholder='{ "to": "{{phone}}", "body": "{{message}}" }'
                                        disabled={!canUpdate}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Available variables: <code>{'{{phone}}'}</code>, <code>{'{{message}}'}</code></p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sender Configuration */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Sender ID / Başlıq</Label>
                                <Input
                                    placeholder="Example: RQI_ERP"
                                    value={config.senderId}
                                    maxLength={11}
                                    onChange={(e) => setConfig(p => ({ ...p, senderId: e.target.value }))}
                                    disabled={!canUpdate}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    GSM standartlarına görə maksimum 11 simvol (Rəqəm və ya Hərf).
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs text-yellow-800 space-y-2">
                                <div className="font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Diqqət</div>
                                <p>Bəzi provayderlərdə (xüsusilə yerli MSM) Sender ID əvvəlcədən təsdiqlənməlidir. Təsdiqlənməmiş başlıq istifadə etmək SMS-in çatdırılmamasına səbəb ola bilər.</p>
                            </div>

                            {canTest && (
                                <Button
                                    variant="secondary"
                                    className="w-full mt-4"
                                    onClick={handleSendTest}
                                    title="Test mesaj göndər"
                                >
                                    <Smartphone className="w-4 h-4 mr-2" />
                                    Test SMS Göndər
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end border-t mt-4">
                        {canUpdate && (
                            <Button onClick={handleSave} disabled={isSaving} className="min-w-[150px]">
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Yadda Saxla
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Status Change Confirmation */}
            <ConfirmationDialog
                open={showStatusConfirm}
                onOpenChange={setShowStatusConfirm}
                title="Status Dəyişikliyi"
                description={`SMS Gateway xidmətini ${pendingStatus ? 'aktivləşdirmək' : 'deaktiv etmək'} istədiyinizə əminsiniz?`}
                confirmText="Təsdiqlə"
                cancelText="İmtina"
                onConfirm={confirmStatusChange}
            />
        </>
    );
}
