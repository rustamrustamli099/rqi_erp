import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { PageHeader } from "@/components/ui/page-header"
import { usePermissions } from "@/app/auth/hooks/usePermissions"
import { User, Lock, Bell, History, Camera, LogIn, PlusCircle, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// --- Schemas ---
const profileSchema = z.object({
    name: z.string().min(2, "Ad ən az 2 simvol olmalıdır"),
    email: z.string().email("Düzgün email daxil edin"),
    phone: z.string().optional(),
    bio: z.string().optional()
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Cari şifrə tələb olunur"),
    newPassword: z.string().min(6, "Şifrə ən az 6 simvol olmalıdır"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifrələr eyni deyil",
    path: ["confirmPassword"],
})

export default function ProfilePage() {
    const { user } = usePermissions()
    const [isLoading, setIsLoading] = useState(false)

    // Forms
    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "Admin User",
            email: user?.email || "admin@example.com",
            phone: "+994 50 123 45 67",
            bio: "Senior System Administrator"
        }
    })

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema)
    })

    const onProfileSubmit = () => {
        setIsLoading(true)
        setTimeout(() => {
            toast.success("Profil məlumatları yeniləndi")
            setIsLoading(false)
        }, 1000)
    }

    const onPasswordSubmit = () => {
        setIsLoading(true)
        setTimeout(() => {
            toast.success("Şifrə uğurla dəyişdirildi")
            passwordForm.reset()
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                heading="Şəxsi Profil"
                text="Hesab məlumatlarınızı və tənzimləmələrinizi idarə edin."
            />

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Ümumi
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Təhlükəsizlik
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Bildirişlər
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                        <History className="h-4 w-4" /> Fəaliyyət
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-[250px_1fr]">
                        <Card>
                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <Avatar className="h-32 w-32 border-4 border-muted cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                        <AvatarImage src="/avatars/01.png" alt="@admin" />
                                        <AvatarFallback className="text-4xl">AD</AvatarFallback>
                                    </Avatar>
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                    >
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                toast.success("Profil şəkli yeniləndi")
                                            }
                                        }}
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">{user?.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    <p className="text-xs text-muted-foreground mt-1 capitalize badge bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block">
                                        {user?.role}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Şəxsi Məlumatlar</CardTitle>
                                <CardDescription>
                                    Burada adınızı və əlaqə vasitələrinizi yeniləyə bilərsiniz.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Tam Ad</Label>
                                            <Input id="name" {...profileForm.register("name")} />
                                            {profileForm.formState.errors.name && (
                                                <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" {...profileForm.register("email")} disabled className="bg-muted" />
                                            <p className="text-[0.8rem] text-muted-foreground">Email dəyişdirilə bilməz.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telefon</Label>
                                            <Input id="phone" {...profileForm.register("phone")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Vəzifə / Bio</Label>
                                            <Input id="bio" {...profileForm.register("bio")} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Yadda Saxlanılır..." : "Dəyişiklikləri Yadda Saxla"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Şifrəni Dəyiş</CardTitle>
                            <CardDescription>
                                Təhlükəsizlik üçün şifrənizi mütəmadi olaraq yeniləyin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="current">Cari Şifrə</Label>
                                    <Input id="current" type="password" {...passwordForm.register("currentPassword")} />
                                    {passwordForm.formState.errors.currentPassword && (
                                        <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new">Yeni Şifrə</Label>
                                    <Input id="new" type="password" {...passwordForm.register("newPassword")} />
                                    {passwordForm.formState.errors.newPassword && (
                                        <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Yeni Şifrə (Təkrar)</Label>
                                    <Input id="confirm" type="password" {...passwordForm.register("confirmPassword")} />
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Yenilənir..." : "Şifrəni Yenilə"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>İki Mərhələli Təsdiqləmə (2FA)</CardTitle>
                            <CardDescription>
                                Hesabınızın təhlükəsizliyini artırmaq üçün 2FA-nı aktivləşdirin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">Authenticator App</p>
                                <p className="text-sm text-muted-foreground">Google Authenticator və ya digər tətbiqlərdən istifadə edin.</p>
                            </div>
                            <Switch />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bildiriş Seçimləri</CardTitle>
                            <CardDescription>
                                Hansı hallarda bildiriş almaq istədiyinizi seçin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="notif-email" className="flex flex-col space-y-1">
                                    <span>Email Bildirişləri</span>
                                    <span className="font-normal text-xs text-muted-foreground">Vacib yenilənmələr və təsdiq sorğuları barədə email alın.</span>
                                </Label>
                                <Switch id="notif-email" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="notif-marketing" className="flex flex-col space-y-1">
                                    <span>Marketinq Emails</span>
                                    <span className="font-normal text-xs text-muted-foreground">Yeni xüsusiyyətlər və kampaniyalar barədə məlumat.</span>
                                </Label>
                                <Switch id="notif-marketing" />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="notif-security" className="flex flex-col space-y-1">
                                    <span>Təhlükəsizlik Xəbərdarlıqları</span>
                                    <span className="font-normal text-xs text-muted-foreground">Yeni cihazdan giriş edildikdə dərhal xəbər tutun.</span>
                                </Label>
                                <Switch id="notif-security" defaultChecked disabled />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fəaliyyət Tarixçəsi</CardTitle>
                            <CardDescription>
                                Son girişləriniz və sistemdə etdiyiniz dəyişikliklər.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l border-muted ml-3 space-y-8 pb-4">
                                {[
                                    { action: "Sistemə giriş", ip: "192.168.1.1", time: "2 dəqiqə əvvəl", os: "Windows 10", icon: LogIn, color: "text-blue-500 bg-blue-100" },
                                    { action: "Şifrə dəyişdirildi", ip: "192.168.1.1", time: "3 gün əvvəl", os: "Windows 10", icon: Lock, color: "text-amber-500 bg-amber-100" },
                                    { action: "Yeni Tenant (Alpha LLC) yaradıldı", ip: "10.0.0.45", time: "1 həftə əvvəl", os: "MacOS", icon: PlusCircle, color: "text-emerald-500 bg-emerald-100" },
                                    { action: "İstifadəçi (Elvin) silindi", ip: "10.0.0.45", time: "2 həftə əvvəl", os: "MacOS", icon: Trash, color: "text-red-500 bg-red-100" },
                                    { action: "Sistemə giriş", ip: "192.168.1.1", time: "1 ay əvvəl", os: "Windows 10", icon: LogIn, color: "text-blue-500 bg-blue-100" },
                                ].map((log, i) => (
                                    <div key={i} className="relative pl-8">
                                        <div className={`absolute -left-[9px] top-0 h-6 w-6 rounded-full border-2 border-background flex items-center justify-center ${log.color}`}>
                                            <log.icon className="h-3 w-3" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium leading-none">{log.action}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{log.time}</span>
                                                <span>•</span>
                                                <span className="font-mono">{log.ip}</span>
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{log.os}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
