import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useState, useEffect } from "react";
import type { Role } from "@/domains/system-console/api/system.contract";
import { Badge } from "@/shared/components/ui/badge";

export interface RoleFormValues {
    name: string;
    description: string;
    scope: 'SYSTEM' | 'TENANT';
    permissions: string[];
}

interface RoleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit" | "view";
    initialData: Role | null;
    onSubmit: (values: RoleFormValues) => Promise<void>;
    context: "admin" | "tenant";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    availablePermissions: any[];
}

export function RoleFormDialog({ open, onOpenChange, mode, initialData, onSubmit, context }: RoleFormDialogProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [scope, setScope] = useState<'SYSTEM' | 'TENANT'>('TENANT');

    useEffect(() => {
        if (open) {
            setName(initialData?.name || "");
            setDescription(initialData?.description || "");
            setScope(initialData?.scope || 'TENANT');
        }
    }, [open, initialData]);

    const handleSubmit = () => {
        onSubmit({ name, description, scope, permissions: [] });
    };

    const isSystemScopeAllowed = context === 'admin';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? "Yeni Rol" : mode === 'edit' ? "Rolu Düzəlt" : "Rol Baxışı"}</DialogTitle>
                    <DialogDescription>Rolun əhatə dairəsini (Scope) və detallarını təyin edin.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">

                    <div className="grid gap-2">
                        <Label>Səlahiyyət Səviyyəsi (Scope)</Label>
                        {isSystemScopeAllowed ? (
                            <Select value={scope} onValueChange={(v) => setScope(v as 'SYSTEM' | 'TENANT')} disabled={mode === 'view'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TENANT">Tenant (Biznes Səviyyəsi)</SelectItem>
                                    <SelectItem value="SYSTEM">System (Admin Panel)</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="flex items-center gap-2 border p-2 rounded-md bg-muted/50 text-muted-foreground text-sm">
                                <Badge variant="outline">TENANT</Badge>
                                <span>Biznes Səviyyəsi (Standart)</span>
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                            {scope === 'TENANT'
                                ? "Bu rol yalnız Tenant daxilində istifadəilərə verilə bilər."
                                : "Bu rol yalnız qlobal sistem adminlərinə verilə bilər."}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Rol Adı</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} disabled={mode === 'view'} placeholder="Məs: Maliyyə Meneceri" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Təsvir</Label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={mode === 'view'} placeholder="Rolun qısa təsviri..." />
                    </div>
                </div>
                {mode !== 'view' && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
                        <Button onClick={handleSubmit}>Yadda Saxla</Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
