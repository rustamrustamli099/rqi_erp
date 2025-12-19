import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Reusing the type from RetentionPage (conceptual)
interface Policy {
    id: string;
    entity: string;
    scope: string;
    duration: string;
    action: string;
    status: string;
}

interface RetentionEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    policy: Policy; // passed as Policy
    onSave: (updated: Partial<Policy>) => void;
}

export function RetentionEditDialog({ open, onOpenChange, policy, onSave }: RetentionEditDialogProps) {
    const [formData, setFormData] = useState<Partial<Policy>>({});

    useEffect(() => {
        if (policy) {
            setFormData({
                duration: policy.duration,
                action: policy.action,
                status: policy.status
            });
        }
    }, [policy]);

    const handleSave = () => {
        onSave({ ...formData, id: policy.id });
        toast.success("Saxlanma qaydası yeniləndi");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Qaydaya Düzəliş: {policy.entity}</DialogTitle>
                    <DialogDescription>
                        {policy.scope} miqyasında tətbiq olunur.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Obyekt</Label>
                        <Input value={policy.entity} disabled className="col-span-3 bg-muted" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Müddət</Label>
                        <Input
                            value={formData.duration || ""}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className="col-span-3"
                            placeholder="Məs: 30 Days"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Əməliyyat</Label>
                        <Select
                            value={formData.action}
                            onValueChange={(v) => setFormData({ ...formData, action: v })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                                <SelectItem value="DELETE PERMANENTLY">DELETE PERMANENTLY</SelectItem>
                                <SelectItem value="ARCHIVE (S3)">ARCHIVE (S3)</SelectItem>
                                <SelectItem value="ANONYMIZE">ANONYMIZE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(v) => setFormData({ ...formData, status: v })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="PAUSED">PAUSED</SelectItem>
                                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
                    <Button onClick={handleSave}>Yadda Saxla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
