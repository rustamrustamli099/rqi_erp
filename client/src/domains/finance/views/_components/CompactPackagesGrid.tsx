import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Box, Layers, Zap, Crown, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Combobox } from "@/components/ui/combobox"
import { ScrollArea } from "@/components/ui/scroll-area"
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

interface CompactPackage {
    id: string
    name: string
    description: string
    priceMonthly: number
    currency: string
    basePlan: string
    includedModules: string[]
    includedAddons: string[]
    highlight?: boolean
    icon: React.ElementType
    color: string
}

const initialPackages: CompactPackage[] = [
    {
        id: "pkg_starter_compact",
        name: "Starter Compact",
        description: "Kiçik bizneslər üçün hər şey daxil.",
        priceMonthly: 49,
        currency: "USD",
        basePlan: "Basic Plan",
        includedModules: ["CRM Module", "HR Module", "Inventory"],
        includedAddons: ["Email 5k"],
        icon: Box,
        color: "text-blue-500"
    },
    {
        id: "pkg_pro_compact",
        name: "Pro Business",
        description: "Böyüyən şirkətlər üçün optimal həll.",
        priceMonthly: 99,
        currency: "USD",
        basePlan: "Pro Plan",
        includedModules: ["CRM Advanced", "HR Full", "Finance", "Warehouse"],
        includedAddons: ["Email 20k", "Bank API", "SMS 100"],
        highlight: true,
        icon: Layers,
        color: "text-indigo-500"
    },
    {
        id: "pkg_enterprise_compact",
        name: "Enterprise Suite",
        description: "Korporativ şirkətlər üçün.",
        priceMonthly: 199,
        currency: "USD",
        basePlan: "Enterprise Plan",
        includedModules: ["Bütün Modullar"],
        includedAddons: ["Unlimited API", "Dedicated IP", "Premium Support"],
        icon: Crown,
        color: "text-orange-500"
    }
]



const currencyOptions = [
    { label: "USD ($)", value: "USD" },
    { label: "AZN (₼)", value: "AZN" },
    { label: "EUR (€)", value: "EUR" }
]

interface CompactPackagesGridProps {
    availableModules: { id: string; name: string; category: string }[]
}

