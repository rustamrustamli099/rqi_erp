import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircle, Activity, Server, Database, Trash2, Power, UserX } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export function SystemHealthWidget() {
    const [stats, setStats] = useState({ cpu: 45, memory: 60, storage: 75 })

    useEffect(() => {
        const interval = setInterval(() => {
            setStats({
                cpu: Math.floor(Math.random() * 30) + 30, // 30-60%
                memory: Math.floor(Math.random() * 20) + 50, // 50-70%
                storage: 75 // Static
            })
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistem Resursları</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2"><Server className="h-3 w-3" /> CPU İstifadəsi</span>
                        <span className="font-medium">{stats.cpu}%</span>
                    </div>
                    <Progress value={stats.cpu} className="h-2" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2"><Database className="h-3 w-3" /> RAM</span>
                        <span className="font-medium">{stats.memory}%</span>
                    </div>
                    <Progress value={stats.memory} className="h-2" />
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                    Uptime: <span className="text-foreground font-mono">14d 2h 12m</span>
                </div>
            </CardContent>
        </Card>
    )
}

export function CacheManager() {
    const [caches, setCaches] = useState([
        { id: 'auth_sessions', name: 'Auth Sessions', size: '124 MB', lastCleared: '2 saat əvvəl' },
        { id: 'page_cache', name: 'Page Cache (SSR)', size: '1.2 GB', lastCleared: '1 gün əvvəl' },
        { id: 'api_responses', name: 'API Responses', size: '450 KB', lastCleared: '5 dəq əvvəl' },
    ])

    const handleClear = (id: string) => {
        toast.success(`${id} keş təmizləndi`);
        setCaches(prev => prev.map(c => c.id === id ? { ...c, size: '0 KB', lastCleared: 'İndi' } : c))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Keş İdarəetmə</CardTitle>
                <CardDescription>Sistem performansını optimallaşdırmaq üçün keşləri təmizləyin.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {caches.map(cache => (
                        <div key={cache.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div>
                                <p className="font-medium text-sm">{cache.name}</p>
                                <p className="text-xs text-muted-foreground">Ölçü: {cache.size} • Son təmizləmə: {cache.lastCleared}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleClear(cache.id)}>
                                <Trash2 className="h-3 w-3 mr-1" /> Təmizlə
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function MaintenanceControls() {
    const [maintMode, setMaintMode] = useState(false)

    return (
        <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Təhlükəli Zona
                </CardTitle>
                <CardDescription>Sistemin qlobal vəziyyətinə təsir edən əməliyyatlar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Texniki Baxış Modu</Label>
                        <p className="text-xs text-muted-foreground">Aktiv olduqda, yalnız adminlər sistemə daxil ola bilər.</p>
                    </div>
                    <Switch checked={maintMode} onCheckedChange={(v) => {
                        setMaintMode(v);
                        if (v) toast.warning("Sistem Texniki Baxış rejiminə keçirildi!");
                        else toast.success("Sistem normal rejimə qaytarıldı.");
                    }} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-destructive/10">
                    <div className="space-y-0.5">
                        <Label>Bütün Sessiyaları Sonlandır</Label>
                        <p className="text-xs text-muted-foreground">Bütün istifadəçiləri sistemdən çıxarır (Adminlər xaric).</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => toast.error("Bütün istifadəçilər sistemdən çıxarıldı")}>
                        <UserX className="h-3 w-3 mr-1" /> Force Logout
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
