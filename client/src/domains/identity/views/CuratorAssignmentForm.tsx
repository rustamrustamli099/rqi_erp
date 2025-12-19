import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronsUpDown, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Mock Users (Ideally fetched from API)
const USERS = [
    { value: "1", label: "Ali Aliyev", email: "ali.aliyev@example.com" },
    { value: "2", label: "Vali Valiyev", email: "vali.valiyev@example.com" },
    { value: "3", label: "Sara Mammadova", email: "sara.mammadova@example.com" },
    { value: "4", label: "Mammad Mammadov", email: "mammad.mammadov@example.com" },
    { value: "5", label: "Leyla Aliyeva", email: "leyla.aliyeva@example.com" },
];

const curatorWizardSchema = z.object({
    userId: z.string().min(1, "İstifadəçi seçilməlidir"),
    scopeLevel: z.enum(["ADMIN_PANEL", "TENANT_PANEL"]),
    scopeTargetType: z.enum(["SYSTEM", "TENANT", "BRANCH", "DEPARTMENT", "PROJECT"]),
    targetId: z.string().min(1, "Hədəf seçilməlidir"),
    mode: z.enum(["READ", "WRITE", "ADMIN"]),
    visibility: z.enum(["OWN_ONLY", "ALL_READ", "ALL_WRITE"]),
    description: z.string().optional(),
});

type CuratorFormValues = z.infer<typeof curatorWizardSchema>;

interface CuratorAssignmentFormProps {
    onSuccess: (data: CuratorFormValues) => void;
    onCancel: () => void;
    initialData?: Partial<CuratorFormValues>;
}

