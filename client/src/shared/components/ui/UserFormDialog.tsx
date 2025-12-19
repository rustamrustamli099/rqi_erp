
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { DialogFooter } from "@/components/ui/dialog"
import { Modal } from "@/components/ui/modal"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/shared/components/ui/multi-select"
import { Combobox } from "@/shared/components/ui/combobox"
import { Lock, Unlock, Shield, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/shared/components/ui/scroll-area"

const ROLES_BY_SCOPE = {
    SYSTEM: ["SuperAdmin", "SystemAuditor", "SupportAdmin"],
    TENANT: ["TenantAdmin", "Manager", "User", "Viewer", "FinanceUser", "HRManager"]
};

// Mock Permissions Data
const PERMISSIONS_BY_ROLE: Record<string, string[]> = {
    SuperAdmin: ["system:all", "tenant:all", "billing:all", "audit:read"],
    SystemAuditor: ["audit:read", "system:read", "tenant:read"],
    SupportAdmin: ["tenant:impersonate", "system:read", "ticket:manage"],
    TenantAdmin: ["tenant:manage", "user:manage", "billing:read", "role:manage"],
    Manager: ["user:read", "report:view", "approval:approve"],
    FinanceUser: ["billing:view", "invoice:download", "payment:manage"],
    HRManager: ["employee:manage", "leave:approve", "payroll:view"],
    User: ["self:manage", "task:create", "task:read"],
    Viewer: ["dashboard:view", "report:read"],
};

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
    "system:all": "Tam Sistem İdarəetməsi",
    "tenant:all": "Bütün Tenantların İdarəsi",
    "billing:all": "Tam Biling İdarəsi",
    "audit:read": "Audit Loglarına Baxış",
    "system:read": "Sistem Məlumatlarına Baxış",
    "tenant:impersonate": "Tenant Login (Impersonation)",
    "ticket:manage": "Texniki Dəstək",
    "tenant:manage": "Tenant Konfiqurasiyası",
    "user:manage": "İstifadəçi İdarəçiliyi",
    "billing:read": "Biling Məlumatlarına Baxış",
    "role:manage": "Rol İdarəçiliyi",
    "report:view": "Hesabatlara Baxış",
    "approval:approve": "Təsdiqləmə",
    "billing:view": "Fakturalara Baxış",
    "invoice:download": "Faktura Yükləmə",
    "payment:manage": "Ödəniş Etmə",
    "employee:manage": "Əməkdaş İdarəçiliyi",
    "leave:approve": "Məzuniyyət Təsdiqi",
    "payroll:view": "Əməkhaqqı Məlumatları",
    "self:manage": "Şəxsi Profilin İdarəsi",
    "task:create": "Tapşırıq Yaratma",
    "task:read": "Tapşırıqlara Baxış",
    "dashboard:view": "Dashboard Baxışı",
    "report:read": "Hesabat Oxuma"
};


const MOCK_TENANTS = [
    { label: "Acme Corp (Global)", value: "tenant_acme" },
    { label: "Beta Ltd", value: "tenant_beta" },
    { label: "Gamma Inc", value: "tenant_gamma" },
    { label: "Delta Group", value: "tenant_delta" },
    { label: "Epsilon LLC", value: "tenant_epsilon" },
]

// Valid Scopes
type ScopeType = 'SYSTEM' | 'TENANT';

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Ad ən azı 2 simvol olmalıdır.",
    }),
    email: z.string().email({
        message: "Düzgün email ünvanı daxil edin.",
    }),
    scope: z.enum(["SYSTEM", "TENANT"]),
    tenantId: z.string().optional(),
    roles: z.array(z.string()).min(1, {
        message: "Ən azı bir rol seçilməlidir.",
    }),
    status: z.enum(["Active", "Inactive"]),
    sendInvitation: z.boolean().optional(),
}).superRefine((data, ctx) => {
    if (data.scope === 'TENANT' && !data.tenantId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Tenant seçilməlidir.",
            path: ["tenantId"]
        });
    }
});

interface UserFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: {
        name: string;
        email: string;
        role: string; // Legacy single role string
        status: "Active" | "Inactive";
        scope?: ScopeType;
        tenantId?: string;
    } | null
    onSubmit: (values: z.infer<typeof formSchema>) => void
    mode: "create" | "edit"
    allowedRoles?: string[]
}

