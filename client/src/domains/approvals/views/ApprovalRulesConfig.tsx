import { useState, useMemo } from "react";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Workflow, Edit2, Trash2, ShieldAlert, GitMerge, ListOrdered, CheckCircle2, MoreHorizontal, Copy, Power, User, Users, ChevronDown, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MOCK_RULES } from "../constants/approval-types";
import type { ApprovalRule, WorkflowStep } from "../constants/approval-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/shared/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { MultiSelect } from "@/shared/components/ui/multi-select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Mock Data for Autocomplete
const MOCK_ROLES = ["ADMIN", "CEO", "FINANCE_MANAGER", "HR_MANAGER", "DEPT_HEAD"];
const MOCK_USERS = ["user_1 (Ali)", "user_2 (Vali)", "user_3 (Mammad)"];

// --- Helper Components ---
const StepCard = ({
    step,
    index,
    onDelete,
    onUpdate
}: {
    step: WorkflowStep,
    index: number,
    onDelete: (id: string) => void,
    onUpdate: (step: WorkflowStep) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="relative pl-8 pb-8 last:pb-0 border-l-2 border-muted hover:border-primary/50 transition-colors">
            <div className="absolute -left-[9px] top-0 bg-background border-2 border-primary rounded-full w-4 h-4 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full" />
            </div>

            <Card className="mb-4 shadow-sm border-l-4 border-l-primary/20">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2 text-muted-foreground">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        <Badge variant="outline" className="bg-primary/5 font-mono">
                            {index + 1}-ci Mərhələ
                        </Badge>
                        <span className="font-semibold text-sm">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => onDelete(step.id)}>
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </CardHeader>

                {isExpanded && (
                    <CardContent className="p-4 space-y-4 pt-0">
                        {/* Name Input */}
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Mərhələ Adı</Label>
                            <Input
                                value={step.name}
                                onChange={(e) => onUpdate({ ...step, name: e.target.value })}
                                className="h-8"
                            />
                        </div>

                        {/* Approvers (Mixed) */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase">Təsdiqçilər (Kimlər təsdiqləməlidir?)</Label>
                            <div className="bg-muted/30 p-3 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs flex items-center gap-1"><Users className="w-3 h-3" /> Rollar</Label>
                                    <MultiSelect
                                        options={MOCK_ROLES.map(r => ({ label: r, value: r }))}
                                        selected={step.approverRoles}
                                        onChange={(vals) => onUpdate({ ...step, approverRoles: vals })}
                                        placeholder="Rollar..."
                                        className="bg-background"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs flex items-center gap-1"><User className="w-3 h-3" /> Xüsusi İstifadəçilər</Label>
                                    <MultiSelect
                                        options={MOCK_USERS.map(u => ({ label: u, value: u }))}
                                        selected={step.approverUsers}
                                        onChange={(vals) => onUpdate({ ...step, approverUsers: vals })}
                                        placeholder="İstifadəçilər..."
                                        className="bg-background"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase">Təhlükəsizlik</Label>
                            <div className="flex flex-wrap gap-2 bg-muted/10 p-3 rounded border">
                                <div className="flex items-center space-x-2 mr-4">
                                    <Checkbox
                                        id={`2fa-${step.id}`}
                                        checked={step.securityOptions?.includes('2FA_APP')}
                                        onCheckedChange={(c) => {
                                            const currentOpts = step.securityOptions || [];
                                            const opts = c
                                                ? [...currentOpts, '2FA_APP']
                                                : currentOpts.filter(o => o !== '2FA_APP');
                                            // @ts-ignore
                                            onUpdate({ ...step, securityOptions: opts });
                                        }}
                                    />
                                    <Label htmlFor={`2fa-${step.id}`} className="font-normal text-xs">2FA App</Label>
                                </div>
                                <div className="flex items-center space-x-2 mr-4">
                                    <Checkbox
                                        id={`sms-${step.id}`}
                                        checked={step.securityOptions?.includes('SMS_OTP')}
                                        onCheckedChange={(c) => {
                                            const currentOpts = step.securityOptions || [];
                                            const opts = c
                                                ? [...currentOpts, 'SMS_OTP']
                                                : currentOpts.filter(o => o !== 'SMS_OTP');
                                            // @ts-ignore
                                            onUpdate({ ...step, securityOptions: opts });
                                        }}
                                    />
                                    <Label htmlFor={`sms-${step.id}`} className="font-normal text-xs">SMS OTP</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`email-${step.id}`}
                                        checked={step.securityOptions?.includes('EMAIL_OTP')}
                                        onCheckedChange={(c) => {
                                            const currentOpts = step.securityOptions || [];
                                            const opts = c
                                                ? [...currentOpts, 'EMAIL_OTP']
                                                : currentOpts.filter(o => o !== 'EMAIL_OTP');
                                            // @ts-ignore
                                            onUpdate({ ...step, securityOptions: opts });
                                        }}
                                    />
                                    <Label htmlFor={`email-${step.id}`} className="font-normal text-xs">Email OTP</Label>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                )}
            </Card>
        </div>
    );
}

