import { useState, useMemo } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Building2, Check, ChevronRight, ChevronLeft, CreditCard, User, FolderOpen, MapPin, ShieldCheck, Box } from "lucide-react"
import { MOCK_COUNTRIES, MOCK_MODULES, MOCK_PLANS, ENTREPRENEURSHIP_SUBJECTS } from "@/shared/constants/reference-data"
import { Combobox } from "@/shared/components/ui/combobox"
import { MultiSelect } from "@/components/ui/multi-select"
import { cn } from "@/shared/lib/utils"
import { toast } from "sonner"
import type { UserSector } from "@/types/schema"
import { tenantApi, type Tenant } from "../../api/tenant.contract"
// Removed local Tenant interface


interface OnboardingWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: Partial<Tenant>) => void
    sectors: UserSector[]
}

const STEPS = [
    { id: 1, title: "Tenant Məlumatları", icon: Building2 },
    { id: 2, title: "Plan və Modullar", icon: CreditCard },
    { id: 3, title: "Admin Hesabı", icon: User },
    { id: 4, title: "Təşkilat Detalları", icon: MapPin },
    { id: 5, title: "Təsdiqləmə", icon: ShieldCheck },
]

export function OnboardingWizard({ open, onOpenChange, onSubmit, sectors }: OnboardingWizardProps) {
    const [step, setStep] = useState(1)

    // Form State
    const [formData, setFormData] = useState<Partial<Tenant>>({
        usersCount: 5, // Default includes 5 users
        status: "ACTIVE",
        plan: "standard",
        entrepreneurshipSubject: "" // Added field
    })
    const [selectedModules, setSelectedModules] = useState<string[]>([])
    const [adminUser, setAdminUser] = useState({ email: "", password: "", fullName: "" })

    // Address State
    const [address, setAddress] = useState({ country: "AZ", city: "", region: "", details: "", postalCode: "" })

    const cities = MOCK_COUNTRIES.find(c => c.id === address.country)?.cities || []
    const regions = cities.find(c => c.id === address.city)?.districts || []

    // Calculations
    const totalPrice = useMemo(() => {
        const planPrice = MOCK_PLANS.find(p => p.id === formData.plan)?.price || 0
        const modulesPrice = MOCK_MODULES.filter(m => selectedModules.includes(m.code)).reduce((acc, m) => acc + m.price, 0)

        // First 5 users included (Example logic)
        const userCount = formData.usersCount || 1
        const extraUsers = Math.max(0, userCount - 5)
        const userPrice = extraUsers * 5

        return planPrice + modulesPrice + userPrice
    }, [formData.plan, formData.usersCount, selectedModules])

    const handleNext = () => {
        if (step < STEPS.length) {
            setStep(step + 1)
        } else {
            handleComplete()
        }
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleComplete = () => {
        const fullData = {
            ...formData,
            modules: selectedModules,
            address: JSON.stringify(address),
            adminUser // In real app, this would be handled by backend to create user
        }
        onSubmit(fullData as unknown as Partial<Tenant>)
        // Reset and close handled by parent or here
        // onOpenChange(false) // Wait for submission? Parent closes
        toast.success("Onboarding uğurla tamamlandı!")
    }

    // --- Steps Rendering ---

    const renderStep1 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <Label>Şirkət Adı <span className="text-red-500">*</span></Label>
                <Input
                    value={formData.name || ""}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Global Logistics MMC"
                    autoFocus
                />
            </div>
            <div className="space-y-2">
                <Label>Subdomain (Tenant ID) <span className="text-red-500">*</span></Label>
                <div className="flex items-center gap-2">
                    <Input
                        value={formData.domain || ""}
                        onChange={e => setFormData({ ...formData, domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                        placeholder="globallogistics"
                    />
                    <span className="text-muted-foreground text-sm font-mono bg-muted px-2 py-2 rounded">.erp.az</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Sektor</Label>
                    <Select value={formData.sectorId} onValueChange={v => setFormData({ ...formData, sectorId: v })}>
                        <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                        <SelectContent>
                            {sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>VÖEN</Label>
                    <Input
                        value={formData.tin || ""}
                        onChange={e => setFormData({ ...formData, tin: e.target.value })}
                        placeholder="1234567890"
                    />
                </div>
            </div>

            {/* Added Entrepreneurship Subject */}
            <div className="space-y-2">
                <Label>Sahibkarlıq Subyekti <span className="text-red-500">*</span></Label>
                <Select
                    value={(formData as any).entrepreneurshipSubject || ""}
                    onValueChange={v => setFormData({ ...formData, entrepreneurshipSubject: v } as any)}
                >
                    <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                    <SelectContent>
                        {(Object.entries(ENTREPRENEURSHIP_SUBJECTS) as [string, { label: string, description: string }][]).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">{value.label}</span>
                                    <span className="text-xs text-muted-foreground">{value.description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-3 gap-4">
                {MOCK_PLANS.map(plan => (
                    <div
                        key={plan.id}
                        onClick={() => setFormData({ ...formData, plan: plan.id })}
                        className={cn(
                            "cursor-pointer border-2 rounded-lg p-4 space-y-2 transition-all hover:bg-muted/50",
                            formData.plan === plan.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted"
                        )}
                    >
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-2xl font-bold">{plan.price} <span className="text-sm font-normal text-muted-foreground">AZN</span></div>
                        <div className="text-xs text-muted-foreground">Bütün əsas funksiyalar daxildir.</div>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <Label>İstifadəçi Sayı</Label>
                <div className="flex items-center gap-4 border p-3 rounded-md">
                    <Input
                        type="number"
                        min={1}
                        value={formData.usersCount}
                        onChange={e => setFormData({ ...formData, usersCount: parseInt(e.target.value) || 1 })}
                        className="w-24"
                    />
                    <div className="text-sm text-muted-foreground">
                        <p>5 nəfər plana daxildir.</p>
                        <p>Əlavə hər istifadəçi üçün: <strong>5 AZN</strong></p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Modullar</Label>
                <MultiSelect
                    options={MOCK_MODULES.map(m => ({ label: `${m.name} (+${m.price} AZN)`, value: m.code }))}
                    selected={selectedModules}
                    onChange={setSelectedModules}
                    placeholder="Əlavə modulları seçin..."
                />
            </div>

            <div className="bg-slate-950 text-white p-4 rounded-lg flex justify-between items-center text-lg">
                <span>Yekun Aylıq Ödəniş:</span>
                <span className="font-bold font-mono text-green-400">{totalPrice} AZN</span>
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-blue-800 text-sm mb-4">
                <User className="w-4 h-4 inline mr-2" />
                Bu istifadəçi tenant üçün ilk <strong>Super Admin</strong> (Root) olacaq.
            </div>

            <div className="space-y-2">
                <Label>Admin Adı Soyadı</Label>
                <Input
                    value={adminUser.fullName}
                    onChange={e => setAdminUser({ ...adminUser, fullName: e.target.value })}
                    placeholder="Məs: Cavid Əliyev"
                />
            </div>
            <div className="space-y-2">
                <Label>E-poçt ünvanı</Label>
                <Input
                    type="email"
                    value={adminUser.email}
                    onChange={e => setAdminUser({ ...adminUser, email: e.target.value })}
                    placeholder="admin@company.com"
                />
            </div>
            <div className="space-y-2">
                <Label>Şifrə (Müvəqqəti)</Label>
                <Input
                    type="text"
                    value={adminUser.password}
                    onChange={e => setAdminUser({ ...adminUser, password: e.target.value })}
                    placeholder="Güclü şifrə təyin edin..."
                />
            </div>
        </div>
    )

    const renderStep4 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Ölkə</Label>
                    <Combobox
                        options={MOCK_COUNTRIES.map(c => ({ label: c.name, value: c.id }))}
                        value={address.country}
                        onSelect={v => setAddress({ ...address, country: v })}
                        placeholder="Ölkə seçin"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Şəhər</Label>
                    <Combobox
                        options={cities.map(c => ({ label: c.name, value: c.id }))}
                        value={address.city}
                        onSelect={v => setAddress({ ...address, city: v })}
                        placeholder="Şəhər seçin"
                        className={!cities.length ? "opacity-50 pointer-events-none" : ""}
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label>Rayon</Label>
                    <Combobox
                        options={regions.map(r => ({ label: r.name, value: r.id }))}
                        value={address.region}
                        onSelect={v => setAddress({ ...address, region: v })}
                        placeholder="Rayon seçin"
                        className={!regions.length ? "opacity-50 pointer-events-none" : ""}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Ünvan</Label>
                <Input
                    value={address.details}
                    onChange={e => setAddress({ ...address, details: e.target.value })}
                    placeholder="Küçə, bina, mənzil..."
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input
                        value={formData.contactPhone || ""}
                        onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+994..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Ümumi E-poçt (İnfo)</Label>
                    <Input
                        value={formData.contactEmail || ""}
                        onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="info@company.com"
                    />
                </div>
            </div>
        </div>
    )

    const renderStep5 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Tenant</h4>
                    <p className="text-xl font-bold">{formData.name}</p>
                    <p className="font-mono text-sm bg-muted inline-block px-2 py-1 rounded">{formData.domain}.erp.az</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Admin</h4>
                    <p className="font-medium">{adminUser.fullName}</p>
                    <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                </div>
            </div>

            <Separator />

            <div className="bg-slate-50 p-4 rounded-lg border space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{MOCK_PLANS.find(p => p.id === formData.plan)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Modullar:</span>
                    <span className="font-medium text-right">{selectedModules.length > 0 ? selectedModules.join(", ") : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">İstifadəçilər:</span>
                    <span className="font-medium">{formData.usersCount} nəfər</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                    <span>Aylıq Ödəniş:</span>
                    <span className="text-green-600">{totalPrice} AZN</span>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-green-50 text-green-800 p-4 rounded-md border border-green-200">
                <Box className="w-8 h-8" />
                <div className="text-sm">
                    <strong>Hazırdır!</strong> Təsdiqlə düyməsini sıxdıqdan sonra tenant yaradılacaq və adminə giriş məlumatları göndəriləcək.
                </div>
            </div>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Yeni Tenant Onboarding</DialogTitle>
                    <DialogDescription>
                        {STEPS[step - 1].title} - Addım {step}/{STEPS.length}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-6">
                    <div
                        className="absolute h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${(step / STEPS.length) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="min-h-[300px] py-2">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </div>

                <DialogFooter className="flex justify-between items-center sm:justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1}
                        className={step === 1 ? "invisible" : ""}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Geri
                    </Button>
                    <div className="flex gap-2">
                        {step === STEPS.length ? (
                            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                                <Check className="w-4 h-4 mr-2" /> Təsdiqlə və Yarat
                            </Button>
                        ) : (
                            <Button onClick={handleNext}>
                                İrəli <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