export function UserFormDialog({ open, onOpenChange, initialData, onSubmit, mode, allowedRoles }: UserFormDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            scope: "TENANT",
            tenantId: "",
            roles: [],
            status: "Active",
            sendInvitation: true,
        },
    })

    // Watch scope to filter roles
    const selectedScope = form.watch("scope") as ScopeType;
    const selectedRoles = form.watch("roles");

    // EFFECT: Consolidate Permissions
    const [activePermissions, setActivePermissions] = useState<string[]>([]);

    useEffect(() => {
        if (!selectedRoles) {
            setActivePermissions([]);
            return;
        }

        const allPerms = new Set<string>();
        selectedRoles.forEach(role => {
            const rolePerms = PERMISSIONS_BY_ROLE[role] || [];
            rolePerms.forEach(p => allPerms.add(p));
        });
        setActivePermissions(Array.from(allPerms).sort());

    }, [selectedRoles]);


    useEffect(() => {
        if (open) {
            // Determine scope from initialData or default to TENANT
            let inferredScope: ScopeType = "TENANT";
            let initialRoles: string[] = [];

            if (initialData?.role) {
                // Handle comma separated or single role
                initialRoles = initialData.role.includes(',')
                    ? initialData.role.split(',').map(r => r.trim())
                    : [initialData.role];

                // Infer scope from first role if system role exists
                if (initialRoles.some(r => ROLES_BY_SCOPE.SYSTEM.includes(r))) {
                    inferredScope = "SYSTEM";
                }
            }

            form.reset({
                name: initialData?.name || "",
                email: initialData?.email || "",
                scope: initialData?.scope || inferredScope,
                tenantId: initialData?.tenantId || "",
                roles: initialRoles.length > 0 ? initialRoles : [],
                status: initialData?.status || "Active",
                sendInvitation: mode === 'create',
            })
        }
    }, [initialData, open, form, mode])

    // Reset role when scope changes
    const handleScopeChange = (value: ScopeType) => {
        form.setValue("scope", value);
        form.setValue("roles", []); // CLEAR roles
        form.setValue("tenantId", ""); // Clear tenant
    };

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
    }

    const title = mode === "create" ? "Yeni İstifadəçi" : "İstifadəçiyə Düzəliş Et"
    const description = mode === "create"
        ? "Yeni istifadəçi məlumatlarını daxil edin."
        : "İstifadəçi məlumatlarını yeniləyin."

    // specific filtering
    const availableRoleNames = allowedRoles
        ? allowedRoles.filter(r => ROLES_BY_SCOPE[selectedScope].includes(r))
        : ROLES_BY_SCOPE[selectedScope];

    const roleOptions = availableRoleNames.map(r => ({ label: r, value: r }));

    return (
        <Modal
            title={title}
            description={description}
            isOpen={open}
            onClose={() => onOpenChange(false)}
            className="sm:max-w-[700px] h-[85vh] flex flex-col"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full overflow-hidden">
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4 p-1">
                            {/* SCOPE SELECTION FIRST */}
                            <FormField
                                control={form.control}
                                name="scope"
                                render={({ field }) => (
                                    <FormItem className="space-y-3 rounded-md border p-4">
                                        <FormLabel>Səlahiyyət Səviyyəsi (Scope)</FormLabel>
                                        <div className="flex gap-4">
                                            <Button
                                                type="button"
                                                variant={field.value === 'TENANT' ? 'default' : 'outline'}
                                                onClick={() => handleScopeChange('TENANT')}
                                                className="flex-1"
                                            >
                                                Tenant (Biznes)
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={field.value === 'SYSTEM' ? 'destructive' : 'outline'}
                                                onClick={() => handleScopeChange('SYSTEM')}
                                                className="flex-1"
                                            >
                                                System (Admin)
                                            </Button>
                                        </div>
                                        <FormDescription className="text-xs">
                                            {field.value === 'TENANT'
                                                ? "Bu istifadəçi konkret bir Tenant (Müştəri) daxilində fəaliyyət göstərəcək."
                                                : "DİQQƏT: Bu istifadəçi qlobal sistem tənzimləmələrinə çıxış əldə edəcək."}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* TENANT SELECTION (Autocomplete) - Only if Scope is TENANT */}
                            {selectedScope === 'TENANT' && (
                                <FormField
                                    control={form.control}
                                    name="tenantId"
                                    render={({ field }) => (
                                        <FormItem className="animate-in fade-in slide-in-from-top-2">
                                            <FormLabel>Tenant (Müştəri) Seçin</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    options={MOCK_TENANTS}
                                                    value={field.value}
                                                    onSelect={field.onChange}
                                                    placeholder="Tenant axtar..."
                                                    emptyText="Tenant tapılmadı."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ad Soyad</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Məs: Əli Əliyev" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seçin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Active">Aktiv</SelectItem>
                                                    <SelectItem value="Inactive">Deaktiv</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ali@example.com" {...field} disabled={mode === 'edit'} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* MULTI ROLE SELECTION */}
                            <FormField
                                control={form.control}
                                name="roles"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Rollar
                                            <Badge variant="outline" className="ml-2 text-[10px] font-normal">
                                                {selectedScope} SCOPE
                                            </Badge>
                                        </FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={roleOptions}
                                                selected={field.value}
                                                onChange={field.onChange}
                                                placeholder="Rolları seçin..."
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            İstifadəçiyə birdən çox rol təyin edilə bilər.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* PERMISSION PREVIEW */}
                            {activePermissions.length > 0 && (
                                <div className="rounded-md border bg-muted/30 p-4 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                        <h4 className="font-semibold text-sm">Aktiv Səlahiyyətlər (Permissions)</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {activePermissions.map(perm => (
                                            <Badge key={perm} variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200">
                                                {PERMISSION_DESCRIPTIONS[perm] || perm}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activePermissions.length === 0 && selectedRoles.length > 0 && (
                                <div className="rounded-md border border-dashed p-4 flex items-center justify-center text-muted-foreground text-sm gap-2">
                                    <AlertCircle className="w-4 h-4" /> Bu rol üçün xüsusi səlahiyyətlər təyin edilməyib.
                                </div>
                            )}


                            {mode === 'create' && (
                                <FormField
                                    control={form.control}
                                    name="sendInvitation"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Dəvət göndər
                                                </FormLabel>
                                                <FormDescription>
                                                    İstifadəçiyə qeydiyyat linki olan email göndəriləcək.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="pt-4 mt-auto border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
                        <Button type="submit">{mode === "create" ? "Yarat" : "Yadda Saxla"}</Button>
                    </DialogFooter>
                </form>
            </Form>
        </Modal>
    )
}
