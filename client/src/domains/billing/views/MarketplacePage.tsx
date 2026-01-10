import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Check, Star, Zap, Layers, Globe, Shield, Activity, CreditCard } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MarketplaceItem {
    id: string
    title: string
    description: string
    priceMonthly: number
    currency: string
    category: 'module' | 'addon' | 'integration'
    icon: any
    popular?: boolean
    installed?: boolean
    rating?: number
}

const marketplaceItems: MarketplaceItem[] = [
    // Modules
    {
        id: "mod_hr_adv",
        title: "Advanced HR",
        description: "Tam işçi həyat dövrü idarəetməsi (Hiring to Retiring).",
        priceMonthly: 49,
        currency: "USD",
        category: "module",
        icon: UsersIcon,
        rating: 4.8
    },
    {
        id: "mod_crm_pro",
        title: "CRM Professional",
        description: "Satış bor kəməri, müştəri izləmə və marketinq avtomatlaşdırılması.",
        priceMonthly: 69,
        currency: "USD",
        category: "module",
        icon: Globe,
        popular: true,
        rating: 4.9
    },
    {
        id: "mod_finance",
        title: "Finance & Accounting",
        description: "Mühasibatlıq, vergi hesabatları və maliyyə proqnozları.",
        priceMonthly: 89,
        currency: "USD",
        category: "module",
        icon: CreditCard,
        rating: 4.7
    },
    {
        id: "mod_warehouse",
        title: "Warehouse Management",
        description: "Anbar qalığı, inventar izləmə və logistika.",
        priceMonthly: 59,
        currency: "USD",
        category: "module",
        icon: Layers,
        rating: 4.5
    },

    // Add-ons
    {
        id: "addon_sms_starter",
        title: "SMS Starter Tech",
        description: "Aylıq 1000 SMS göndərişi. Marketinq üçün idealdır.",
        priceMonthly: 15,
        currency: "USD",
        category: "addon",
        icon: Zap,
        installed: true
    },
    {
        id: "addon_email_pro",
        title: "Dedicated IP Email",
        description: "Yüksək reputasiyalı IP ilə spam-a düşmədən email göndərin.",
        priceMonthly: 30,
        currency: "USD",
        category: "addon",
        icon: Shield
    },

    // Integrations
    {
        id: "int_stripe",
        title: "Stripe Payments",
        description: "Kredit kartı ilə ödənişləri qəbul edin.",
        priceMonthly: 10,
        currency: "USD",
        category: "integration",
        icon: CreditCard,
        popular: true
    },
    {
        id: "int_bank_kapital",
        title: "Kapital Bank API",
        description: "Birbaşa bank hesabınızla inteqrasiya.",
        priceMonthly: 25,
        currency: "USD",
        category: "integration",
        icon: Activity
    }
]

// Mock Icon component helper
function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

import { usePageState } from "@/app/security/usePageState"

export default function MarketplacePage() {
    // PHASE 100% PFCG: Backend-driven action visibility
    const { actions } = usePageState('Z_BILLING_MARKETPLACE_PAGE');
    const canBuy = actions?.GS_MARKETPLACE_BUY ?? false;

    const [filter, setFilter] = useState("all")
    const [search, setSearch] = useState("")
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const filteredItems = marketplaceItems.filter(item => {
        const matchesCategory = filter === "all" || item.category === filter
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleBuyClick = (item: MarketplaceItem) => {
        setSelectedItem(item)
        setIsConfirmOpen(true)
    }

    const handleConfirmPurchase = () => {
        if (selectedItem) {
            toast.success(`${selectedItem.title} uğurla aktivləşdirildi!`)
            setIsConfirmOpen(false)
            // Here you would typically call the backend
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <PageHeader
                    heading="Marketplace"
                    text="Əlavə modullar və xidmətlər"
                />
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Axtarış..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-6" onValueChange={setFilter}>
                <TabsList className="grid w-full grid-cols-4 md:w-auto">
                    <TabsTrigger value="all">Bütün</TabsTrigger>
                    <TabsTrigger value="module">Modullar</TabsTrigger>
                    <TabsTrigger value="addon">Add-ons</TabsTrigger>
                    <TabsTrigger value="integration">İnteqrasiyalar</TabsTrigger>
                </TabsList>

                <TabsContent value={filter} className="space-y-4"> {/* Use 'filter' here or 'all' but map explicitly if structure differs. Since we filter array, one Content is enough or keep structure consistent */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <Card key={item.id} className={`flex flex-col relative transition-all duration-200 hover:shadow-lg ${item.installed ? 'border-green-500/50 bg-green-50/10' : ''}`}>
                                {item.popular && (
                                    <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-white border-none">
                                        <Star className="w-3 h-3 mr-1 fill-white" /> Popular
                                    </Badge>
                                )}
                                {item.installed && (
                                    <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white border-none">
                                        <Check className="w-3 h-3 mr-1" /> Aktivdir
                                    </Badge>
                                )}

                                <CardHeader>
                                    <div className={`p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${item.category === 'module' ? 'bg-blue-100 text-blue-600' : item.category === 'addon' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl line-clamp-1">{item.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 h-10">{item.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1">
                                    <div className="flex items-center gap-1 mb-2">
                                        {item.rating && (
                                            <div className="flex items-center text-sm text-yellow-500">
                                                <Star className="w-4 h-4 fill-yellow-500" />
                                                <span className="ml-1 font-medium text-foreground">{item.rating}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground ml-auto uppercase font-semibold">
                                            {item.category}
                                        </div>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex items-baseline gap-1 mt-4">
                                        <span className="text-2xl font-bold">
                                            {item.currency === 'USD' ? '$' : '₼'}{item.priceMonthly}
                                        </span>
                                        <span className="text-sm text-muted-foreground">/ ay</span>
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    {item.installed ? (
                                        <Button variant="outline" className="w-full" disabled>
                                            <Check className="mr-2 w-4 h-4" /> Artıq Aktivdir
                                        </Button>
                                    ) : (
                                        <>
                                            {canBuy && (
                                                <Button
                                                    className="w-full"
                                                    variant={item.category === 'integration' ? 'secondary' : 'default'}
                                                    onClick={() => handleBuyClick(item)}
                                                >
                                                    <ShoppingCart className="mr-2 w-4 h-4" />
                                                    {item.category === 'integration' ? 'Quraşdır' : 'Satın Al'}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    {filteredItems.length === 0 && (
                        <div className="text-center py-20 bg-muted/20 rounded-lg">
                            <p className="text-muted-foreground text-lg">Hələlik bu kateqoriyada heç bir xidmət yoxdur.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xidmətin Aktivləşdirilməsi</DialogTitle>
                        <DialogDescription>
                            Siz <b>{selectedItem?.title}</b> xidmətini aktivləşdirmək üzrəsiniz.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex justify-between items-center text-sm p-3 bg-muted rounded-md">
                            <span className="text-muted-foreground">Abunəlik Müddəti:</span>
                            <span className="font-medium">Aylıq (Avtomatik Yenilənmə)</span>
                        </div>
                        <div className="flex justify-between items-center bg-primary/10 p-4 rounded-lg border border-primary/20">
                            <span className="font-semibold">Yekun Aylıq Ödəniş:</span>
                            <span className="text-xl font-bold text-primary">
                                {selectedItem?.currency === 'USD' ? '$' : '₼'}{selectedItem?.priceMonthly}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Ləğv Et</Button>
                        <Button onClick={handleConfirmPurchase}>Ödə və Aktivləşdir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
