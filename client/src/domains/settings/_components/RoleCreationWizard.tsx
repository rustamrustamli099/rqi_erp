
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Shield, Building2, Terminal, Loader2 } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Rol adı ən azı 2 simvol olmalıdır.",
    }).regex(/^[a-zA-Z0-9_\-\s]+$/, {
        message: "Yalnız hərf, rəqəm, boşluq və defis istifadə edilə bilər."
    }),
    scope: z.enum(["SYSTEM", "TENANT"], {
        required_error: "Zəhmət olmasa konfiqurasiya sahəsini (scope) seçin.",
    }),
    description: z.string().optional(),
})

interface RoleCreationWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
}

export function RoleCreationWizard({ open, onOpenChange, onSubmit }: RoleCreationWizardProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            scope: "TENANT",
            description: "",
        },
    })

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)
        try {
            await onSubmit(values)
            form.reset()
        } catch (error) {
            // Error handling is done by parent usually (toast)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Shield className="h-6 w-6 text-primary" />
                        Yeni Rol Yarat
                    </DialogTitle>
                    <DialogDescription>
                        Rolun əhatə dairəsini (Scope) diqqətlə seçin. Bu seçim daha sonra <strong>dəyişdirilə bilməz</strong>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">

                        {/* SCOPE SELECTION (CRITICAL) */}
                        <FormField
                            control={form.control}
                            name="scope"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Əhatə Dairəsi (Scope) <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value} // Use value for controlled component, not defaultValue
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            {/* SYSTEM OPTION */}
                                            <div>
                                                <RadioGroupItem value="SYSTEM" id="scope-system" className="peer sr-only" />
                                                <label
                                                    htmlFor="scope-system"
                                                    className={cn(
                                                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full",
                                                        field.value === "SYSTEM" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""
                                                    )}
                                                >
                                                    <Terminal className="mb-3 h-6 w-6 text-blue-600" />
                                                    <div className="text-center space-y-1">
                                                        <div className="font-semibold text-lg text-blue-700">System Role</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Platforma səviyyəli idarəçilər üçün (Super Admin, Support, Dev).
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="mt-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
                                                        platform.* icazələri
                                                    </Badge>
                                                </label>
                                            </div>

                                            {/* TENANT OPTION */}
                                            <div>
                                                <RadioGroupItem value="TENANT" id="scope-tenant" className="peer sr-only" />
                                                <label
                                                    htmlFor="scope-tenant"
                                                    className={cn(
                                                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full",
                                                        field.value === "TENANT" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""
                                                    )}
                                                >
                                                    <Building2 className="mb-3 h-6 w-6 text-orange-600" />
                                                    <div className="text-center space-y-1">
                                                        <div className="font-semibold text-lg text-orange-700">Tenant Role</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Müştəri və ya filial əməkdaşları üçün (Accountant, HR, Manager).
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="mt-4 bg-orange-100 text-orange-800 hover:bg-orange-100">
                                                        tenant.* icazələri
                                                    </Badge>
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rol Adı <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Məs: Satış Meneceri" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Eyni scope daxilində unikal olmalıdır.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Təsvir</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Bu rolun məqsədi və səlahiyyətləri..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </form>
                </Form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Ləğv et
                    </Button>
                    <Button onClick={form.handleSubmit(handleSubmit)} disabled={loading} className="min-w-[120px]">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yarat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