export function CompactPackagesGrid({ availableModules }: CompactPackagesGridProps) {
    const [packages, setPackages] = useState<CompactPackage[]>(initialPackages)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPkg, setEditingPkg] = useState<CompactPackage | null>(null)

    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState<Partial<CompactPackage>>({})

    const handleEdit = (pkg: CompactPackage) => {
        setEditingPkg(pkg)
        setFormData(pkg)
        setIsDialogOpen(true)
    }

    const handleCreate = () => {
        setEditingPkg(null)
        setFormData({
            name: "",
            description: "",
            priceMonthly: 0,
            currency: "USD",
            basePlan: "Basic Plan",
            includedModules: [],
            includedAddons: [],
            color: "text-gray-500",
            icon: Box
        })
        setIsDialogOpen(true)
    }

    const confirmDelete = (id: string) => {
        setDeleteId(id)
    }

    const handleDelete = () => {
        if (deleteId) {
            setPackages(prev => prev.filter(p => p.id !== deleteId))
            toast.success("Paket silindi")
            setDeleteId(null)
        }
    }

    const handleSave = () => {
        if (!formData.name || !formData.priceMonthly) {
            toast.error("Zəhmət olmasa vacib sahələri doldurun")
            return
        }

        if (editingPkg) {
            // Update
            setPackages(prev => prev.map(p => p.id === editingPkg.id ? { ...p, ...formData } as CompactPackage : p))
            toast.success("Paket yeniləndi")
        } else {
            // Create
            const newPkg: CompactPackage = {
                ...formData as CompactPackage,
                id: `pkg_${Date.now()}`,
                color: "text-blue-500", // Default
                icon: Box, // Default
                includedModules: formData.includedModules || [],
                includedAddons: formData.includedAddons || [],
                currency: formData.currency || "USD"
            }
            setPackages([...packages, newPkg])
            toast.success("Yeni paket yaradıldı")
        }
        setIsDialogOpen(false)
    }

    const handleSelectPackage = (name: string) => {
        toast.success(`"${name}" paketi seçildi.`)
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Paket Yarat
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {packages.map((pkg) => (
                    <Card
                        key={pkg.id}
                        className={`flex flex-col relative transition-all duration-200 group hover:border-primary/50 ${pkg.highlight ? 'border-primary shadow-md' : ''}`}
                    >
                        {pkg.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-primary text-primary-foreground px-4 py-1">Ən Çox Seçilən</Badge>
                            </div>
                        )}

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(pkg)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Düzəliş Et
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(pkg.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Sil
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <CardHeader>
                            <div className={`p-3 rounded-lg w-fit ${pkg.highlight ? 'bg-primary/10' : 'bg-muted'} mb-4`}>
                                <pkg.icon className={`h-6 w-6 ${pkg.color}`} />
                            </div>
                            <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                            <CardDescription>{pkg.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <span className="text-4xl font-bold">
                                    {pkg.currency === "AZN" ? "₼" : pkg.currency === "EUR" ? "€" : "$"}
                                    {pkg.priceMonthly}
                                </span>
                                <span className="text-muted-foreground"> / aylıq</span>
                            </div>

                            <Separator />

                            <div className="space-y-4 text-sm">
                                <div className="flex items-center justify-between font-medium">
                                    <span>Core Abunəlik:</span>
                                    <span>{pkg.basePlan}</span>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Modullar</span>
                                    <ul className="space-y-2">
                                        {pkg.includedModules.map((mod, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                <span>{mod}</span>
                                            </li>
                                        ))}
                                        {pkg.includedModules.length === 0 && <li className="text-muted-foreground italic">Seçilməyib</li>}
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Add-ons (Hədiyyə)</span>
                                    <ul className="space-y-2">
                                        {pkg.includedAddons.map((addon, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                                <span>{addon}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button className="w-full" variant={pkg.highlight ? "default" : "outline"} onClick={() => handleSelectPackage(pkg.name)}>
                                Paketi Seç
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] overflow-visible">
                    <DialogHeader>
                        <DialogTitle>{editingPkg ? "Paketə Düzəliş Et" : "Yeni Paket Yarat"}</DialogTitle>
                        <DialogDescription>
                            Abunəlik, modul və add-on kombinasiyalarını təyin edin.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] -mr-6 pr-6">
                        <div className="grid gap-4 py-4 pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Paket Adı</Label>
                                    <Input
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Məs: Startup Bundle"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Qiymət (Aylıq)</Label>
                                    <div className="flex gap-2 items-end">
                                        <div className="w-[100px]">
                                            <Combobox
                                                options={currencyOptions}
                                                value={formData.currency}
                                                onSelect={(val) => setFormData({ ...formData, currency: val })}
                                                placeholder="Valyuta"
                                                className="h-10"
                                            />
                                        </div>
                                        <Input
                                            type="number"
                                            value={formData.priceMonthly || ""}
                                            onChange={(e) => setFormData({ ...formData, priceMonthly: Number(e.target.value) })}
                                            className="flex-1 h-10"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Təsvir</Label>
                                <Textarea
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Əsas Plan (Base Plan)</Label>
                                <Select
                                    value={formData.basePlan}
                                    onValueChange={(val) => setFormData({ ...formData, basePlan: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Plan seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Basic Plan">Basic Plan</SelectItem>
                                        <SelectItem value="Pro Plan">Pro Plan</SelectItem>
                                        <SelectItem value="Enterprise Plan">Enterprise Plan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-medium text-sm">Paket Məzmunu</h4>

                                {/* Modules Selection */}
                                <div className="space-y-2">
                                    <Label>Modullar (Modules)</Label>
                                    <MultiSelect
                                        options={availableModules.filter(m => m.category === 'module').map(m => ({ label: m.name, value: m.name }))}
                                        selected={formData.includedModules?.filter(name => availableModules.find(m => m.name === name && m.category === 'module')) || []}
                                        onChange={(selected) => {
                                            const currentOthers = formData.includedModules?.filter(name => availableModules.find(m => m.name === name && m.category !== 'module')) || [];
                                            setFormData({ ...formData, includedModules: [...currentOthers, ...selected] });
                                        }}
                                        placeholder="Modulları seçin..."
                                    />
                                </div>

                                {/* Integrations Selection */}
                                <div className="space-y-2">
                                    <Label>İnteqrasiyalar (Integrations)</Label>
                                    <MultiSelect
                                        options={availableModules.filter(m => m.category === 'integration').map(m => ({ label: m.name, value: m.name }))}
                                        selected={formData.includedModules?.filter(name => availableModules.find(m => m.name === name && m.category === 'integration')) || []}
                                        onChange={(selected) => {
                                            const currentOthers = formData.includedModules?.filter(name => availableModules.find(m => m.name === name && m.category !== 'integration')) || [];
                                            setFormData({ ...formData, includedModules: [...currentOthers, ...selected] });
                                        }}
                                        placeholder="İnteqrasiyaları seçin..."
                                    />
                                </div>

                                {/* Add-ons Selection */}
                                <div className="space-y-2">
                                    <Label>Əlavələr (Add-ons)</Label>
                                    <MultiSelect
                                        options={availableModules.filter(m => m.category === 'addon').map(m => ({ label: m.name, value: m.name }))}
                                        selected={formData.includedModules?.filter(name => availableModules.find(m => m.name === name && m.category === 'addon')) || []}
                                        onChange={(selected) => {
                                            const currentOthers = formData.includedModules?.filter(name => availableModules.find(m => m.name === name && m.category !== 'addon')) || [];
                                            setFormData({ ...formData, includedModules: [...currentOthers, ...selected] });
                                        }}
                                        placeholder="Add-onları seçin..."
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Ləğv Et</Button>
                        <Button onClick={handleSave}>Yadda Saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu paketi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv Et</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
