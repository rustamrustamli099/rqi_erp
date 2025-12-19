"use client"

import { useState } from "react"
import { ShieldCheck, Smartphone, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function IntegrationsTab() {
    const [smsProvider, setSmsProvider] = useState("twilio")

    // Switch States
    const [smsEnabled, setSmsEnabled] = useState(false)
    const [mfaEnabled, setMfaEnabled] = useState(false)
    const [smtpEnabled, setSmtpEnabled] = useState(true)

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, title: string, desc: string, action: () => void }>({
        open: false, title: "", desc: "", action: () => { }
    })

    const handleSwitchToggle = (type: "SMS" | "MFA" | "SMTP", currentValue: boolean, setter: (val: boolean) => void) => {
        const newValue = !currentValue
        setConfirmDialog({
            open: true,
            title: newValue ? `${type} Xidmətini Aktivləşdir?` : `${type} Xidmətini Deaktiv Et?`,
            desc: newValue
                ? "Bu xidmətin aktivləşdirilməsi sistem davranışına təsir edəcək. Davam etmək istəyirsiniz?"
                : "Diqqət! Bu xidməti söndürmək bəzi funksionallıqların dayanmasına səbəb ola bilər.",
            action: () => {
                setter(newValue)
                setConfirmDialog(prev => ({ ...prev, open: false }))
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {/* SMS INTEGRATION */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-blue-500" />
                            SMS Gateway
                        </CardTitle>
                        <CardDescription>OTP və bildirişlər üçün SMS xidməti.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                            <Label>Status</Label>
                            <Switch
                                checked={smsEnabled}
                                onCheckedChange={() => handleSwitchToggle("SMS", smsEnabled, setSmsEnabled)}
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label>Aktiv Provayder</Label>
                            <div className="text-sm font-medium">Twilio (Global)</div>
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto pt-0">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">Tənzimlə</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>SMS Provayder Konfiqurasiyası</DialogTitle>
                                    <DialogDescription>API açarlarını və sender ID-ni daxil edin.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Provayder</Label>
                                        <Select
                                            value={smsProvider}
                                            onValueChange={setSmsProvider}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="twilio">Twilio</SelectItem>
                                                <SelectItem value="koneko">Koneko (Local)</SelectItem>
                                                <SelectItem value="vipex">Vipex (Local)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>API Key / Token</Label>
                                        <Input type="password" placeholder="sk_live_..." />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Sender ID (Başlıq)</Label>
                                        <Input placeholder="RQI ERP" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Callback / Webhook URL (Opsional)</Label>
                                        <Input placeholder="https://api.rqi.az/webhooks/sms/status" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Yadda Saxla</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                {/* TOTP / 2FA INTEGRATION */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            Authenticator (TOTP)
                        </CardTitle>
                        <CardDescription>Google/Microsoft Authenticator tənzimləmələri.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                            <Label>Məcburi Tətbiq</Label>
                            <Switch
                                checked={mfaEnabled}
                                onCheckedChange={() => handleSwitchToggle("MFA", mfaEnabled, setMfaEnabled)}
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Issuer Name:</span>
                                <span className="font-medium">RQI ERP</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Alqoritm:</span>
                                <span className="font-medium">SHA1 (Default)</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto pt-0">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">Siyasəti Dəyiş</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>MFA Siyasəti</DialogTitle>
                                    <DialogDescription>İki faktorlu təsdiqləmə (2FA) qaydalarını tənzimləyin.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                                        <Checkbox id="mfa_admin" defaultChecked />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="mfa_admin" className="font-medium">Administratorlar üçün məcburi</Label>
                                            <p className="text-sm text-muted-foreground">Admins qrupuna daxil olanlar üçün.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                                        <Checkbox id="mfa_all" />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="mfa_all" className="font-medium">Bütün istifadəçilər üçün məcburi</Label>
                                            <p className="text-sm text-muted-foreground">Bütün sistem istifadəçiləri üçün (tövsiyə olunur).</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Token Period</Label>
                                            <Select defaultValue="30">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="30">30 saniyə (Standart)</SelectItem>
                                                    <SelectItem value="60">60 saniyə</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Lookback Window</Label>
                                            <Select defaultValue="1">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">0 (Strict)</SelectItem>
                                                    <SelectItem value="1">1 (Tolerant)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Təsdiqlə</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                {/* EMAIL INTEGRATION */}
                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-orange-500" />
                            SMTP Server
                        </CardTitle>
                        <CardDescription>Sistem emailləri üçün SMTP serveri.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                            <Label>Status</Label>
                            <Switch
                                checked={smtpEnabled}
                                onCheckedChange={() => handleSwitchToggle("SMTP", smtpEnabled, setSmtpEnabled)}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">smtp.gmail.com</Badge>
                            <Badge variant="outline" className="text-green-600">Connected</Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto pt-0">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">Yenilə</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>SMTP Server Ayarları</DialogTitle>
                                    <DialogDescription>Xarici SMTP serveri qoşun.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>SMTP Host</Label>
                                            <Input placeholder="smtp.gmail.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Port</Label>
                                            <Input placeholder="587" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Şifrələmə</Label>
                                            <Select defaultValue="tls">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tls">STARTTLS</SelectItem>
                                                    <SelectItem value="ssl">SSL/TLS</SelectItem>
                                                    <SelectItem value="none">Yoxdur</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Doğrulama (Auth)</Label>
                                            <Select defaultValue="login">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="login">Login</SelectItem>
                                                    <SelectItem value="plain">Plain</SelectItem>
                                                    <SelectItem value="cram-md5">CRAM-MD5</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Email (User)</Label>
                                        <Input placeholder="notifications@rqi.az" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Şifrə (App Password)</Label>
                                        <Input type="password" placeholder="••••••••" />
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Göndərən Adı (From Name)</Label>
                                            <Input placeholder="RQI Sistem" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Göndərən Email (From)</Label>
                                            <Input placeholder="no-reply@rqi.az" />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" className="mr-auto">Test Connection</Button>
                                    <Button type="submit">Yadda Saxla</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
            </div>

            {/* Global Confirmation Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, open: false }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.desc}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv Et</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDialog.action}>Təsdiqlə</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
