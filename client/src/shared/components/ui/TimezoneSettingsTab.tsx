
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, Globe, Clock, Check, Plus, Trash, Edit, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Timezone = {
    id: string
    name: string
    offset: string
    region: string
    cities: string[]
}

const DEFAULT_TIMEZONES: Timezone[] = [
    { id: "azt", name: "Azerbaijan Time (AZT)", offset: "+04:00", region: "Asia/Baku", cities: ["Baku", "Sumqayit", "Ganja"] },
    { id: "trt", name: "Turkey Time (TRT)", offset: "+03:00", region: "Europe/Istanbul", cities: ["Istanbul", "Ankara", "Izmir"] },
    { id: "gst", name: "Gulf Standard Time (GST)", offset: "+04:00", region: "Asia/Dubai", cities: ["Dubai", "Abu Dhabi"] },
    { id: "utc", name: "Coordinated Universal Time (UTC)", offset: "+00:00", region: "Etc/UTC", cities: ["London", "Reykjavik"] },
    { id: "est", name: "Eastern Standard Time (EST)", offset: "-05:00", region: "America/New_York", cities: ["New York", "Washington D.C.", "Toronto"] },
    { id: "pst", name: "Pacific Standard Time (PST)", offset: "-08:00", region: "America/Los_Angeles", cities: ["Los Angeles", "San Francisco", "Vancouver"] },
    { id: "cet", name: "Central European Time (CET)", offset: "+01:00", region: "Europe/Paris", cities: ["Paris", "Berlin", "Rome", "Madrid"] },
    { id: "jst", name: "Japan Standard Time (JST)", offset: "+09:00", region: "Asia/Tokyo", cities: ["Tokyo", "Osaka"] },
]

export default function TimezoneSettingsTab() {
    const [timezones, setTimezones] = useState<Timezone[]>(DEFAULT_TIMEZONES)
    const [search, setSearch] = useState("")
    const [globalTimezone, setGlobalTimezone] = useState<string>("azt")
    const [currentTime, setCurrentTime] = useState(new Date())

    // Dialog Data
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Form Data
    const [formData, setFormData] = useState({
        region: "",
        offset: "",
        cities: ""
    })

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const filteredTimezones = timezones.filter(tz =>
        tz.name.toLowerCase().includes(search.toLowerCase()) ||
        tz.region.toLowerCase().includes(search.toLowerCase()) ||
        tz.cities.some(c => c.toLowerCase().includes(search.toLowerCase()))
    )

    const handleSetGlobal = (id: string) => {
        setGlobalTimezone(id)
        toast.success("Qlobal saat qurşağı yeniləndi")
    }

    const getLocalTime = (_offset: string) => {
        // Mock time calc
        return currentTime.toLocaleTimeString("az-AZ", { hour: '2-digit', minute: '2-digit' })
    }

    const handleAdd = () => {
        setEditingId(null)
        setFormData({ region: "", offset: "", cities: "" })
        setIsDialogOpen(true)
    }

    const handleEdit = (tz: Timezone) => {
        setEditingId(tz.id)
        setFormData({
            region: tz.region,
            offset: tz.offset,
            cities: tz.cities.join(", ")
        })
        setIsDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        setDeleteId(id)
        setIsDeleteOpen(true)
    }

    const confirmDelete = () => {
        if (deleteId) {
            setTimezones(timezones.filter(t => t.id !== deleteId))
            toast.success("Saat qurşağı silindi")
            setIsDeleteOpen(false)
        }
    }

    const handleSave = () => {
        if (!formData.region || !formData.offset) {
            toast.error("Region və Offset mütləqdir")
            return
        }

        const citiesArray = formData.cities.split(",").map(c => c.trim()).filter(c => c)

        if (editingId) {
            // Edit
            setTimezones(timezones.map(t => t.id === editingId ? {
                ...t,
                region: formData.region,
                offset: formData.offset,
                cities: citiesArray,
                name: `${formData.region} (${formData.offset})` // Auto name
            } : t))
            toast.success("Düzəliş edildi")
        } else {
            // Add
            const newTz: Timezone = {
                id: `tz_${Date.now()}`,
                name: `${formData.region} (${formData.offset})`,
                region: formData.region,
                offset: formData.offset,
                cities: citiesArray
            }
            setTimezones([...timezones, newTz])
            toast.success("Yeni saat qurşağı əlavə edildi")
        }
        setIsDialogOpen(false)
    }

    return (
        <div className="h-full flex flex-col gap-6">
            <Card className="flex-1 shadow-md border-muted/40 overflow-hidden flex flex-col">
                <CardHeader className="py-4 px-6 border-b shrink-0 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" /> Qlobal Saat Qurşaqları
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Sistemin əsas saat qurşağını və regionları idarə edin.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-md border text-sm font-mono">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {currentTime.toLocaleTimeString("az-AZ")}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-muted/5 flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Region və ya şəhər axtar..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                            <div className="text-xs text-muted-foreground hidden md:block">
                                Cəmi {timezones.length} saat qurşağı mövcuddur.
                            </div>
                            <Button onClick={handleAdd} size="sm"><Plus className="w-4 h-4 mr-2" /> Yeni</Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-muted/5">
                        {filteredTimezones.map((tz) => {
                            const isGlobal = globalTimezone === tz.id
                            return (
                                <div
                                    key={tz.id}
                                    className={cn(
                                        "relative group flex flex-col p-4 rounded-xl border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
                                        isGlobal ? "border-primary ring-1 ring-primary shadow-md" : "border-border"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={isGlobal ? "default" : "secondary"} className="text-[10px] px-1.5 h-5">
                                                {tz.offset}
                                            </Badge>
                                            {isGlobal && <span className="text-[10px] font-medium text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Default</span>}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {!isGlobal && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(tz)}>
                                                            <Edit className="w-3 h-3 mr-2" /> Düzəliş et
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(tz.id)}>
                                                            <Trash className="w-3 h-3 mr-2" /> Sil
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-semibold text-base leading-tight">{tz.region}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tz.cities.join(", ")}</p>
                                    </div>

                                    <div className="mt-auto pt-4 border-t flex items-center justify-between">
                                        <div className="text-2xl font-mono tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
                                            {getLocalTime(tz.offset)}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={isGlobal ? "secondary" : "default"}
                                            className={cn("opacity-0 group-hover:opacity-100 transition-opacity", isGlobal && "opacity-100")}
                                            onClick={() => handleSetGlobal(tz.id)}
                                            disabled={isGlobal}
                                        >
                                            {isGlobal ? "Seçilib" : "Seç"}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Düzəliş et" : "Yeni Saat Qurşağı"}</DialogTitle>
                        <DialogDescription>
                            Region və offset məlumatlarını daxil edin
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Region / Ad</Label>
                            <Input
                                placeholder="Asia/Baku"
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Offset</Label>
                            <Input
                                placeholder="+04:00"
                                value={formData.offset}
                                onChange={(e) => setFormData({ ...formData, offset: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Şəhərlər (Vergü ilə ayırın)</Label>
                            <Input
                                placeholder="Baku, Sumqayit..."
                                value={formData.cities}
                                onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Ləğv et</Button>
                        <Button onClick={handleSave}>Yadda Saxla</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Saat Qurşağını Sil"
                description="Bu saat qurşağını silmək istədiyinizə əminsiniz?"
                onAction={confirmDelete}
                variant="destructive"
            />
        </div>
    )
}
