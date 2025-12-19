import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BranchFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    onSubmit: (data: any) => void;
}

export function BranchFormDialog({ open, onOpenChange, initialData, onSubmit }: BranchFormDialogProps) {
    const [formData, setFormData] = useState(initialData || {
        name: "",
        code: "",
        region: "",
        manager: "",
        address: "",
        phone: "",
        status: "active"
    });

    const isEdit = !!initialData;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Bölməni Redaktə Et" : "Yeni Bölmə Yarat"}</DialogTitle>
                    <DialogDescription>
                        Bölmə haqqında məlumatları daxil edin və yadda saxlayın.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bölmə Adı</Label>
                            <Input
                                placeholder="Məs: Sumqayıt Filialı"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Bölmə Kodu</Label>
                            <Input
                                placeholder="Məs: BR-002"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Region</Label>
                            <Select
                                value={formData.region}
                                onValueChange={val => setFormData({ ...formData, region: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Region seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="baku">Bakı</SelectItem>
                                    <SelectItem value="absheron">Abşeron</SelectItem>
                                    <SelectItem value="sumqayit">Sumqayıt</SelectItem>
                                    <SelectItem value="ganja">Gəncə</SelectItem>
                                    <SelectItem value="nakhchivan">Naxçıvan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={val => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktiv</SelectItem>
                                    <SelectItem value="inactive">Deaktiv</SelectItem>
                                    <SelectItem value="maintenance">Təmirdə</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Filial Müdiri</Label>
                        <Select
                            value={formData.manager}
                            onValueChange={val => setFormData({ ...formData, manager: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="İstifadəçi seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user1">Elvin Məmmədov (Admin)</SelectItem>
                                <SelectItem value="user2">Aysel Əliyeva (HR)</SelectItem>
                                <SelectItem value="user3">Rəşad Quliyev (Manager)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Ünvan</Label>
                        <Textarea
                            placeholder="Fiziki ünvan..."
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
                        <Button type="submit">{isEdit ? "Yenilə" : "Yarat"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