export default function ApprovalRulesConfig() {
    const [rules, setRules] = useState<ApprovalRule[]>(MOCK_RULES);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentRule, setCurrentRule] = useState<ApprovalRule | null>(null);

    // Confirmation State
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
    });

    // --- Actions ---
    const handleDeleteRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
        toast.success("Qayda arxivləndi");
    };

    const handleToggleStatus = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
        toast.success("Status yeniləndi");
    };

    const confirmAction = (title: string, description: string, action: () => void, variant: "destructive" | "default" = "default") => {
        setConfirmState({
            isOpen: true,
            title,
            description,
            action,
            variant
        });
    };

    const handleSaveRule = () => {
        if (!currentRule) return;

        const exists = rules.find(r => r.id === currentRule.id);
        if (exists) {
            setRules(rules.map(r => r.id === currentRule.id ? currentRule : r));
            toast.success("Qayda yeniləndi");
        } else {
            setRules([...rules, currentRule]);
            toast.success("Yeni qayda yaradıldı");
        }
        setIsEditorOpen(false);
    };

    const handleAddStep = () => {
        if (!currentRule) return;
        const newStep: WorkflowStep = {
            id: `step-${Date.now()}`,
            name: "Yeni Təsdiq Mərhələsi",
            type: "SEQUENTIAL",
            order: currentRule.steps.length + 1,
            approverRoles: ["FINANCE_MANAGER"],
            approverUsers: [],
            securityOptions: [],
            securityLevel: 'NONE',
            notifyOnPending: true,
            notifyOnDecision: true
        };
        setCurrentRule({
            ...currentRule,
            steps: [...currentRule.steps, newStep]
        });
    };

    const handleUpdateStep = (updatedStep: WorkflowStep) => {
        if (!currentRule) return;
        setCurrentRule({
            ...currentRule,
            steps: currentRule.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
        });
    }

    const handleDeleteStep = (stepId: string) => {
        if (!currentRule) return;
        setCurrentRule({
            ...currentRule,
            steps: currentRule.steps.filter(s => s.id !== stepId)
        });
    };

    const handleCreate = () => {
        setCurrentRule({
            id: `RULE-${Date.now()}`,
            name: "Yeni Təsdiq Siyasəti",
            description: "",
            isActive: true,
            targetModel: 'INVOICE',
            action: 'CREATE',
            conditions: [],
            steps: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastModifiedBy: 'current_user'
        });
        setIsEditorOpen(true);
    };

    // --- Columns Definition ---
    const columns: ColumnDef<ApprovalRule>[] = [
        {
            accessorKey: "name",
            header: "Ad və Təsvir",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.description}</span>
                </div>
            )
        },
        {
            accessorKey: "targetModel",
            header: "Hədəf",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Badge variant="outline">{row.original.targetModel}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{row.original.action}</Badge>
                </div>
            )
        },
        {
            accessorKey: "steps",
            header: "Mürəkkəblik",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">{row.original.steps.length} Addım</Badge>
                    {row.original.steps.some(s => (s.securityOptions?.length || 0) > 0) && (
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                    )}
                </div>
            )
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                row.original.isActive ?
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Aktiv</Badge> :
                    <Badge variant="outline" className="text-muted-foreground">Deaktiv</Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const rule = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Menyu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setCurrentRule(rule); setIsEditorOpen(true); }}>
                                <Edit2 className="mr-2 h-4 w-4" /> Düzəliş Et
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(rule.id);
                                toast.success("ID kopyalandı!");
                            }}>
                                <Copy className="mr-2 h-4 w-4" /> ID Kopyala
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                confirmAction(
                                    "Status Dəyişikliyi",
                                    `Bu qaydanı ${rule.isActive ? 'deaktiv' : 'aktiv'} etmək istəyirsiniz?`,
                                    () => handleToggleStatus(rule.id)
                                );
                            }}>
                                <Power className="mr-2 h-4 w-4" /> {rule.isActive ? 'Deaktiv Et' : 'Aktivləşdir'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                                confirmAction(
                                    "Qaydanı Sil",
                                    "Bu qaydanı silmək daimi nəticələrə səbəb ola bilər. Davam edilsin?",
                                    () => handleDeleteRule(rule.id),
                                    "destructive"
                                );
                            }}>
                                <Trash2 className="mr-2 h-4 w-4" /> Sil
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ];

    return (
        <Card className="h-full border-none shadow-none bg-transparent">
            {/* HeaderRemoved - Actions moved to Toolbar */}
            <CardContent className="px-0">
                <DataTable
                    columns={columns}
                    data={rules}
                    searchKey="name"
                    toolbarContent={() => (
                        <Button size="icon" variant="outline" onClick={handleCreate} title="Yeni Qayda" className="h-8 w-8 ml-2">
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                />

                {/* VISUAL EDITOR DRAWER */}
                <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <SheetContent className="min-w-[800px] sm:w-[900px] flex flex-col p-0 gap-0">
                        <SheetHeader className="p-6 border-b bg-background">
                            <SheetTitle className="flex items-center gap-2">
                                <Workflow className="w-5 h-5" />
                                {currentRule?.id.startsWith('RULE-') && !currentRule.createdAt ? 'Yeni Qayda' : 'Qaydanı Düzənlə'}
                            </SheetTitle>
                            <SheetDescription>Təsdiqləmə ardıcıllığını, iştirakçıları və təhlükəsizliyi konfiqurasiya edin.</SheetDescription>
                        </SheetHeader>

                        {currentRule && (
                            <>
                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    {/* 1. BASIC INFO */}
                                    <section className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2 text-primary">
                                            <div className="bg-primary/10 p-1 rounded"><Edit2 className="w-4 h-4" /></div>
                                            Əsas Məlumatlar
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Qaydanın Adı</Label>
                                                <Input
                                                    value={currentRule.name}
                                                    onChange={e => setCurrentRule({ ...currentRule, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Hədəf Model</Label>
                                                <Select
                                                    value={currentRule.targetModel}
                                                    onValueChange={(val: any) => setCurrentRule({ ...currentRule, targetModel: val })}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="INVOICE">Faktura (Invoice)</SelectItem>
                                                        <SelectItem value="PAYMENT">Ödəniş (Payment)</SelectItem>
                                                        <SelectItem value="TENANT">Tenant</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <Label>Təsvir</Label>
                                                <Textarea
                                                    value={currentRule.description}
                                                    onChange={e => setCurrentRule({ ...currentRule, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* 2. WORKFLOW STEPS */}
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold flex items-center gap-2 text-primary">
                                                <div className="bg-primary/10 p-1 rounded"><GitMerge className="w-4 h-4" /></div>
                                                İş Axını (Workflow)
                                            </h3>

                                            <div className="flex items-center gap-3">
                                                {/* GLOBAL FLOW STRATEGY (Visible if > 1 step) */}
                                                {currentRule.steps.length > 1 && (
                                                    <div className="flex items-center bg-muted/30 px-3 py-1 rounded-md border text-sm">
                                                        <span className="text-muted-foreground mr-2 text-xs uppercase font-bold">Mod:</span>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`cursor-pointer px-2 py-0.5 rounded text-xs transition-colors ${currentRule.steps[0].type === 'SEQUENTIAL' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                                                onClick={() => setCurrentRule({
                                                                    ...currentRule,
                                                                    steps: currentRule.steps.map(s => ({ ...s, type: 'SEQUENTIAL' }))
                                                                })}
                                                            >
                                                                Növbəli
                                                            </div>
                                                            <div className="w-px h-3 bg-border" />
                                                            <div
                                                                className={`cursor-pointer px-2 py-0.5 rounded text-xs transition-colors ${currentRule.steps[0].type === 'PARALLEL' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                                                                onClick={() => setCurrentRule({
                                                                    ...currentRule,
                                                                    steps: currentRule.steps.map(s => ({ ...s, type: 'PARALLEL' }))
                                                                })}
                                                            >
                                                                Paralel
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <Button size="sm" variant="outline" className="text-xs" onClick={handleAddStep}>
                                                    <Plus className="w-3 h-3 mr-1" /> Addım Əlavə Et
                                                </Button>
                                            </div>
                                        </div>


                                        <div className="bg-muted/10 rounded-lg p-6 border-2 border-dashed min-h-[300px]">
                                            {currentRule.steps.length === 0 ? (
                                                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                                                    <Workflow className="w-10 h-10 opacity-20" />
                                                    <p>Hələ heç bir addım əlavə edilməyib.</p>
                                                    <Button size="sm" variant="ghost" onClick={handleAddStep}>İlk addımı əlavə et</Button>
                                                </div>
                                            ) : (
                                                <div className="max-w-xl mx-auto">
                                                    {currentRule.steps.map((step, idx) => (
                                                        <StepCard
                                                            key={step.id}
                                                            step={step}
                                                            index={idx}
                                                            onDelete={handleDeleteStep}
                                                            onUpdate={handleUpdateStep}
                                                        />
                                                    ))}

                                                    {/* Visual End Node */}
                                                    <div className="pl-8 pt-2">
                                                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-2 rounded border border-green-200 w-fit shadow-sm">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Təsdiq Tamamlandı
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                <div className="p-6 border-t bg-background mt-auto flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Ləğv Et</Button>
                                    <Button onClick={handleSaveRule}>Yadda Saxla</Button>
                                </div>
                            </>
                        )}
                    </SheetContent>
                </Sheet>

                <ConfirmationDialog
                    open={confirmState.isOpen}
                    onOpenChange={(val: boolean) => setConfirmState(prev => ({ ...prev, isOpen: val }))}
                    title={confirmState.title}
                    description={confirmState.description}
                    onConfirm={confirmState.action}
                    variant={confirmState.variant}
                />
            </CardContent>
        </Card>
    );
}
