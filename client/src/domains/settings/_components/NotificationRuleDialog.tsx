import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationRule } from "@/domains/settings/constants/notification-types";
import { MOCK_EVENTS } from "@/domains/settings/constants/notification-types";
import { useState, useEffect } from "react";
import { AudienceSelector } from "./AudienceSelector";
import { ChannelSelector } from "./ChannelSelector";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";

interface NotificationRuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: NotificationRule | null;
    mode: 'CREATE' | 'EDIT' | 'VIEW';
    onSave: (rule: NotificationRule) => void;
}

const DEFAULT_RULE: NotificationRule = {
    id: "",
    name: "",
    eventKey: "USER_CREATED",
    severity: "INFO",
    channels: ["EMAIL"],
    audience: { roles: [], users: [], includeTenantAdmins: false },
    delivery: { immediate: true, retryCount: 0 },
    template: { name: "", versions: ["v1"], locales: ["az"] },
    status: "ACTIVE",
    lastUpdated: new Date().toISOString()
};

export const NotificationRuleDialog = ({ open, onOpenChange, initialData, mode, onSave }: NotificationRuleDialogProps) => {
    const [formData, setFormData] = useState<NotificationRule>(DEFAULT_RULE);
    const isReadOnly = mode === 'VIEW';

    useEffect(() => {
        if (open) {
            setFormData(initialData ? { ...initialData } : { ...DEFAULT_RULE, id: Math.random().toString() });
        }
    }, [open, initialData]);

    const handleSave = () => {
        if (!formData.name) {
            toast.error("Qayda adı mütləqdir");
            return;
        }
        onSave(formData);
        onOpenChange(false);
        toast.success(mode === 'EDIT' ? "Qayda yeniləndi" : "Yeni qayda yaradıldı");
    };

    const getTitle = () => {
        if (mode === 'VIEW') return "Qaydaya Baxış";
        if (mode === 'EDIT') return "Qaydanı Yenilə";
        return "Yeni Bildiriş Qaydası";
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl w-[900px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        {getTitle()}
                        {isReadOnly && <Badge variant="outline">Read-Only</Badge>}
                    </SheetTitle>
                    <SheetDescription>
                        {mode === 'VIEW' ? "Bildiriş konfiqurasiyasına baxış." :
                            mode === 'EDIT' ? "Mövcud bildiriş konfiqurasiyasını dəyişdirin." :
                                "Sistem hadisəsi üçün yeni bildiriş qaydası yaradın."}
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general">Ümumi</TabsTrigger>
                            <TabsTrigger value="audience">Auditoriya</TabsTrigger>
                            <TabsTrigger value="channels">Kanallar</TabsTrigger>
                            <TabsTrigger value="delivery">Çatdırılma</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Qayda Adı</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Məs: Yeni İstifadəçi Xoşgəldin"
                                    disabled={isReadOnly}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Hadisə</Label>
                                    <Select
                                        value={formData.eventKey}
                                        onValueChange={(v) => setFormData({ ...formData, eventKey: v })}
                                        disabled={isReadOnly || mode === 'EDIT'}
                                    >
                                        <SelectTrigger disabled={isReadOnly || mode === 'EDIT'}>
                                            <SelectValue placeholder="Seçin..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MOCK_EVENTS.map(ev => (
                                                <SelectItem key={ev.key} value={ev.key}>{ev.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Vaciblik</Label>
                                    <Select
                                        value={formData.severity}
                                        onValueChange={(v: any) => setFormData({ ...formData, severity: v })}
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger disabled={isReadOnly}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INFO">Info</SelectItem>
                                            <SelectItem value="WARNING">Warning</SelectItem>
                                            <SelectItem value="CRITICAL">Critical</SelectItem>
                                            <SelectItem value="SECURITY">Security</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                                    disabled={isReadOnly}
                                >
                                    <SelectTrigger disabled={isReadOnly}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Aktiv</SelectItem>
                                        <SelectItem value="INACTIVE">Deaktiv</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>

                        <TabsContent value="audience" className="py-4 pointer-events-none">
                            <div className={isReadOnly ? "opacity-60" : ""}>
                                <AudienceSelector
                                    audience={formData.audience}
                                    onChange={(aud) => !isReadOnly && setFormData({ ...formData, audience: aud })}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="channels" className="py-4 pointer-events-none">
                            <div className={isReadOnly ? "opacity-60" : ""}>
                                <ChannelSelector
                                    value={formData.channels}
                                    onChange={(ch) => !isReadOnly && setFormData({ ...formData, channels: ch })}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="delivery" className="py-4 space-y-4">
                            <div className="flex items-center justify-between border p-4 rounded-md">
                                <div className="space-y-0.5">
                                    <Label>Dərhal Göndər</Label>
                                    <p className="text-xs text-muted-foreground">Hadisə baş verən kimi göndərilsin.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm text-muted-foreground">{formData.delivery.immediate ? "Bəli" : "Xeyr"}</Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, delivery: { ...formData.delivery, immediate: !formData.delivery.immediate } })}
                                        disabled={isReadOnly}
                                    >
                                        Dəyiş
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Təkrar Cəhd Sayı</Label>
                                <Input
                                    type="number"
                                    value={formData.delivery.retryCount}
                                    onChange={(e) => setFormData({ ...formData, delivery: { ...formData.delivery, retryCount: parseInt(e.target.value) || 0 } })}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">{isReadOnly ? "Bağla" : "Ləğv et"}</Button>
                    </SheetClose>
                    {!isReadOnly && (
                        <Button onClick={handleSave}>Yadda Saxla</Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
