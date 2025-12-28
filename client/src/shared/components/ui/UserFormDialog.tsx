
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
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import type { Role } from "@/domains/system-console/api/system.contract"


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
        role: string; // Legacy single role string or comma separated
        status: "Active" | "Inactive";
        scope?: ScopeType;
        tenantId?: string;
    } | null
    onSubmit: (values: z.infer<typeof formSchema>) => void
    mode: "create" | "edit"
    availableRoles: Role[] // Dynamic roles from API
}

export function UserFormDialog({ open, onOpenChange, initialData, onSubmit, mode, availableRoles = [] }: UserFormDialogProps) {
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

                // Infer scope from roles if possible (check against availableRoles)
                // This is a best-guess if scope isn't explicit
                const foundRole = availableRoles.find(r => initialRoles.includes(r.name));
                if (foundRole && foundRole.scope) {
                    inferredScope = foundRole.scope as ScopeType;
                } else if (initialData.scope) {
                    inferredScope = initialData.scope;
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
    }, [initialData, open, form, mode, availableRoles])

    // Reset role when scope changes
    const handleScopeChange = (value: ScopeType) => {
        form.setValue("scope", value);
        form.setValue("roles", []); // CLEAR roles
        // Optional: clear tenant if switching to SYSTEM
        if (value === 'SYSTEM') {
            form.setValue("tenantId", "");
        }
    };

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
    }

    const title = mode === "create" ? "Yeni İstifadəçi" : "İstifadəçiyə Düzəliş Et"
    const description = mode === "create"
        ? "Yeni istifadəçi məlumatlarını daxil edin."
        : "İstifadəçi məlumatlarını yeniləyin."

    // Filter roles based on selected scope
    // API roles usually come with 'scope' property. If legacy mock roles don't have it, assume custom logic.
    // Ensure case-insensitive comparison if needed, or exact match.
    const filteredRoles = availableRoles.filter(r =>
        (r.scope?.toUpperCase() || "TENANT") === selectedScope ||
        (selectedScope === "TENANT" && !r.scope) // Default to tenant if missing
    );

    const roleOptions = filteredRoles.map(r => ({ label: r.name, value: r.name }));
    // Usually value should be ID, but legacy code seemed to use Name. 
    // Keeping Name as value for now to match backend expectation if it expects role names. 
    // Ideally refactor to use IDs.

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
                                                onClick={() => {
                                                    field.onChange('TENANT');
                                                    handleScopeChange('TENANT');
                                                }}
                                                className="flex-1"
                                            >
                                                Tenant (Biznes)
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={field.value === 'SYSTEM' ? 'destructive' : 'outline'}
                                                onClick={() => {
                                                    field.onChange('SYSTEM');
                                                    handleScopeChange('SYSTEM');
                                                }}
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