export function CuratorAssignmentForm({ onSuccess, onCancel, initialData }: CuratorAssignmentFormProps) {
    const [step, setStep] = useState(1);

    const form = useForm<CuratorFormValues>({
        resolver: zodResolver(curatorWizardSchema),
        defaultValues: {
            scopeLevel: initialData?.scopeLevel || "TENANT_PANEL",
            mode: initialData?.mode || "READ",
            visibility: initialData?.visibility || "ALL_READ",
            scopeTargetType: initialData?.scopeTargetType || "BRANCH",
            userId: initialData?.userId || "",
            targetId: initialData?.targetId || "",
            description: initialData?.description || ""
        }
    });

    const [openUser, setOpenUser] = useState(false);

    // Watch values for dynamic rendering and summary
    const values = form.watch();

    const handleNext = async () => {
        let fieldsToValidate: (keyof CuratorFormValues)[] = [];
        if (step === 1) fieldsToValidate = ["userId"];
        if (step === 2) fieldsToValidate = ["scopeLevel", "scopeTargetType", "targetId"];
        if (step === 3) fieldsToValidate = ["mode", "visibility"];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(s => s + 1);
    };

    const handleBack = () => {
        setStep(s => s - 1);
    };

    function onSubmit(data: CuratorFormValues) {
        toast.success(initialData ? "Təyinat yeniləndi!" : "Kurator təyinatı uğurla tamamlandı!");
        onSuccess(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Stepper Indicator */}
                <div className="flex items-center justify-between mb-6 px-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex flex-col items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                step === s ? "bg-primary text-primary-foreground" :
                                    step > s ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {step > s ? <Check className="h-4 w-4" /> : s}
                            </div>
                            <span className="text-[10px] mt-1 text-muted-foreground hidden sm:block">
                                {s === 1 && "İstifadəçi"}
                                {s === 2 && "Scope"}
                                {s === 3 && "Səlahiyyət"}
                                {s === 4 && "Təsdiq"}
                            </span>
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Step 1: User Selection */}
                {step === 1 && (
                    <div className="space-y-4 py-2 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">İstifadəçi Seçimi</h3>
                            <p className="text-sm text-muted-foreground">Kurator təyin ediləcək istifadəçini seçin.</p>
                        </div>
                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>İstifadəçi</FormLabel>
                                    <Popover open={openUser} onOpenChange={setOpenUser}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? USERS.find((user) => user.value === field.value)?.label
                                                        : "İstifadəçi axtar..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Ad və ya email..." />
                                                <CommandEmpty>Nəticə tapılmadı.</CommandEmpty>
                                                <CommandGroup>
                                                    {USERS.map((user) => (
                                                        <CommandItem
                                                            value={user.label}
                                                            key={user.value}
                                                            onSelect={() => {
                                                                form.setValue("userId", user.value);
                                                                setOpenUser(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    user.value === field.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{user.label}</span>
                                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {/* Step 2: Scope Definition */}
                {step === 2 && (
                    <div className="space-y-4 py-2 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Scope Təyini</h3>
                            <p className="text-sm text-muted-foreground">İstifadəçinin idarə edəcəyi sahəni müəyyənləşdirin.</p>
                        </div>
                        <FormField
                            control={form.control}
                            name="scopeLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Panel Səviyyəsi</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ADMIN_PANEL">Admin Panel (Qlobal Konfiqurasiya)</SelectItem>
                                            <SelectItem value="TENANT_PANEL">Tenant Panel (Əməliyyatlar)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="scopeTargetType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hədəf Növü</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {values.scopeLevel === 'ADMIN_PANEL' ? (
                                                    <SelectItem value="SYSTEM">Sistem</SelectItem>
                                                ) : (
                                                    <>
                                                        <SelectItem value="TENANT">Tenant (Bütün şirkət)</SelectItem>
                                                        <SelectItem value="BRANCH">Filial</SelectItem>
                                                        <SelectItem value="DEPARTMENT">Departament</SelectItem>
                                                        <SelectItem value="PROJECT">Layihə</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="targetId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hədəf ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ID..." {...field} />
                                        </FormControl>
                                        <FormDescription className="text-[10px]">
                                            Filial və ya şöbənin kodu/ID-si.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Access Mode */}
                {step === 3 && (
                    <div className="space-y-4 py-2 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Səlahiyyət və Görünüş</h3>
                            <p className="text-sm text-muted-foreground">Bu scope daxilində hüquqları təyin edin.</p>
                        </div>
                        <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Əməliyyat Rejimi</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="READ">READ (Yalnız İzləmə)</SelectItem>
                                            <SelectItem value="WRITE">WRITE (Əməliyyat İcrası)</SelectItem>
                                            <SelectItem value="ADMIN">ADMIN (Tam İdarəetmə)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        READ: Yalnız hesabatlar. WRITE: Sənəd yaratmaq/silmək. ADMIN: Konfiqurasiya.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data Görünüşü</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="OWN_ONLY">Yalnız Özününkülər</SelectItem>
                                            <SelectItem value="ALL_READ">Komanda (Məhdud Görünüş)</SelectItem>
                                            <SelectItem value="ALL_WRITE">Tam Görünüş</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {/* Step 4: Summary */}
                {step === 4 && (
                    <div className="space-y-4 py-2 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Təsdiqləmə</h3>
                            <p className="text-sm text-muted-foreground">Məlumatları yoxlayın və təsdiq edin.</p>
                        </div>

                        <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="font-medium text-muted-foreground">İstifadəçi:</span>
                                <span className="col-span-2">{USERS.find(u => u.value === values.userId)?.label}</span>

                                <span className="font-medium text-muted-foreground">Scope:</span>
                                <span className="col-span-2">{values.scopeLevel} / {values.scopeTargetType}</span>

                                <span className="font-medium text-muted-foreground">Hədəf:</span>
                                <span className="col-span-2 font-mono">{values.targetId}</span>

                                <span className="font-medium text-muted-foreground">Rejim:</span>
                                <span className="col-span-2">
                                    <span className="font-bold">{values.mode}</span> ({values.visibility})
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md text-sm">
                            <ArrowRight className="h-4 w-4" />
                            <p>Təsdiqlədikdən sonra istifadəçi dərhal bu səlahiyyətlərə sahib olacaq.</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t mt-4">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Geri
                        </Button>
                    ) : (
                        <Button type="button" variant="ghost" onClick={onCancel}>Ləğv et</Button>
                    )}

                    {step < 4 ? (
                        <Button type="button" onClick={handleNext}>
                            Növbəti
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="submit">
                            Təsdiqlə
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}
