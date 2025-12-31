import { useState, useMemo, useEffect } from "react"
import { Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
    Plus, Trash2, Edit,
    CheckCircle2, User, Users, ArrowRight, Check, ChevronsUpDown,
    XCircle, FileText, Activity, MoreHorizontal, UserPlus, AlertOctagon, RefreshCw, ShieldCheck, UserCheck, AlertTriangle, Lock
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { FilterDrawer } from "@/components/ui/filter-drawer"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ColumnDef } from "@tanstack/react-table"

// Mock Roles
const ROLES = [
    { id: "role_admin", name: "Super Admin" },
    { id: "role_hr", name: "HR Manager" },
    { id: "role_finance", name: "Finance Director" },
    { id: "role_ceo", name: "CEO" },
    { id: "role_legal", name: "Legal Counsel" },
    { id: "role_it", name: "IT Manager" },
    ...Array.from({ length: 20 }).map((_, i) => ({ id: `role_dummy_${i}`, name: `Dummy Role ${i}` }))
]

// Mock Users
const USERS = [
    { id: "u1", name: "Rüstəm Qüdrətov", email: "rustem@rqi.az", role: "CEO" },
    { id: "u2", name: "Nigar Əliyeva", email: "nigar.a@rqi.az", role: "HR Manager" },
    { id: "u3", name: "Vüsal Məmmədov", email: "vusal.m@rqi.az", role: "Finance Director" },
    { id: "u4", name: "Kənan Qasımov", email: "kenan.q@rqi.az", role: "Super Admin" },
    { id: "u5", name: "Leyla Həsənova", email: "leyla.h@rqi.az", role: "Legal Counsel" },
    ...Array.from({ length: 50 }).map((_, i) => ({ id: `user_dummy_${i}`, name: `User ${i}`, email: `user${i}@test.com`, role: "User" }))
]

interface ApprovalStage {
    id: string
    level: number
    roleIds: string[]
    userIds: string[]
    method: 'SEQUENTIAL' | 'PARALLEL'
    minApprovals?: number
    name?: string
    verification?: ('2FA' | 'SMS' | 'EMAIL')[]
}

interface RequestLog {
    id: string
    action: 'APPROVE' | 'REJECT' | 'CREATE' | 'DELEGATE' | 'ESCALATE'
    actorId: string
    actorName: string
    timestamp: string
    comment?: string
    stageName?: string
}

interface ApprovalRequest {
    id: string
    ruleId: string
    entityId: string
    entityName: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    currentLevel: number
    currentStageName: string
    createdAt: string
    logs: RequestLog[]
}

interface ApprovalRule {
    id: string
    model: string
    action: string
    stages: ApprovalStage[]
    isActive: boolean
    description: string
}

const INITIAL_RULES: ApprovalRule[] = [
    {
        id: "rule_1",
        model: "tenant",
        action: "create",
        isActive: true,
        description: "Yeni Tenat Yaradılması",
        stages: [
            { id: "stg_1", level: 1, roleIds: ["role_finance"], userIds: [], method: "SEQUENTIAL", name: "Maliyyə Təsdiqi" },
            { id: "stg_2", level: 2, roleIds: ["role_admin"], userIds: [], method: "SEQUENTIAL", name: "Final Təsdiq" }
        ]
    }
]

const MOCK_REQUESTS: ApprovalRequest[] = [
    {
        id: "req_1",
        ruleId: "rule_1",
        entityId: "tnt_101",
        entityName: "Global Construction LLC",
        status: "PENDING",
        currentLevel: 1,
        currentStageName: "Maliyyə Təsdiqi",
        createdAt: "2023-10-25 14:30",
        logs: [
            { id: "log_1", action: "CREATE", actorId: "u_1", actorName: "Sistem Admin", timestamp: "2023-10-25 14:30", stageName: "Başlanğıc" }
        ]
    },
    {
        id: "req_2",
        ruleId: "rule_1",
        entityId: "tnt_102",
        entityName: "Tech Solutions Inc.",
        status: "APPROVED",
        currentLevel: 3,
        currentStageName: "Bitmişdir",
        createdAt: "2023-10-20 09:15",
        logs: [
            { id: "log_2", action: "CREATE", actorId: "u_1", actorName: "Sistem Admin", timestamp: "2023-10-20 09:15" },
            { id: "log_3", action: "APPROVE", actorId: "u_finance", actorName: "Maliyyə Direktoru", timestamp: "2023-10-21 10:00", comment: "Sənədlər qaydasındadır", stageName: "Maliyyə Təsdiqi" },
            { id: "log_4", action: "APPROVE", actorId: "u_admin", actorName: "Baş Admin", timestamp: "2023-10-22 11:30", stageName: "Final Təsdiq" }
        ]
    }
]

