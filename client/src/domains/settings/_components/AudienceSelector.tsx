import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input"; // Placeholder for proper MultiSelect
// In a real app we would use a Combobox/MultiSelect for roles & users.
// For now, we use simple inputs or mocks as per "Frontend Only" scope with no external deps if possible.

interface AudienceSelectorProps {
    audience: {
        roles: string[];
        users: string[];
        includeTenantAdmins: boolean;
    };
    onChange: (val: any) => void;
}

export const AudienceSelector = ({ audience, onChange }: AudienceSelectorProps) => {

    const update = (key: string, val: any) => {
        onChange({ ...audience, [key]: val });
    };

    return (
        <div className="space-y-4">
            <Label className="text-base font-semibold">Hədəf Auditoriya</Label>

            <div className="border p-4 rounded-md space-y-4 bg-muted/20">
                {/* 1. Tenant Admins */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Tenant Adminlər</Label>
                        <p className="text-xs text-muted-foreground">Bütün "Admin" roluna malik istifadəçiləri əhatə et.</p>
                    </div>
                    <Switch
                        checked={audience.includeTenantAdmins}
                        onCheckedChange={(c) => update('includeTenantAdmins', c)}
                    />
                </div>

                {/* 2. Roles Selector (Mock) */}
                <div className="space-y-2">
                    <Label>Rollar (Specific Roles)</Label>
                    <Input
                        placeholder="Məs: USER, MANAGER (vergüllə ayırın)"
                        value={audience.roles.join(', ')}
                        onChange={(e) => update('roles', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    />
                    <p className="text-xs text-muted-foreground">Seçilmiş rollara sahib bütün istifadəçilərə göndəriləcək.</p>
                </div>

                {/* 3. Specific Users (Mock) */}
                <div className="space-y-2">
                    <Label>Xüsusi İstifadəçilər (Login/Email)</Label>
                    <Input
                        placeholder="user@example.com..."
                        value={audience.users.join(', ')}
                        onChange={(e) => update('users', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    />
                </div>
            </div>
        </div>
    );
};
