
import { useState } from "react";
// PHASE 14H: Use pageState from backend Decision Center (DUMB UI)
import { usePageState } from "@/app/security/usePageState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Combobox } from "@/shared/components/ui/combobox";
import { toast } from "sonner";
import { Upload, Globe, Building, Mail, Phone, MapPin, Loader2 } from "lucide-react";

const TIMEZONES = [
    { value: "Asia/Baku", label: "Asia/Baku (GMT+4)" },
    { value: "Europe/London", label: "Europe/London (GMT+0)" },
    { value: "Europe/Istanbul", label: "Europe/Istanbul (GMT+3)" },
    { value: "America/New_York", label: "America/New_York (GMT-5)" },
    { value: "Europe/Moscow", label: "Europe/Moscow (GMT+3)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
];

const CURRENCIES = [
    { value: "AZN", label: "AZN - Azərbaycan Manatı" },
    { value: "USD", label: "USD - ABŞ Dolları" },
    { value: "EUR", label: "EUR - Avro" },
    { value: "TRY", label: "TRY - Türk Lirəsi" },
];

import { ACTION_KEYS } from "@/app/navigation/action-keys";

export function GeneralSettingsForm() {
    // PHASE 14H: SAP PFCG Compliant - UI renders from backend pageState ONLY
    const { actions } = usePageState('Z_SETTINGS_COMPANY_PROFILE');
    const canUpdate = actions[ACTION_KEYS.SETTINGS_COMPANY_PROFILE_UPDATE];

    const [isLoading, setIsLoading] = useState(false);

    // Initial State (Mock Data)
    const [formData, setFormData] = useState({
        systemName: "RQI ERP Enterprise",
        legalName: "RQI Solutions LLC",
        description: "Enterprise Resource Planning System",
        taxId: "",
        website: "https://rqi.az",
        domain: "rqi",
        timezone: "Asia/Baku",
        currency: "AZN",
        email: "support@rqi.az",
        phone: "+994 50 123 45 67",
        address: "Bakı ş., Nərimanov r., A. Nemətulla küç. 25, AZ1052",
        country: "Azərbaycan",
        city: "Bakı"
    });

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        toast.success("Ümumi tənzimləmələr yeniləndi.");
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" /> Şirkət Profili (Tenant Profile)
                    </CardTitle>
                    <CardDescription>
                        Sistemin əsas identifikatorları və brendinq məlumatları.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Branding Section - Centered Top */}
                    <div className="flex justify-center mb-6">
                        <div className="flex flex-col items-center space-y-3">
                            <Label>Logo</Label>
                            <div className="h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer group">
                                <div className="h-16 w-16 mb-2 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl group-hover:scale-110 transition-transform">
                                    RQI
                                </div>
                                <span className="text-xs text-muted-foreground group-hover:text-primary">Dəyişmək üçün kliklə</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Sistem Adı (Display Name)</Label>
                                <Input
                                    value={formData.systemName}
                                    onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                                    disabled={!canUpdate}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rəsmi Hüquqi Ad (Legal Name)</Label>
                                <Input
                                    value={formData.legalName}
                                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                    disabled={!canUpdate}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Təsvir (Description)</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                disabled={!canUpdate}
                                className="resize-none h-20"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>VÖEN (Tax ID)</Label>
                                <Input
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    placeholder="0000000000"
                                    disabled={!canUpdate}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vebsayt</Label>
                                <div className="relative">
                                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="pl-9"
                                        disabled={!canUpdate}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Subdomain</Label>
                                <div className="flex rounded-md shadow-sm">
                                    <Input
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                        className="rounded-r-none"
                                        disabled={!canUpdate}
                                    />
                                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 bg-muted text-muted-foreground text-sm">
                                        .rqi.az
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <Separator />

                    {/* Localization Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Lokalizasiya
                            </h3>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Saat Qurşağı (Timezone)</Label>
                                    <Combobox
                                        options={TIMEZONES}
                                        value={formData.timezone}
                                        onSelect={(val) => setFormData({ ...formData, timezone: val })}
                                        disabled={!canUpdate}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Əsas Valyuta</Label>
                                    <Combobox
                                        options={CURRENCIES}
                                        value={formData.currency}
                                        onSelect={(val) => setFormData({ ...formData, currency: val })}
                                        disabled={!canUpdate}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Ünvan və Əlaqə
                            </h3>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ölkə</Label>
                                        <Input
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            disabled={!canUpdate}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Şəhər</Label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            disabled={!canUpdate}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tam Ünvan</Label>
                                    <Textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        disabled={!canUpdate}
                                        className="resize-none h-16"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="pl-9"
                                                disabled={!canUpdate}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Telefon</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="pl-9"
                                                disabled={!canUpdate}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                        Son yenilənmə: 02 Yanvar 2026, 14:30
                    </p>
                    {canUpdate && (
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yadda Saxla
                        </Button>
                    )}
                </CardFooter>
            </Card>


        </div >
    );
}