import { type ResolvedNavNode } from "@/app/security/navigationResolver";
import { ScrollableSubTabsFromResolver, ScrollableSubTabs, type SubTabItem } from "@/shared/components/ui/ScrollableSubTabs";
import { useSearchParams } from "react-router-dom";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";

// ... (imports remain)

// =============================================================================
// MAIN COMPONENT (SAP-GRADE ROUTING)
// =============================================================================

interface WorkflowConfigTabProps {
    tabNode: ResolvedNavNode;
}

export function WorkflowConfigTab({ tabNode }: WorkflowConfigTabProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    // SAP-GRADE: Read subTab from URL (Managed by ProtectedRoute)
    const subTabs = tabNode?.children ?? [];
    const allowedKeys = subTabs.map(st => st.subTabKey || st.id);

    const urlSubTab = searchParams.get('subTab') || '';
    const currentSubTab = allowedKeys.includes(urlSubTab) ? urlSubTab : '';

    const handleTabChange = (value: string) => {
        if (!allowedKeys.includes(value)) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('subTab', value);
        setSearchParams(newParams, { replace: true });
    };

    // CONTENT MAPPING
    const contentMap = {
        config: <WorkflowRulesView />,
        monitor: <WorkflowMonitorView />
    };

    const iconMap = {
        config: <Settings2 className="w-4 h-4" />,
        monitor: <Activity className="w-4 h-4" />
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Workflow Engine</h2>
                    <p className="text-muted-foreground">Təsdiqləmə proseslərinin idarə edilməsi və monitorinqi.</p>
                </div>
            </div>

            <ScrollableSubTabsFromResolver
                tabNode={tabNode}
                value={currentSubTab}
                onValueChange={handleTabChange}
                contentMap={contentMap}
                iconMap={iconMap}
                variant="default"
            />
        </div>
    );
}

// =============================================================================
// SUB-VIEWS (Extracted Logic)
// =============================================================================

