import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Check, Star, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface MarketplaceItem {
    id: string
    title: string // mapped from name
    description: string
    priceMonthly: number
    currency: string
    category: 'module' | 'addon' | 'integration' | 'feature' | string
    icon: React.ElementType
    popular?: boolean
    installed?: boolean
    rating?: number
    active?: boolean
    code?: string
}

interface MarketplaceTabProps {
    items: MarketplaceItem[]
    onEdit?: (item: MarketplaceItem) => void
    onDelete?: (id: string) => void
    onToggleStatus?: (id: string) => void
    isAdmin?: boolean
}

// Mock Icon component helper


export function MarketplaceTab({ items, onEdit, onDelete, onToggleStatus, isAdmin = false }: MarketplaceTabProps) {
    const [filter, setFilter] = useState("all")
    const [search, setSearch] = useState("")
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const filteredItems = items.filter(item => {
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
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-muted/40 p-4 rounded-lg">
                <div>
                    <h3 className="text-lg font-semibold">Marketplace & Add-ons</h3>
                    <p className="text-sm text-muted-foreground">Sistem imkanlarını genişləndirmək üçün modullar və xidmətlər.</p>
                </div>
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Axtarış..."
                        className="pl-8 bg-background"
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

                <TabsContent value={filter} className="space-y-4">
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

                                {isAdmin && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 bg-white/50 backdrop-blur-sm hover:bg-white/80">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit?.(item)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Düzəliş Et
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onToggleStatus?.(item.id)}>
                                                    {item.active ? (
                                                        <><span className="mr-2 h-4 w-4 block rounded-full border border-current opacity-50" /> Deaktiv Et</>
                                                    ) : (
                                                        <><Check className="mr-2 h-4 w-4" /> Aktivləşdir</>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => onDelete?.(item.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Sil
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
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
                                    {!item.active && isAdmin && (
                                        <div className="mt-2">
                                            <Badge variant="destructive" className="w-full justify-center">Deaktiv</Badge>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter>
                                    {item.installed ? (
                                        <Button variant="outline" className="w-full" disabled>
                                            <Check className="mr-2 w-4 h-4" /> Artıq Aktivdir
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant={item.category === 'integration' ? 'secondary' : 'default'}
                                            onClick={() => handleBuyClick(item)}
                                        >
                                            <ShoppingCart className="mr-2 w-4 h-4" />
                                            {item.category === 'integration' ? 'Quraşdır' : 'Satın Al'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
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
