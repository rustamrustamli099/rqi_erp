import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/shared/components/ui/sheet"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { X, Search } from "lucide-react"

interface RoleFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: any;
    setFilters: (filters: any) => void;
}

export function RoleFilterDrawer({ open, onOpenChange, filters, setFilters }: RoleFilterDrawerProps) {
    const handleReset = () => {
        setFilters({});
        onOpenChange(false);
    };

    const handleChange = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Filtrləmə</SheetTitle>
                    <SheetDescription>
                        Axtarış nəticələrini dəqiqləşdirmək üçün aşağıdakı parametrlərdən istifadə edin.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6 py-6">
                    {/* Explicit Search Field (Optional, as Toolbar has one too) */}
                    <div className="grid gap-2">
                        <Label>Açar söz (Ad və ya Təsvir)</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Məsələn: Admin..."
                                value={filters.search || ""}
                                onChange={(e) => handleChange("search", e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Əhatə Dairəsi (Scope)</Label>
                        <Select
                            value={filters.scope || "ALL"}
                            onValueChange={(val) => handleChange("scope", val === "ALL" ? undefined : val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Hamısı" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Hamısı</SelectItem>
                                <SelectItem value="SYSTEM">Sistem (System)</SelectItem>
                                <SelectItem value="TENANT">Tenant</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select
                            value={filters.status || "ALL"}
                            onValueChange={(val) => handleChange("status", val === "ALL" ? undefined : val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Hamısı" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Hamısı</SelectItem>
                                <SelectItem value="ACTIVE">Aktiv</SelectItem>
                                <SelectItem value="DRAFT">Qaralama (Draft)</SelectItem>
                                <SelectItem value="PENDING_APPROVAL">Təsdiq Gözləyən</SelectItem>
                                <SelectItem value="REJECTED">İmtina Edilmiş</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <SheetFooter className="gap-2">
                    <Button variant="outline" onClick={handleReset} className="w-full">
                        <X className="mr-2 h-4 w-4" /> Sıfırla
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Tətbiq Et
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
