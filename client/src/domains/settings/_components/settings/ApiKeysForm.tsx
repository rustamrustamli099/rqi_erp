import { useState, useMemo } from "react";
import { DataTable } from "@/shared/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Calendar, Clock, Hourglass, Copy, RefreshCw, Trash2, Shield, Activity, Lock, AlertTriangle, Key, MoreHorizontal } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiKeysColumns, type ApiKey } from "./api-key-columns";
import { Separator } from "@/components/ui/separator";
import { Combobox } from "@/shared/components/ui/combobox";
import { type SortingState, type ColumnFiltersState, type VisibilityState, type RowSelectionState } from "@tanstack/react-table";

type ValidityType = "indefinite" | "range" | "duration";

const AVAILABLE_SCOPES = [
    { value: "billing:read", label: "Billing: Read" },
    { value: "billing:write", label: "Billing: Write" },
    { value: "users:read", label: "Users: Read" },
    { value: "users:write", label: "Users: Write" },
    { value: "reports:access", label: "Reports: Access" }
];

interface ApiKeyExtended extends ApiKey {
    scopes: string[];
    rateLimit: number; // req/min
    quota: number; // req/month
    quotaUsed: number;
    auditLogs: { action: string, date: string, status: string }[];
}

export function ApiKeysForm() {
    // Enhanced Mock Data
    const [apiKeys, setApiKeys] = useState<ApiKeyExtended[]>([
        {
            id: 1,
            name: "Mobil Tətbiq V1",
            prefix: "sk_live_...",
            scope: "billing:read, users:read",
            status: "active",
            expiresAt: "Müddətsiz",
            lastUsed: "2024-05-10",
            scopes: ["billing:read", "users:read"],
            rateLimit: 60,
            quota: 10000,
            quotaUsed: 4500,
            auditLogs: [
                { action: "Created", date: "2024-01-01 10:00", status: "Success" },
                { action: "Accessed", date: "2024-05-10 14:30", status: "Success" }
            ]
        },
        {
            id: 2,
            name: "İnteqrasiya Serveri",
            prefix: "sk_test_...",
            scope: "users:write",
            status: "inactive",
            expiresAt: "2024-01-01 12:00",
            lastUsed: "2023-12-30",
            scopes: ["users:write"],
            rateLimit: 100,
            quota: 5000,
            quotaUsed: 5000, // Maxed out
            auditLogs: [
                { action: "Quota Exceeded", date: "2023-12-30 23:59", status: "Failed" }
            ]
        },
    ]);

    // Table State
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState<ApiKeyExtended | null>(null);

    // Form State
    const [newKeyName, setNewKeyName] = useState("");
    const [validityType, setValidityType] = useState<ValidityType>("indefinite");
    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
    const [rateLimit, setRateLimit] = useState("60");
    const [quota, setQuota] = useState("10000");

    // Range State
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("18:00");

    // Duration State
    const [durationVal, setDurationVal] = useState("1");
    const [durationUnit, setDurationUnit] = useState("hours");

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: "destructive" | "default";
    }>({
        isOpen: false,
        title: "",
        description: "",
        action: () => { },
        variant: "default"
    });

    const handleCreateKey = () => {
        let expiresAt = "Müddətsiz";

        if (validityType === "range") {
            if (!startDate || !endDate) {
                toast.error("Zəhmət olmasa başlanğıc və bitiş tarixlərini seçin");
                return;
            }
            expiresAt = `${startDate} ${startTime} - ${endDate} ${endTime}`;
        } else if (validityType === "duration") {
            const unitLabel = durationUnit === 'hours' ? 'saat' : durationUnit === 'days' ? 'gün' : 'həftə';
            expiresAt = `${durationVal} ${unitLabel} (Hazırdan)`;
        }

        setApiKeys(prev => [...prev, {
            id: Date.now(),
            name: newKeyName || "Yeni Açar",
            prefix: "sk_live_" + Math.random().toString(36).substring(7),
            scope: selectedScopes.length > 0 ? selectedScopes.join(", ") : "Read-Only",
            status: "active",
            expiresAt: expiresAt,
            lastUsed: "-",
            scopes: selectedScopes,
            rateLimit: parseInt(rateLimit) || 60,
            quota: parseInt(quota) || 1000,
            quotaUsed: 0,
            auditLogs: [{ action: "Created", date: new Date().toLocaleString(), status: "Success" }]
        }]);

        setIsInternalModalOpen(false);
        resetForm();
        toast.success("Yeni API açarı yaradıldı");
    };

    const resetForm = () => {
        setNewKeyName("");
        setValidityType("indefinite");
        setStartDate("");
        setEndDate("");
        setDurationVal("1");
        setSelectedScopes([]);
        setRateLimit("60");
        setQuota("10000");
    };

    const handleCopy = (prefix: string) => {
        navigator.clipboard.writeText(prefix);
        toast.success("Açar kopyalandı");
    };

    const handleRotate = (id: number) => {
        setConfirmState({
            isOpen: true,
            title: "Açarı Yenilə (Rotate)",
            description: "Bu açarı yeniləmək istədiyinizə əminsiniz? Köhnə açar dərhal ləğv ediləcək və yeni açar yaradılacaq.",
            variant: "default",
            action: () => {
                setApiKeys(prev => prev.map(k => k.id === id ? { ...k, prefix: "sk_live_NEW_" + Math.random().toString(36).substring(7), lastUsed: "-" } : k));
                toast.success("Açar yeniləndi.");
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleRevoke = (id: number) => {
        setConfirmState({
            isOpen: true,
            title: "Açarı Ləğv Et",
            description: "Bu API açarını ləğv etmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.",
            variant: "destructive",
            action: () => {
                setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: "inactive" } : k));
                toast.success("Açar ləğv edildi");
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleView = (row: ApiKey) => {
        const fullKey = apiKeys.find(k => k.id === row.id);
        if (fullKey) {
            setSelectedKey(fullKey);
            setIsDetailsOpen(true);
        }
    }

    const handleEdit = (key: ApiKey) => {
        setNewKeyName(key.name);
        setSelectedScopes(key.scopes || []);
        setRateLimit(key.rateLimit?.toString() || "60");
        setQuota(key.quota?.toString() || "10000");
        // Simple mapping for demo. Real implementation would parse dates or validity.
        setValidityType("indefinite"); // Reset to default for edit modal
        setIsInternalModalOpen(true);
    };



    const columns = useMemo(() => apiKeysColumns(
        handleCopy,
        handleRotate,
        handleRevoke,
        handleView,
        handleEdit
    ), []);

    // Table State

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">API Açarları</h3>
                    <p className="text-sm text-muted-foreground">İnteqrasiyalar üçün təhlükəsizlik açarlarını idarə edin.</p>
                </div>
            </div>

            <Dialog open={isInternalModalOpen} onOpenChange={(open: boolean) => { setIsInternalModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Yeni API Açarı</DialogTitle>
                        <DialogDescription>Açar adı, hüquqlar və limitləri təyin edin.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Açar Adı</Label>
                                <Input placeholder="Məs: Mobil Tətbiq" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Scopes (Hüquqlar)</Label>
                                <Combobox
                                    options={AVAILABLE_SCOPES}
                                    value=""
                                    onSelect={(val) => {
                                        if (val && !selectedScopes.includes(val)) setSelectedScopes([...selectedScopes, val]);
                                    }}
                                    placeholder="Hüquq seçin..."
                                />
                                <div className="flex gap-1 flex-wrap mt-2">
                                    {selectedScopes.map(scope => (
                                        <Badge key={scope} variant="secondary" className="cursor-pointer" onClick={() => setSelectedScopes(selectedScopes.filter(s => s !== scope))}>
                                            {scope} ×
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rate Limit (Req/Min)</Label>
                                <Input type="number" value={rateLimit} onChange={e => setRateLimit(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Aylıq Kvota (Total Req)</Label>
                                <Input type="number" value={quota} onChange={e => setQuota(e.target.value)} />
                            </div>
                        </div>

                        <Separator />

                        {/* Validity Type Radio */}
                        <div className="space-y-3">
                            <Label>Keçərlilik Müddəti</Label>
                            <RadioGroup value={validityType} onValueChange={(v) => setValidityType(v as ValidityType)} className="grid grid-cols-3 gap-2">
                                <div className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer ${validityType === 'indefinite' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                                    <RadioGroupItem value="indefinite" id="r1" />
                                    <Label htmlFor="r1" className="cursor-pointer text-sm font-medium">Müddətsiz</Label>
                                </div>
                                <div className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer ${validityType === 'range' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                                    <RadioGroupItem value="range" id="r2" />
                                    <Label htmlFor="r2" className="cursor-pointer text-sm font-medium">Tarix Aralığı</Label>
                                </div>
                                <div className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer ${validityType === 'duration' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                                    <RadioGroupItem value="duration" id="r3" />
                                    <Label htmlFor="r3" className="cursor-pointer text-sm font-medium">Müddətli</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* CONDITIONAL INPUTS */}
                        {validityType === 'range' && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200 p-3 bg-muted/20 rounded-lg border">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Başlanğıc</Label>
                                    <div className="flex gap-2">
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-8 text-xs" />
                                        <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-8 text-xs" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Bitiş</Label>
                                    <div className="flex gap-2">
                                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-8 text-xs" />
                                        <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-8 text-xs" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {validityType === 'duration' && (
                            <div className="flex gap-2 items-end animate-in fade-in zoom-in-95 duration-200 p-3 bg-muted/20 rounded-lg border">
                                <div className="space-y-2 flex-1">
                                    <Label>Müddət</Label>
                                    <Input type="number" min="1" value={durationVal} onChange={e => setDurationVal(e.target.value)} />
                                </div>
                                <div className="space-y-2 w-[140px]">
                                    <Label>Vahid</Label>
                                    <Select value={durationUnit} onValueChange={setDurationUnit}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hours">Saat</SelectItem>
                                            <SelectItem value="days">Gün</SelectItem>
                                            <SelectItem value="weeks">Həftə</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInternalModalOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleCreateKey}>Açar Yarat</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ApiKeyDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} apiKey={selectedKey} />

            <ConfirmationDialog
                open={confirmState.isOpen}
                onOpenChange={(val: boolean) => setConfirmState(prev => ({ ...prev, isOpen: val }))}
                title={confirmState.title}
                description={confirmState.description}
                onConfirm={confirmState.action}
                variant={confirmState.variant}
            />

            <div className="py-4">
                <DataTable
                    columns={columns}
                    data={apiKeys}
                    searchKey="name"
                    filterPlaceholder="Axtar..."
                    onAddClick={() => setIsInternalModalOpen(true)}
                    addLabel="Yeni Açar Yarat"
                />
            </div>
        </div>
    );
}

function ApiKeyDetailsDialog({ open, onOpenChange, apiKey }: { open: boolean, onOpenChange: (open: boolean) => void, apiKey: ApiKeyExtended | null }) {
    if (!apiKey) return null;

    const usagePercent = (apiKey.quotaUsed / apiKey.quota) * 100;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Key className="w-5 h-5 text-primary" />
                        <Badge variant={apiKey.status === 'active' ? 'default' : 'destructive'}>{apiKey.status.toUpperCase()}</Badge>
                    </div>
                    <DialogTitle>{apiKey.name}</DialogTitle>
                    <DialogDescription>ID: {apiKey.id} • Prefix: {apiKey.prefix}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-6 py-4">
                    <div className="col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Aylıq Kvota İstifadəsi</span>
                                <span className="font-medium">{apiKey.quotaUsed} / {apiKey.quota}</span>
                            </div>
                            <Progress value={usagePercent} className={usagePercent > 90 ? "bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-600 dark:[&>div]:bg-red-500" : ""} />
                            <p className="text-xs text-muted-foreground pt-1">Limit: {apiKey.rateLimit} req/min</p>
                        </div>

                        {/* Logs */}
                        <div className="border rounded-lg">
                            <div className="bg-muted/50 p-2 border-b text-sm font-medium flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Son Fəaliyyətlər (Audit Log)
                            </div>
                            <ScrollArea className="h-[200px] p-0">
                                <div className="divide-y">
                                    {apiKey.auditLogs.map((log, i) => (
                                        <div key={i} className="p-3 text-sm flex justify-between items-center bg-muted/30 hover:bg-muted/50 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="font-medium">{log.action}</span>
                                            </div>
                                            <div className="text-muted-foreground text-xs">{log.date}</div>
                                        </div>
                                    ))}
                                    {/* Fake logs filler */}
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={`fake_${i}`} className="p-3 text-sm flex justify-between items-center bg-muted/30 hover:bg-muted/50 opacity-60 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                                <span className="font-medium">API Call: billing:read</span>
                                            </div>
                                            <div className="text-muted-foreground text-xs">2024-05-10 14:2{i}</div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <div className="border-l pl-6 space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2 text-sm"><Lock className="w-4 h-4" /> Hüquqlar (Scopes)</h4>
                            <div className="flex flex-wrap gap-1">
                                {apiKey.scopes.map(s => (
                                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                ))}
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4" /> Təhlükəsizlik</h4>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start text-xs" onClick={() => toast.success("Açar rotate edildi")}>
                                    <RefreshCw className="mr-2 h-3 w-3" /> Rotate Key
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-xs text-destructive hover:text-destructive" onClick={() => toast.success("Açar deaktiv edildi")}>
                                    <Shield className="mr-2 h-3 w-3" /> Deaktiv Et
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Bağla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
