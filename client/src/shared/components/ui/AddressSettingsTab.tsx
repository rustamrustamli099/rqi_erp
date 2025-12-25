import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { ADDRESS_DATA } from "@/domains/settings/constants/address-data"
import type { Country, City, District } from "@/types/schema"
import { Plus, Trash2, MapPin, Building2, Map, Search, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10;

export default function AddressSettingsTab() {
    // Data State
    const [countries, setCountries] = useState<Country[]>(ADDRESS_DATA)
    const [selectedCountryId, setSelectedCountryId] = useState<string>(countries[0]?.id || "")
    const [selectedCityId, setSelectedCityId] = useState<string>("")
    // No selectedStreetId or selectedDistrictId needed for leaf view, but needed for hierarchy

    // Search State
    const [searchCountry, setSearchCountry] = useState("")
    const [searchCity, setSearchCity] = useState("")
    const [searchDistrict, setSearchDistrict] = useState("")

    // Pagination State
    const [pageCountry, setPageCountry] = useState(1)
    const [pageCity, setPageCity] = useState(1)
    const [pageDistrict, setPageDistrict] = useState(1)

    // Edit/Create Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [dialogType, setDialogType] = useState<'country' | 'city' | 'district'>('country')
    const [editItem, setEditItem] = useState<{ id: string, name: string, code?: string, phoneCode?: string, latitude?: number, longitude?: number } | null>(null)

    // Form Binding
    const [itemName, setItemName] = useState("")
    const [itemCode, setItemCode] = useState("")
    const [itemPhoneCode, setItemPhoneCode] = useState("")
    const [itemLat, setItemLat] = useState("")
    const [itemLng, setItemLng] = useState("")
    const [itemIsAllowed, setItemIsAllowed] = useState(true)

    // Delete Confirmation State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ type: 'country' | 'city' | 'district', id: string } | null>(null)


    // --- Derived Data (Search + Pagination) ---
    const filteredCountries = useMemo(() => {
        return countries.filter(c => c.name.toLowerCase().includes(searchCountry.toLowerCase()))
    }, [countries, searchCountry])

    const paginatedCountries = useMemo(() => {
        const start = (pageCountry - 1) * ITEMS_PER_PAGE
        return filteredCountries.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredCountries, pageCountry])

    const currentCountry = countries.find(c => c.id === selectedCountryId)

    const filteredCities = useMemo(() => {
        if (!currentCountry) return []
        return currentCountry.cities.filter(c => c.name.toLowerCase().includes(searchCity.toLowerCase()))
    }, [currentCountry, searchCity])

    const paginatedCities = useMemo(() => {
        const start = (pageCity - 1) * ITEMS_PER_PAGE
        return filteredCities.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredCities, pageCity])

    const currentCity = currentCountry?.cities.find(c => c.id === selectedCityId)

    const filteredDistricts = useMemo(() => {
        if (!currentCity) return []
        return currentCity.districts.filter(d => d.name.toLowerCase().includes(searchDistrict.toLowerCase()))
    }, [currentCity, searchDistrict])

    const paginatedDistricts = useMemo(() => {
        const start = (pageDistrict - 1) * ITEMS_PER_PAGE
        return filteredDistricts.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredDistricts, pageDistrict])


    // --- Actions ---
    const openDialog = (mode: 'create' | 'edit', type: 'country' | 'city' | 'district', item?: any) => {
        setDialogMode(mode)
        setDialogType(type)

        // Populate fields
        if (item) {
            setEditItem(item)
            setItemName(item.name)
            setItemLat(item.latitude?.toString() || "")
            setItemLng(item.longitude?.toString() || "")
            if (type === 'country') {
                const c = item as Country;
                setItemCode(c.code)
                setItemPhoneCode(c.phoneCode)
                setItemIsAllowed(c.isAllowed ?? true)
            }
        } else {
            setEditItem(null)
            setItemName("")
            setItemLat("")
            setItemLng("")
            setItemCode("")
            setItemPhoneCode("")
            setItemIsAllowed(true)
        }

        setIsDialogOpen(true)
    }

    const handleSave = () => {
        if (!itemName.trim()) {
            toast.error("Ad mütləqdir")
            return;
        }

        const lat = itemLat ? parseFloat(itemLat) : undefined;
        const lng = itemLng ? parseFloat(itemLng) : undefined;

        if (dialogMode === 'create') {
            if (dialogType === 'country') {
                if (!itemCode.trim() || !itemPhoneCode.trim()) {
                    toast.error("Kod və Telefon kodu mütləqdir")
                    return;
                }
                const newCountry: Country = {
                    id: `cnt_${Date.now()}`,
                    name: itemName,
                    code: itemCode.toUpperCase(),
                    phoneCode: itemPhoneCode,
                    latitude: lat,
                    longitude: lng,
                    isAllowed: itemIsAllowed,
                    cities: []
                }
                setCountries([...countries, newCountry])
            } else if (dialogType === 'city' && selectedCountryId) {
                const newCity: City = {
                    id: `city_${Date.now()}`,
                    name: itemName,
                    countryId: selectedCountryId,
                    latitude: lat,
                    longitude: lng,
                    districts: []
                }
                setCountries(countries.map(c => c.id === selectedCountryId ? { ...c, cities: [...c.cities, newCity] } : c))
            } else if (dialogType === 'district' && selectedCityId) {
                const newDist: District = {
                    id: `dist_${Date.now()}`,
                    name: itemName,
                    cityId: selectedCityId,
                    latitude: lat,
                    longitude: lng,
                    streets: []
                }
                setCountries(countries.map(c => c.id === selectedCountryId ? {
                    ...c,
                    cities: c.cities.map(city => city.id === selectedCityId ? { ...city, districts: [...city.districts, newDist] } : city)
                } : c))
            }
            toast.success("Əlavə edildi")
        } else {
            // Edit Mode
            if (dialogType === 'country' && editItem) {
                if (!itemCode.trim() || !itemPhoneCode.trim()) {
                    toast.error("Kod və Telefon kodu mütləqdir")
                    return;
                }
                setCountries(countries.map(c => c.id === editItem.id ? {
                    ...c,
                    name: itemName,
                    code: itemCode.toUpperCase(),
                    phoneCode: itemPhoneCode,
                    latitude: lat,
                    longitude: lng,
                    isAllowed: itemIsAllowed
                } : c))
            } else if (dialogType === 'city' && editItem) {
                setCountries(countries.map(c => c.id === selectedCountryId ? {
                    ...c,
                    cities: c.cities.map(city => city.id === editItem.id ? {
                        ...city,
                        name: itemName,
                        latitude: lat,
                        longitude: lng
                    } : city)
                } : c))
            } else if (dialogType === 'district' && editItem) {
                setCountries(countries.map(c => c.id === selectedCountryId ? {
                    ...c,
                    cities: c.cities.map(city => city.id === selectedCityId ? {
                        ...city,
                        districts: city.districts.map(d => d.id === editItem.id ? {
                            ...d,
                            name: itemName,
                            latitude: lat,
                            longitude: lng
                        } : d)
                    } : city)
                } : c))
            }
            toast.success("Düzəliş edildi")
        }
        setIsDialogOpen(false)
    }

    const confirmDelete = (type: 'country' | 'city' | 'district', id: string) => {
        setItemToDelete({ type, id })
        setIsDeleteOpen(true)
    }

    const executeDelete = () => {
        if (!itemToDelete) return;
        const { type, id } = itemToDelete;

        if (type === 'country') {
            setCountries(countries.filter(c => c.id !== id))
            if (selectedCountryId === id) setSelectedCountryId("")
        } else if (type === 'city') {
            setCountries(countries.map(c => c.id === selectedCountryId ? { ...c, cities: c.cities.filter(city => city.id !== id) } : c))
            if (selectedCityId === id) setSelectedCityId("")
        } else if (type === 'district') {
            setCountries(countries.map(c => c.id === selectedCountryId ? {
                ...c,
                cities: c.cities.map(city => city.id === selectedCityId ? { ...city, districts: city.districts.filter(d => d.id !== id) } : city)
            } : c))
        }
        toast.error("Uğurla silindi")
        setIsDeleteOpen(false)
        setItemToDelete(null)
    }

    // Dynamic Placeholder Helper
    const getPlaceholder = () => {
        if (dialogType === 'country') return "Məs: Azərbaycan";
        if (dialogType === 'city') return "Məs: Bakı";
        if (dialogType === 'district') return "Məs: Xətai rayonu";
        return "Məs: Ad";
    }


    // List Item Renderer
    const ListItem = ({ name, count, badge, active, onClick, onEdit, onDelete }: any) => (
        <div
            onClick={onClick}
            className={`group flex items-center justify-between p-2 rounded-md text-sm border mb-1 cursor-pointer transition-all ${active ? 'bg-primary/10 border-primary shadow-sm' : 'bg-card border-transparent hover:bg-muted/50 hover:border-border'}`}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate font-medium">{name}</span>
                {badge && <span className="text-[10px] bg-background border px-1.5 rounded">{badge}</span>}
                {count !== undefined && <span className="text-[10px] text-muted-foreground">({count})</span>}
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
            </div>
        </div>
    )

    // Pagination Helper
    const PaginationControls = ({ page, setPage, totalItems }: { page: number, setPage: (p: number) => void, totalItems: number }) => {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between pt-2 border-t mt-auto shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-[10px] text-muted-foreground font-medium">
                    {page} / {totalPages}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-7 w-7">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-6">
            <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-muted/40">
                <CardHeader className="py-4 px-6 border-b shrink-0 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Ünvanlar
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Ölkə, Şəhər və Rayon məlumatlarının idarə olunması.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-9 h-full divide-x divide-border">


                        {/* COLUMN 1: COUNTRIES (Span 3) */}
                        <div className="md:col-span-3 lg:col-span-3 flex flex-col h-full bg-muted/5">
                            <div className="p-4 border-b shrink-0 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm flex items-center gap-2"><Map className="w-3.5 h-3.5" /> Ölkələr</h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openDialog('create', 'country')}><Plus className="w-4 h-4" /></Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input placeholder="Axtar..." className="pl-8 h-8 text-xs" value={searchCountry} onChange={e => { setSearchCountry(e.target.value); setPageCountry(1); }} />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                                {paginatedCountries.map(c => (
                                    <ListItem
                                        key={c.id}
                                        id={c.id}
                                        name={c.name}
                                        badge={c.code}
                                        active={selectedCountryId === c.id}
                                        onClick={() => { setSelectedCountryId(c.id); setSelectedCityId(""); setPageCity(1); }}
                                        onEdit={() => openDialog('edit', 'country', c)}
                                        onDelete={() => confirmDelete('country', c.id)}
                                    />
                                ))}
                            </div>
                            <div className="p-2 border-t bg-background">
                                <PaginationControls page={pageCountry} setPage={setPageCountry} totalItems={filteredCountries.length} />
                            </div>
                        </div>

                        {/* COLUMN 2: CITIES (Span 3) */}
                        <div className="md:col-span-3 lg:col-span-3 flex flex-col h-full bg-background relative z-10 border-l">
                            <div className="p-4 border-b shrink-0 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Şəhərlər / Regionlar</h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!selectedCountryId} onClick={() => openDialog('create', 'city')}><Plus className="w-4 h-4" /></Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input placeholder="Şəhər axtar..." className="pl-8 h-8 text-xs" value={searchCity} onChange={e => { setSearchCity(e.target.value); setPageCity(1); }} />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                                {!selectedCountryId ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">Ölkə seçin</div>
                                ) : filteredCities.length === 0 ? (
                                    <div className="flex items-center justify-center h-40 text-muted-foreground text-xs">Şəhər yoxdur</div>
                                ) : (
                                    paginatedCities.map(c => (
                                        <ListItem
                                            key={c.id}
                                            id={c.id}
                                            name={c.name}
                                            count={`${c.districts.length} rayon`}
                                            active={selectedCityId === c.id}
                                            onClick={() => { setSelectedCityId(c.id); setPageDistrict(1); }}
                                            onEdit={() => openDialog('edit', 'city', c)}
                                            onDelete={() => confirmDelete('city', c.id)}
                                        />
                                    ))
                                )}
                            </div>
                            <div className="p-2 border-t bg-background">
                                <PaginationControls page={pageCity} setPage={setPageCity} totalItems={filteredCities.length} />
                            </div>
                        </div>

                        {/* COLUMN 3: DISTRICTS (Span 3) */}
                        <div className="md:col-span-3 lg:col-span-3 flex flex-col h-full bg-muted/5 relative z-20 border-l">
                            <div className="p-4 border-b shrink-0 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary" /> Rayonlar
                                    </h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!selectedCityId} onClick={() => openDialog('create', 'district')}><Plus className="w-4 h-4" /></Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input placeholder="Rayon axtar..." className="pl-8 h-8 text-xs" value={searchDistrict} onChange={e => { setSearchDistrict(e.target.value); setPageDistrict(1); }} />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                                {!selectedCityId ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs opacity-50">Şəhər seçin</div>
                                ) : filteredDistricts.length === 0 ? (
                                    <div className="flex items-center justify-center h-40 text-muted-foreground text-xs">Rayon yoxdur</div>
                                ) : (
                                    paginatedDistricts.map(d => (
                                        <ListItem
                                            key={d.id}
                                            id={d.id}
                                            name={d.name}
                                            active={false} // No deeper selection
                                            onClick={() => { }}
                                            onEdit={() => openDialog('edit', 'district', d)}
                                            onDelete={() => confirmDelete('district', d.id)}
                                        />
                                    ))
                                )}
                            </div>
                            <div className="p-2 border-t bg-background">
                                <PaginationControls page={pageDistrict} setPage={setPageDistrict} totalItems={filteredDistricts.length} />
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* SHARED CREATE/EDIT DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'create' ? 'Yeni əlavə et: ' : 'Redaktə et: '}
                            {dialogType === 'country' ? 'Ölkə' : dialogType === 'city' ? 'Şəhər' : 'Rayon'}
                        </DialogTitle>
                        <DialogDescription>
                            Məlumatları daxil edin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Adı</Label>
                            <Input
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                placeholder={getPlaceholder()}
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Latitude (Enlik)</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={itemLat}
                                    onChange={(e) => setItemLat(e.target.value)}
                                    placeholder="40.4093"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Longitude (Uzunluq)</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={itemLng}
                                    onChange={(e) => setItemLng(e.target.value)}
                                    placeholder="49.8671"
                                />
                            </div>
                        </div>

                        {/* Additional Fields for Country */}
                        {dialogType === 'country' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>ISO Code</Label>
                                    <Input
                                        value={itemCode}
                                        onChange={(e) => setItemCode(e.target.value.toUpperCase())}
                                        placeholder="Məs: AZ"
                                        maxLength={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Code</Label>
                                    <Input
                                        value={itemPhoneCode}
                                        onChange={(e) => setItemPhoneCode(e.target.value)}
                                        placeholder="Məs: +994"
                                    />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isAllowed"
                                        checked={itemIsAllowed}
                                        onChange={(e) => setItemIsAllowed(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="isAllowed">Bu ölkədən girişə icazə verilsin (Geo-blocking)</Label>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleSave}>Yadda saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Silmək istədiyinizə əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu əməliyyat geri qaytarıla bilməz.
                            {itemToDelete?.type === 'country' && " Bu ölkəyə aid olan bütün şəhər və rayonlar da silinəcək!"}
                            {itemToDelete?.type === 'city' && " Bu şəhərə aid olan bütün rayonlar da silinəcək!"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Xeyr, Saxla</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={executeDelete}>
                            Bəli, Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}