function WorkflowRulesView() {
    const [rules, setRules] = useState<ApprovalRule[]>(INITIAL_RULES)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null)
    const [formModel, setFormModel] = useState("tenant")
    const [formAction, setFormAction] = useState("create")
    const [formDesc, setFormDesc] = useState("")
    const [formStages, setFormStages] = useState<ApprovalStage[]>([])
    const [activeStageIdx, setActiveStageIdx] = useState(0)
    const [isSecurityConfirmOpen, setIsSecurityConfirmOpen] = useState(false)
    const [pendingSecurityChange, setPendingSecurityChange] = useState<{ idx: number, values: ('2FA' | 'SMS' | 'EMAIL')[], added: string } | null>(null)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null)

    // --- Handlers ---

    const openCreateDialog = () => {
        setEditingRule(null)
        setFormModel('tenant')
        setFormAction('create')
        setFormDesc('')
        setFormStages([{ id: 'st_1', level: 1, name: 'Mərhələ 1', roleIds: [], userIds: [], method: 'SEQUENTIAL' }])
        setActiveStageIdx(0)
        setIsDialogOpen(true)
    }

    const openEditRule = (rule: ApprovalRule) => {
        setEditingRule(rule)
        setFormModel(rule.model)
        setFormAction(rule.action)
        setFormDesc(rule.description)
        setFormStages(JSON.parse(JSON.stringify(rule.stages))) // Deep copy
        setActiveStageIdx(0)
        setIsDialogOpen(true)
    }

    const handleSave = () => {
        if (!formDesc) {
            toast.error("Təsvir yazılmalıdır")
            return
        }

        const newRule: ApprovalRule = {
            id: editingRule ? editingRule.id : `rule_${Date.now()}`,
            model: formModel as any,
            action: formAction as any,
            conditions: {},
            stages: formStages,
            isActive: true,
            description: formDesc,
            createdAt: editingRule ? editingRule.createdAt : new Date().toISOString()
        }

        if (editingRule) {
            setRules(rules.map(r => r.id === editingRule.id ? newRule : r))
            toast.success("Qayda yeniləndi")
        } else {
            setRules([...rules, newRule])
            toast.success("Yeni qayda yaradıldı")
        }
        setIsDialogOpen(false)
    }

    const confirmDeleteRule = () => {
        if (ruleToDelete) {
            setRules(rules.filter(r => r.id !== ruleToDelete))
            toast.success("Qayda silindi")
            setIsDeleteConfirmOpen(false)
            setRuleToDelete(null)
        }
    }

    // --- Status Change Logic ---
    const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false)
    const [statusChangeRule, setStatusChangeRule] = useState<{ id: string, makeActive: boolean } | null>(null)

    const handleStatusClick = (rule: ApprovalRule) => {
        setStatusChangeRule({ id: rule.id, makeActive: !rule.isActive })
        setIsStatusConfirmOpen(true)
    }

    const confirmStatusChange = () => {
        if (statusChangeRule) {
            setRules(rules.map(r => r.id === statusChangeRule.id ? { ...r, isActive: statusChangeRule.makeActive } : r))
            toast.success(`Qayda ${statusChangeRule.makeActive ? 'aktivləşdirildi' : 'deaktiv edildi'}`)
            setIsStatusConfirmOpen(false)
            setStatusChangeRule(null)
        }
    }

    const addStage = () => {
        const newStage: ApprovalStage = {
            id: `st_${Date.now()}`,
            level: formStages.length + 1,
            name: `Mərhələ ${formStages.length + 1}`,
            roleIds: [],
            userIds: [],
            method: 'SEQUENTIAL'
        }
        setFormStages([...formStages, newStage])
        setTimeout(() => setActiveStageIdx(formStages.length), 0)
    }

    const removeStage = (idx: number) => {
        if (formStages.length <= 1) return
        const newStages = formStages.filter((_, i) => i !== idx).map((s, i) => ({ ...s, level: i + 1 }))
        setFormStages(newStages)
        setActiveStageIdx(Math.max(0, idx - 1))
    }

    const setStageMethod = (idx: number, method: 'SEQUENTIAL' | 'PARALLEL') => {
        const newStages = [...formStages]
        newStages[idx].method = method
        setFormStages(newStages)
    }

    const confirmSecurityChange = () => {
        if (pendingSecurityChange) {
            const newStages = [...formStages]
            newStages[pendingSecurityChange.idx].verification = pendingSecurityChange.values
            setFormStages(newStages)
            setPendingSecurityChange(null)
            setIsSecurityConfirmOpen(false)
            toast.info("Təhlükəsizlik tələbi əlavə edildi")
        }
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-medium">Workflow Qaydaları</h3>
                    <p className="text-sm text-muted-foreground">Hansı əməliyyatların təsdiq tələb etdiyini təyin edin.</p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Workflow
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map(rule => (
                    <Card key={rule.id} className="relative hover:shadow-md transition-all group overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <CardHeader className="pb-2 pl-6">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2 font-mono text-[10px] uppercase">
                                    {rule.model} / {rule.action}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleStatusClick(rule)}>
                                            {rule.isActive ? <div className="flex items-center text-orange-600"><Lock className="w-4 h-4 mr-2" /> Deaktiv Et</div> : <div className="flex items-center text-green-600"><CheckCircle2 className="w-4 h-4 mr-2" /> Aktiv Et</div>}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => openEditRule(rule)}>
                                            <Edit className="w-4 h-4 mr-2" /> Düzəliş et
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={() => { setRuleToDelete(rule.id); setIsDeleteConfirmOpen(true) }}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Sil
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardTitle className="text-base font-semibold leading-tight">{rule.description}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                                {rule.stages.length} Təsdiq Mərhələsi
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-6 pb-4">
                            <div className="space-y-3 mt-2">
                                {rule.stages.map((stage, idx) => (
                                    <div key={stage.id} className="flex items-center text-sm relative">
                                        {idx < rule.stages.length - 1 && (
                                            <div className="absolute left-[11px] top-6 w-[2px] h-4 bg-border" />
                                        )}
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold mr-3 border shadow-sm z-10 text-muted-foreground">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-xs">{stage.name || `Mərhələ ${idx + 1}`}</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {stage.roleIds.length > 0 ? `${stage.roleIds.length} Rol` : ''}
                                                {stage.roleIds.length > 0 && stage.userIds.length > 0 ? ', ' : ''}
                                                {stage.userIds.length > 0 ? `${stage.userIds.length} İstifadəçi` : ''}
                                                {stage.roleIds.length === 0 && stage.userIds.length === 0 && <span className="text-destructive">Təyinat yoxdur</span>}
                                            </div>
                                        </div>
                                        {stage.verification && stage.verification.length > 0 && (
                                            <div className="flex gap-1">
                                                {stage.verification.includes('2FA') && <Badge variant="outline" className="text-[9px] px-1 h-4 border-orange-200 bg-orange-50 text-orange-700">2FA</Badge>}
                                                {stage.verification.includes('SMS') && <Badge variant="outline" className="text-[9px] px-1 h-4 border-blue-200 bg-blue-50 text-blue-700">SMS</Badge>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Rule Editor Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingRule ? 'Qaydanı Düzəlt' : 'Yeni Workflow'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-scroll py-2 px-1">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={formModel} onValueChange={setFormModel} disabled={!!editingRule}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="tenant">Tenant</SelectItem><SelectItem value="document">Document</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <Select value={formAction} onValueChange={setFormAction} disabled={!!editingRule}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="create">Create</SelectItem><SelectItem value="delete">Delete</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Təsvir..." className="mb-6 font-medium" />

                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h4 className="font-semibold text-sm">Workflow Mərhələləri (Stages)</h4>
                            <div className="flex items-center gap-2">
                                {formStages.length >= 2 && (
                                    <div className="flex items-center bg-muted/50 rounded-md p-1 border">
                                        <span className="text-[10px] font-semibold text-muted-foreground px-2 uppercase">Təsdiq Növü:</span>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn("h-6 text-[10px] px-2", formStages.every(s => s.method === 'SEQUENTIAL') ? "bg-background shadow-sm text-foreground font-medium dark:bg-zinc-800" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                                                onClick={() => setFormStages(formStages.map(s => ({ ...s, method: 'SEQUENTIAL' })))}
                                            >
                                                Növbəli
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn("h-6 text-[10px] px-2", formStages.every(s => s.method === 'PARALLEL') ? "bg-background shadow-sm text-foreground font-medium dark:bg-zinc-800" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                                                onClick={() => setFormStages(formStages.map(s => ({ ...s, method: 'PARALLEL' })))}
                                            >
                                                Paralel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <Button size="sm" variant="secondary" onClick={addStage}>
                                    <Plus className="w-3 h-3 mr-1" /> Add Step
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-[200px_1fr] gap-6 h-[400px]">
                            {/* Left Side: Stage List */}
                            <ScrollArea className="border-r pr-4">
                                <div className="space-y-2">
                                    {formStages.map((stage, idx) => (
                                        <div key={stage.id} onClick={() => setActiveStageIdx(idx)} className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${activeStageIdx === idx ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'hover:bg-muted'}`}>
                                            <div className="flex flex-col"><span className="font-bold text-xs">{stage.name || `Mərhələ ${idx + 1}`}</span><span className="text-[10px] opacity-80">{stage.roleIds.length + stage.userIds.length} Təsdiq edənlər</span></div>
                                            {activeStageIdx === idx && <ArrowRight className="w-4 h-4" />}
                                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 rounded-full hover:bg-red-500 hover:text-white" onClick={(e) => { e.stopPropagation(); removeStage(idx) }} disabled={formStages.length === 1}><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Right Side: Config */}
                            <div className="px-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-[200px]">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className={cn("w-[200px] justify-between font-medium", !formStages[activeStageIdx]?.name && "text-muted-foreground")}>
                                                    {formStages[activeStageIdx]?.name || "Mərhələ Adı Seçin"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Ad seç və ya yaz..." onValueChange={(search) => { if (search) { const newStages = [...formStages]; newStages[activeStageIdx].name = search; setFormStages(newStages); } }} />
                                                    <CommandList>
                                                        <CommandEmpty>İstifadəyə hazırdır (Yeni ad)</CommandEmpty>
                                                        <CommandGroup>
                                                            {["Maliyyə Təsdiqi", "Hüquq Rəyi", "HR Təsdiqi", "Direktor Rəyi", "Final Təsdiq", "Texniki Baxış"].map((name) => (
                                                                <CommandItem key={name} value={name} onSelect={(currentValue) => { const newStages = [...formStages]; newStages[activeStageIdx].name = currentValue; setFormStages(newStages); }}><Check className={cn("mr-2 h-4 w-4", formStages[activeStageIdx]?.name === name ? "opacity-100" : "opacity-0")} />{name}</CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {(formStages[activeStageIdx]?.roleIds.length + formStages[activeStageIdx]?.userIds.length) > 1 && (
                                        <div className="flex bg-muted rounded p-1">
                                            <Button variant="ghost" size="sm" className={`h-6 text-[10px] ${formStages[activeStageIdx]?.method === 'SEQUENTIAL' ? 'bg-background shadow-sm' : ''}`} onClick={() => setStageMethod(activeStageIdx, 'SEQUENTIAL')}>Növbəli</Button>
                                            <Button variant="ghost" size="sm" className={`h-6 text-[10px] ${formStages[activeStageIdx]?.method === 'PARALLEL' ? 'bg-background shadow-sm' : ''}`} onClick={() => setStageMethod(activeStageIdx, 'PARALLEL')}>Paralel</Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 mb-4 border-b pb-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Təhlükəsizlik</Label>
                                        {/* Security Badge Display */}
                                        <div className="flex gap-1">
                                            {formStages[activeStageIdx]?.verification && formStages[activeStageIdx]?.verification?.length > 0 && formStages[activeStageIdx]?.verification?.map((v) => (
                                                <Badge key={v} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-[10px] px-2 py-0.5 h-5">
                                                    <ShieldCheck className="w-3 h-3 mr-1" /> {v}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="sec-2fa"
                                                checked={formStages[activeStageIdx]?.verification?.includes('2FA')}
                                                onCheckedChange={(c) => {
                                                    const current = formStages[activeStageIdx]?.verification || []
                                                    const newVal = c ? [...current, '2FA'] : current.filter(v => v !== '2FA')
                                                    // Only confirm if adding security
                                                    if (c) {
                                                        setPendingSecurityChange({ idx: activeStageIdx, values: newVal as any, added: '2FA' })
                                                        setIsSecurityConfirmOpen(true)
                                                    } else {
                                                        const newStages = [...formStages]; newStages[activeStageIdx].verification = newVal as any; setFormStages(newStages)
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="sec-2fa" className="cursor-pointer">2FA (Google Authenticator)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="sec-sms"
                                                checked={formStages[activeStageIdx]?.verification?.includes('SMS')}
                                                onCheckedChange={(c) => {
                                                    const current = formStages[activeStageIdx]?.verification || []
                                                    const newVal = c ? [...current, 'SMS'] : current.filter(v => v !== 'SMS')
                                                    if (c) {
                                                        setPendingSecurityChange({ idx: activeStageIdx, values: newVal as any, added: 'SMS' })
                                                        setIsSecurityConfirmOpen(true)
                                                    } else {
                                                        const newStages = [...formStages]; newStages[activeStageIdx].verification = newVal as any; setFormStages(newStages)
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="sec-sms" className="cursor-pointer">SMS Kodu (OTP)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="sec-email"
                                                checked={formStages[activeStageIdx]?.verification?.includes('EMAIL')}
                                                onCheckedChange={(c) => {
                                                    const current = formStages[activeStageIdx]?.verification || []
                                                    const newVal = c ? [...current, 'EMAIL'] : current.filter(v => v !== 'EMAIL')
                                                    if (c) {
                                                        setPendingSecurityChange({ idx: activeStageIdx, values: newVal as any, added: 'EMAIL' })
                                                        setIsSecurityConfirmOpen(true)
                                                    } else {
                                                        const newStages = [...formStages]; newStages[activeStageIdx].verification = newVal as any; setFormStages(newStages)
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="sec-email" className="cursor-pointer">E-poçt Kodu</Label>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2">DİQQƏT: Çoxsaylı metod seçildikdə, istifadəçi hamısını təsdiqləməlidir (Məcburi).</p>
                                </div>

                                {formStages[activeStageIdx] && <AssignmentSelector stageIdx={activeStageIdx} formStages={formStages} setFormStages={setFormStages} />}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2 border-t mt-auto">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleSave}>Yadda Saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Security Confirmation Dialog */}
            <ConfirmationDialog
                open={isSecurityConfirmOpen}
                onOpenChange={setIsSecurityConfirmOpen}
                title="Təhlükəsizlik Siyasətini Dəyişirsiniz"
                description={(
                    <span>
                        Siz bu mərhələyə <b>{pendingSecurityChange?.added}</b> təsdiqləmə tələbi əlavə edirsiniz.
                        Bu o deməkdir ki, təsdiq edən şəxslər əlavə identifikasiyadan keçməli olacaqlar.
                        <br /><br />
                        Davam etmək istədiyinizə əminsiniz?
                    </span>
                )}
                onConfirm={confirmSecurityChange}
            />

            {/* Status Change Confirmation Dialog */}
            <ConfirmationDialog
                open={isStatusConfirmOpen}
                onOpenChange={setIsStatusConfirmOpen}
                title={statusChangeRule?.makeActive ? "Qaydanı Aktivləşdir" : "Qaydanı Deaktiv Et"}
                description={`Siz bu workflow qaydasını ${statusChangeRule?.makeActive ? 'aktivləşdirmək' : 'deaktiv etmək'} istəyirsiniz. Bu dəyişiklik dərhal qüvvəyə minəcək.`}
                onConfirm={confirmStatusChange}
                confirmText={statusChangeRule?.makeActive ? "Aktivləşdir" : "Deaktiv et"}
                variant={statusChangeRule?.makeActive ? "default" : "destructive"}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                title="Qaydanı Silmək İstəyirsiniz?"
                description="Bu əməliyyat geri qaytarıla bilməz. Bu workflow qaydası həmişəlik silinəcək və əlaqəli bütün proseslər dayandırılacaq."
                onConfirm={confirmDeleteRule}
                variant="destructive"
                confirmText="Sil"
                cancelText="Ləğv et"
            />
        </>
    )
}

function WorkflowMonitorView() {
    const [requests, setRequests] = useState<ApprovalRequest[]>(MOCK_REQUESTS)
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
    const [selectedRequestForLog, setSelectedRequestForLog] = useState<ApprovalRequest | null>(null)

    // --- Actions ---
    const handleApprove = (reqId: string) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req
            const isFinal = req.currentLevel >= 2
            return {
                ...req,
                currentLevel: isFinal ? req.currentLevel : req.currentLevel + 1,
                status: isFinal ? 'APPROVED' : 'PENDING',
                currentStageName: isFinal ? 'Bitmişdir' : 'Final Təsdiq',
                logs: [...req.logs, { id: `log_${Date.now()}`, action: 'APPROVE', actorId: 'me', actorName: 'Cari İstifadəçi', timestamp: new Date().toLocaleString("az-AZ"), stageName: req.currentStageName, comment: 'Təsdiq edildi' }]
            }
        }))
        toast.success("Müraciət təsdiqləndi")
    }

    const handleReject = (reqId: string) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req
            return {
                ...req, status: 'REJECTED',
                logs: [...req.logs, { id: `log_${Date.now()}`, action: 'REJECT', actorId: 'me', actorName: 'Cari İstifadəçi', timestamp: new Date().toLocaleString("az-AZ"), stageName: req.currentStageName, comment: 'İmtina edildi' }]
            }
        }))
        toast.error("Müraciət imtina edildi")
    }

    // --- DataTable Columns Configuration ---
    const columns = useMemo<ColumnDef<ApprovalRequest>[]>(() => [
        {
            accessorKey: "id",
            header: "Müraciət ID",
            cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("id")}</span>,
        },
        {
            accessorKey: "entityName",
            header: "Obyekt (Tenant/Doc)",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.getValue("entityName")}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{row.original.entityId}</span>
                </div>
            )
        },
        {
            accessorKey: "currentStageName",
            header: "Cari Mərhələ",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("currentStageName")}</Badge>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const variant = status === 'APPROVED' ? 'default' : status === 'REJECTED' ? 'destructive' : 'secondary'
                const className = status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''
                return <Badge variant={variant} className={className}>{status}</Badge>
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "createdAt",
            header: "Tarix",
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue("createdAt")}</span>,
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => toast.info(`Viewing details for ${row.original.id}`)}>
                            <FileText className="mr-2 h-4 w-4" /> Detallı Bax (Display)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedRequestForLog(row.original)}>
                            <Activity className="mr-2 h-4 w-4" /> Audit Tarixçəsi (Logs)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {row.original.status === 'PENDING' && (
                            <>
                                <DropdownMenuItem onClick={() => handleApprove(row.original.id)} className="text-green-600 focus:text-green-700 focus:bg-green-50">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Təsdiqlə (Approve)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(row.original.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <XCircle className="mr-2 h-4 w-4" /> İmtina (Reject)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.warning("Deleqasiya dialoqu açılacaq...")}>
                                    <UserPlus className="mr-2 h-4 w-4 text-blue-500" /> Delegasiya (Delegate)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.error("Eskalasiya edildi!")}>
                                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" /> Eskalasiya (Escalate)
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toast.error("Proses admin tərəfindən ləğv edildi.")}>
                            <AlertOctagon className="mr-2 h-4 w-4 text-destructive" /> Ləğv Et (Cancel Process)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ], [])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Müraciət Tarixçəsi</CardTitle>
                <CardDescription>Bütün aktiv və tamamlanmış workflow proseslərinə nəzarət.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={requests}
                    searchKey="entityName"
                    filterPlaceholder="Obyekt adı ilə axtar..."
                    toolbarContent={(table) => (
                        <div className="flex items-center gap-2">
                            <FilterDrawer
                                open={isFilterDrawerOpen}
                                onOpenChange={setIsFilterDrawerOpen}
                                resetFilters={() => table.resetColumnFilters()}
                            >
                                {table.getColumn("status") && (
                                    <div className="space-y-2">
                                        <Label>Status üzrə</Label>
                                        <DataTableFacetedFilter
                                            column={table.getColumn("status")}
                                            title="Status"
                                            options={[
                                                { label: "Pending", value: "PENDING" },
                                                { label: "Approved", value: "APPROVED" },
                                                { label: "Rejected", value: "REJECTED" },
                                            ]}
                                        />
                                    </div>
                                )}
                            </FilterDrawer>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8 ml-2" onClick={() => toast.success("Məlumatlar yeniləndi")}>
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Yenilə</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                />
            </CardContent>

            {/* AUDIT LOG SHEET */}
            <Sheet open={!!selectedRequestForLog} onOpenChange={(open) => !open && setSelectedRequestForLog(null)}>
                <SheetContent className="sm:max-w-[540px]">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Audit Tarixçəsi
                        </SheetTitle>
                        <SheetDescription>
                            Workflow ID: <span className="font-mono text-primary font-medium">{selectedRequestForLog?.id}</span>
                        </SheetDescription>
                    </SheetHeader>

                    {selectedRequestForLog && (
                        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                            <div className="relative pl-6 border-l-2 border-muted space-y-8">
                                {selectedRequestForLog.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log) => (
                                    <div key={log.id} className="relative">
                                        <div className={cn(
                                            "absolute -left-[29px] top-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center",
                                            log.action === 'REJECT' ? "bg-red-500 text-white" :
                                                log.action === 'APPROVE' ? "bg-green-500 text-white" :
                                                    log.action === 'CREATE' ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                                        )}>
                                            {log.action === 'APPROVE' && <CheckCircle2 className="w-3 h-3" />}
                                            {log.action === 'REJECT' && <XCircle className="w-3 h-3" />}
                                            {log.action === 'CREATE' && <Plus className="w-3 h-3" />}
                                            {['DELEGATE', 'ESCALATE'].includes(log.action) && <UserCheck className="w-3 h-3" />}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold">{log.action === 'CREATE' ? 'Yaradıldı' : log.action === 'APPROVE' ? 'Təsdiqləndi' : log.action === 'REJECT' ? 'İmtina Edildi' : log.action}</span>
                                                <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                                            </div>
                                            <div className="text-sm text-foreground/80">
                                                <span className="font-medium text-foreground">{log.actorName}</span> tərəfindən
                                            </div>
                                            {log.stageName && (
                                                <Badge variant="outline" className="w-fit mt-1 text-[10px] h-5">{log.stageName}</Badge>
                                            )}
                                            {log.comment && (
                                                <div className="bg-muted/50 p-2 rounded text-xs italic mt-1 border-l-2 border-primary/20">
                                                    "{log.comment}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </SheetContent>
            </Sheet>
        </Card>
    )
}

function AssignmentSelector({ stageIdx, formStages, setFormStages }: { stageIdx: number, formStages: ApprovalStage[], setFormStages: (s: ApprovalStage[]) => void }) {
    const [search, setSearch] = useState("")
    const [currentTab, setCurrentTab] = useState("roles")

    const toggleRole = (roleId: string) => {
        const newStages = [...formStages]
        const currentRoles = newStages[stageIdx].roleIds
        if (currentRoles.includes(roleId)) {
            newStages[stageIdx].roleIds = currentRoles.filter(r => r !== roleId)
        } else {
            newStages[stageIdx].roleIds = [...currentRoles, roleId]
        }
        setFormStages(newStages)
    }

    const toggleUser = (userId: string) => {
        const newStages = [...formStages]
        const currentUsers = newStages[stageIdx].userIds
        if (currentUsers.includes(userId)) {
            newStages[stageIdx].userIds = currentUsers.filter(u => u !== userId)
        } else {
            newStages[stageIdx].userIds = [...currentUsers, userId]
        }
        setFormStages(newStages)
    }

    const filteredRoles = ROLES.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    const filteredUsers = USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))


    // Define tab items for ScrollableSubTabs
    const tabItems: SubTabItem[] = [
        {
            key: 'roles',
            label: 'Rollara Görə',
            content: (
                <ScrollArea className="h-[200px] border rounded-md p-2">
                    <div className="space-y-2">
                        {filteredRoles.map(role => (
                            <div key={role.id} className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded">
                                <Checkbox
                                    id={`role-${role.id}`}
                                    checked={formStages[stageIdx]?.roleIds.includes(role.id)}
                                    onCheckedChange={() => toggleRole(role.id)}
                                />
                                <Label htmlFor={`role-${role.id}`} className="cursor-pointer flex-1 text-sm flex items-center justify-between">
                                    {role.name}
                                    {['role_admin', 'role_ceo'].includes(role.id) && <Badge variant="secondary" className="text-[10px] h-4">System</Badge>}
                                </Label>
                            </div>
                        ))}
                        {filteredRoles.length === 0 && <p className="text-xs text-center text-muted-foreground py-4">Nəticə tapılmadı.</p>}
                    </div>
                </ScrollArea>
            )
        },
        {
            key: 'users',
            label: 'İstifadəçilərə Görə',
            content: (
                <ScrollArea className="h-[200px] border rounded-md p-2">
                    <div className="space-y-2">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded">
                                <Checkbox
                                    id={`user-${user.id}`}
                                    checked={formStages[stageIdx]?.userIds.includes(user.id)}
                                    onCheckedChange={() => toggleUser(user.id)}
                                />
                                <Label htmlFor={`user-${user.id}`} className="cursor-pointer flex-1 text-sm">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{user.email} • {user.role}</div>
                                </Label>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && <p className="text-xs text-center text-muted-foreground py-4">Nəticə tapılmadı.</p>}
                    </div>
                </ScrollArea>
            )
        }
    ];

    return (
        <div className="flex flex-col h-[350px]">
            <Label className="text-xs font-semibold uppercase text-muted-foreground mb-4">Təyinatlar (Assignments)</Label>

            <div className="mb-4">
                <Input placeholder="Axtar..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8" />
            </div>

            <ScrollableSubTabs
                tabs={tabItems}
                value={currentTab}
                onValueChange={setCurrentTab}
                variant="default"
                className="flex-1"
            />
        </div>
    )
}
