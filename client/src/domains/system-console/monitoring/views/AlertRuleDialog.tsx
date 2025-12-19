
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { AlertRule } from "./monitoring-types";

interface AlertRuleDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (rule: AlertRule) => void;
    existingRule?: AlertRule | null;
}

const CHANNELS = ["System", "Email", "SMS", "Webhook"];

export function AlertRuleDialog({ open, onClose, onSave, existingRule }: AlertRuleDialogProps) {
    const [name, setName] = useState("");
    const [source, setSource] = useState<AlertRule["metricSource"]>("System");
    const [severity, setSeverity] = useState<AlertRule["severity"]>("INFO");
    const [condition, setCondition] = useState("");
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            if (existingRule) {
                setName(existingRule.name);
                setSource(existingRule.metricSource);
                setSeverity(existingRule.severity);
                setCondition(existingRule.condition);
                setSelectedChannels(existingRule.channels);
            } else {
                // Reset for new
                setName("");
                setSource("System");
                setSeverity("INFO");
                setCondition("");
                setSelectedChannels(["System"]);
            }
        }
    }, [open, existingRule]);

    const handleSave = () => {
        const rule: AlertRule = {
            id: existingRule ? existingRule.id : Math.random().toString(36).substr(2, 9),
            name,
            metricSource: source,
            metricType: "Threshold", // Simplified for MVP
            condition,
            severity,
            channels: selectedChannels as any,
            status: existingRule ? existingRule.status : "Active",
            lastTriggered: existingRule?.lastTriggered
        };
        onSave(rule);
        onClose();
    };

    const toggleChannel = (channel: string) => {
        setSelectedChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingRule ? "Qaydanı Düzəlt" : "Yeni Xəbərdarlıq Qaydası"}</DialogTitle>
                    <DialogDescription>
                        Sistem monitorinqi üçün yeni qayda yaradın və ya mövcud qaydanı redaktə edin.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Ad</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Məs: CPU High Load" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="source" className="text-right">Mənbə</Label>
                        <Select value={source} onValueChange={(v: any) => setSource(v)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Mənbə seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="System">System</SelectItem>
                                <SelectItem value="Billing">Billing</SelectItem>
                                <SelectItem value="Security">Security</SelectItem>
                                <SelectItem value="Approvals">Approvals</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="severity" className="text-right">Vaciblik</Label>
                        <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Vaciblik dərəcəsi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INFO">Məlumat (Info)</SelectItem>
                                <SelectItem value="WARNING">Xəbərdarlıq (Warning)</SelectItem>
                                <SelectItem value="CRITICAL">Kritik (Critical)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="condition" className="text-right">Şərt</Label>
                        <Input id="condition" value={condition} onChange={(e) => setCondition(e.target.value)} className="col-span-3" placeholder="Məs: > 90%" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right mt-2">Kanallar</Label>
                        <div className="col-span-3 space-y-2 border p-3 rounded-md">
                            {CHANNELS.map(ch => (
                                <div key={ch} className="flex items-center space-x-2">
                                    <Checkbox id={`ch-${ch}`} checked={selectedChannels.includes(ch)} onCheckedChange={() => toggleChannel(ch)} />
                                    <Label htmlFor={`ch-${ch}`}>{ch}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Ləğv et</Button>
                    <Button onClick={handleSave}>Yadda Saxla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
