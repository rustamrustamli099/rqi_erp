import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { MOCK_COUNTRIES, MOCK_MODULES, MOCK_PLANS } from "@/shared/constants/reference-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/multi-select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Building2, MapPin, CreditCard, Check } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Tenant, UserSector } from "@/types/schema"
import { useState, useMemo } from "react"

interface TenantCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: any) => void
    sectors: UserSector[]
}

export function TenantCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    sectors
}: Omit<TenantCreateDialogProps, 'newTenant' | 'setNewTenant'>) {
    const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
        usersCount: 1,
        // country: "AZ",
        status: "ACTIVE"
    })

    const [selectedModules, setSelectedModules] = useState<string[]>([])

    // Address & Extra State
    const [country, setCountry] = useState<string>("AZ")
    const [city, setCity] = useState<string>("")
    const [region, setRegion] = useState<string>("")
    const [addressDetails, setAddressDetails] = useState<string>("")
    const [postalCode, setPostalCode] = useState<string>("")
    const [entrepreneurshipSubject, setEntrepreneurshipSubject] = useState<string>("")

    const cities = MOCK_COUNTRIES.find(c => c.id === country)?.cities || []
    const regions = cities.find(c => c.id === city)?.districts || []

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const fullAddress = {
            country,
            city,
            region,
            details: addressDetails,
            postalCode: postalCode
        }
        const result = {
            ...newTenant,
            address: JSON.stringify(fullAddress),
            modules: selectedModules,
            status: "ACTIVE" // Default to active for demo
        }
        onSubmit(result)
        onOpenChange(false)
    }

    // Price Calculation: Base Plan + Modules + Users (>5 users = 5 AZN each)
    const totalPrice = useMemo(() => {
        const planPrice = MOCK_PLANS.find(p => p.id === newTenant.plan)?.price || 0
        const modulesPrice = MOCK_MODULES.filter(m => selectedModules.includes(m.code)).reduce((acc, m) => acc + m.price, 0)

        // Example logic: First 5 users included, extra users cost 5 AZN
        const userCount = newTenant.usersCount || 1
        const extraUsers = Math.max(0, userCount - 5)
        const userPrice = extraUsers * 5

        return planPrice + modulesPrice + userPrice
    }, [newTenant.plan, newTenant.usersCount, selectedModules])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yeni Tenant Yarat</DialogTitle>
                    <DialogDescription>
                        Şirkət məlumatlarını daxil edin və plan seçin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <Accordion type="single" collapsible className="w-full" defaultValue="org">

                        {/* SECTION 1: ORGANIZATION */}
                        <AccordionItem value="org">
                            <AccordionTrigger className="text-base font-semibold">
                                <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-600" /> Təşkilat Məlumatları</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-1 py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create-name">Şirkət Adı</Label>
                                    <Input
                                        id="create-name"
                                        value={newTenant.name || ''}
                                        onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                                        placeholder="Global Logistics MMC"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-domain">Subdomain</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="create-domain"
                                                value={newTenant.domain || ''}
                                                onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                                                placeholder="globallogistics"
                                                required
                                            />
                                            <span className="text-muted-foreground text-xs">.erp.az</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>VÖEN</Label>
                                        <Input
                                            value={newTenant.tin || ''}
                                            onChange={(e) => setNewTenant({ ...newTenant, tin: e.target.value })}
                                            placeholder="1234567890"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Sektor</Label>
                                        <Select
                                            value={newTenant.sectorId}
                                            onValueChange={(value) => setNewTenant({ ...newTenant, sectorId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sectors.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sahibkarlıq</Label>
                                        <Select
                                            value={entrepreneurshipSubject}
                                            onValueChange={setEntrepreneurshipSubject}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MICRO">Mikro Sahibkar</SelectItem>
                                                <SelectItem value="SMALL">Kiçik Sahibkar</SelectItem>
                                                <SelectItem value="MEDIUM">Orta Sahibkar</SelectItem>
                                                <SelectItem value="LARGE">İri Sahibkar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SECTION 2: ADDRESS */}
                        <AccordionItem value="address">
                            <AccordionTrigger className="text-base font-semibold">
                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-600" /> Ünvan və Əlaqə</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-1 py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Telefon</Label>
                                        <Input
                                            placeholder="+994 50 123 45 67"
                                            value={newTenant.contactPhone || ''}
                                            onChange={(e) => setNewTenant({ ...newTenant, contactPhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>E-poçt</Label>
                                        <Input
                                            placeholder="info@company.com"
                                            type="email"
                                            value={newTenant.contactEmail || ''}
                                            onChange={(e) => setNewTenant({ ...newTenant, contactEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Poçt İndeksi</Label>
                                    <Input
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        placeholder="AZ1000"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ölkə</Label>
                                        <Select value={country} onValueChange={setCountry}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MOCK_COUNTRIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Şəhər</Label>
                                        <Select value={city} onValueChange={setCity} disabled={!country}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rayon</Label>
                                        <Select value={region} onValueChange={setRegion} disabled={!cities.length}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ünvan</Label>
                                    <Input
                                        value={addressDetails}
                                        onChange={(e) => setAddressDetails(e.target.value)}
                                        placeholder="Küçə, ev, mənzil..."
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SECTION 3: BILLING */}
                        <AccordionItem value="billing">
                            <AccordionTrigger className="text-base font-semibold">
                                <span className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-green-600" />
                                    Plan & Lisenziya
                                </span>
                                <span className="ml-auto mr-4 text-sm text-muted-foreground font-normal">
                                    {totalPrice > 0 ? `${totalPrice} AZN/ay` : ''}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-1 py-4 space-y-4">
                                <div className="p-4 bg-muted/20 rounded-lg border space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Abunə Planı</Label>
                                            <Select
                                                value={newTenant.plan}
                                                onValueChange={(value: any) => setNewTenant({ ...newTenant, plan: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Plan seçin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MOCK_PLANS.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name} ({p.price} AZN)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>İstifadəçi Sayı</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={newTenant.usersCount || 1}
                                                    onChange={(e) => setNewTenant({ ...newTenant, usersCount: parseInt(e.target.value) || 1 })}
                                                />
                                                <span className="text-sm text-muted-foreground whitespace-nowrap">nəfər (+5 AZN)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Əlavə Modullar</Label>
                                        <MultiSelect
                                            options={MOCK_MODULES.map(m => ({ label: `${m.name} (+${m.price} AZN)`, value: m.code }))}
                                            selected={selectedModules}
                                            onChange={setSelectedModules}
                                            placeholder="Modul seçin..."
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-semibold text-lg text-primary">Cəmi: {totalPrice} AZN</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
                        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                            <Check className="w-4 h-4 mr-2" /> Tenantı Yarat
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
