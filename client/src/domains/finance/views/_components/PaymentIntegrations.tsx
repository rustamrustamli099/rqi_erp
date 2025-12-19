import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Wallet, Banknote, Settings, Save } from "lucide-react"
import { toast } from "sonner"
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

interface PaymentProvider {
    id: string
    name: string
    code: 'stripe' | 'bank' | 'paypal'
    description: string
    icon: React.ElementType
    isConnected: boolean
    isDefault: boolean
    config: Record<string, string>
}

export default function PaymentIntegrations() {
    const [providers, setProviders] = useState<PaymentProvider[]>([
        {
            id: "prov_stripe",
            name: "Stripe",
            code: 'stripe',
            description: "Visa, Mastercard, Apple Pay və Google Pay qəbul edin.",
            icon: CreditCard,
            isConnected: true,
            isDefault: true,
            config: {
                publicKey: "pk_test_...",
                secretKey: "sk_test_..."
            }
        },
        {
            id: "prov_bank",
            name: "Bank Köçürməsi",
            code: 'bank',
            description: "Korporativ bank hesabı rekvizitləri vasitəsilə ödəniş.",
            icon: Wallet,
            isConnected: true,
            isDefault: false,
            config: {
                bankName: "Kapital Bank ASC",
                iban: "AZ50 KAPIT 3804 0000 0000 1234",
                swift: "IIBAAZ2X"
            }
        },
        {
            id: "prov_paypal",
            name: "PayPal / Wallets",
            code: 'paypal',
            description: "PayPal və ya digər elektron pulqabı inteqrasiyası.",
            icon: Banknote,
            isConnected: false,
            isDefault: false,
            config: {
                clientId: "",
                clientSecret: ""
            }
        }
    ])

    const [isConfigOpen, setIsConfigOpen] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)

    // Confirmation State
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingToggle, setPendingToggle] = useState<{ id: string, checked: boolean } | null>(null)

    const requestToggleProvider = (id: string, checked: boolean) => {
        // Prevent disabling Bank transfer if it's the only one or something logic (optional)
        const provider = providers.find(p => p.id === id)
        if (provider?.code === 'bank' && !checked) {
            // Example blocker logic, though user said "all status changes need confirmation"
            // I'll stick to confirmation for everything.
        }

        setPendingToggle({ id, checked })
        setConfirmOpen(true)
    }

    const confirmToggle = () => {
        if (pendingToggle) {
            setProviders(prev => prev.map(p => {
                if (p.id === pendingToggle.id) {
                    return { ...p, isConnected: pendingToggle.checked }
                }
                return p
            }))
            toast.success(pendingToggle.checked ? "Ödəniş metodu aktivləşdirildi." : "Ödəniş metodu deaktiv edildi.")
        }
        setConfirmOpen(false)
        setPendingToggle(null)
    }

    const handleOpenConfig = (provider: PaymentProvider) => {
        setSelectedProvider(provider)
        setIsConfigOpen(true)
    }

    const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        if (selectedProvider) {
            const newConfig: Record<string, string> = {}
            formData.forEach((value, key) => {
                newConfig[key] = value as string
            })

            setProviders(prev => prev.map(p => p.id === selectedProvider.id ? { ...p, config: newConfig } : p))
            toast.success(`${selectedProvider.name} tənzimləmələri yadda saxlanıldı.`)
            setIsConfigOpen(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ödəniş İnteqrasiyaları</CardTitle>
                    <CardDescription>
                        Sistemdə aktiv olan ödəniş metodlarını idarə edin və ya yenilərini qoşun.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {providers.map(provider => (
                        <div key={provider.id} className="flex flex-col sm:flex-row items-start justify-between border p-4 rounded-lg bg-card hover:bg-muted/30 transition-colors gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${provider.isConnected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <provider.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{provider.name}</h4>
                                        {provider.isDefault && <Badge variant="secondary">Default</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {provider.description}
                                    </p>
                                    <div className="flex items-center gap-2 pt-2">
                                        {provider.isConnected && (
                                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleOpenConfig(provider)}>
                                                <Settings className="w-3 h-3 mr-1" /> Tənzimlə
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-2 sm:pt-0">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">{provider.isConnected ? 'Aktiv' : 'Deaktiv'}</span>
                                    <Switch
                                        id={`switch-${provider.id}`}
                                        checked={provider.isConnected}
                                        onCheckedChange={(checked) => requestToggleProvider(provider.id, checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedProvider?.name} Tənzimləmələri</DialogTitle>
                        <DialogDescription>
                            API açarlarını və ya hesab məlumatlarını daxil edin.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProvider && (
                        <form onSubmit={handleSaveConfig} className="space-y-4">
                            {selectedProvider.code === 'stripe' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Public Key</Label>
                                        <Input name="publicKey" defaultValue={selectedProvider.config.publicKey} placeholder="pk_test_..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secret Key</Label>
                                        <Input name="secretKey" type="password" defaultValue={selectedProvider.config.secretKey} placeholder="sk_test_..." />
                                    </div>
                                </>
                            )}
                            {selectedProvider.code === 'paypal' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Client ID</Label>
                                        <Input name="clientId" defaultValue={selectedProvider.config.clientId} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Client Secret</Label>
                                        <Input name="clientSecret" type="password" defaultValue={selectedProvider.config.clientSecret} />
                                    </div>
                                </>
                            )}
                            {selectedProvider.code === 'bank' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Bank Adı</Label>
                                        <Input name="bankName" defaultValue={selectedProvider.config.bankName} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>IBAN</Label>
                                        <Input name="iban" defaultValue={selectedProvider.config.iban} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SWIFT</Label>
                                        <Input name="swift" defaultValue={selectedProvider.config.swift} />
                                    </div>
                                </>
                            )}
                            <DialogFooter>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" /> Yadda Saxla
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Statusu dəyişmək istədiyinizə əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu ödəniş metodunun statusunu dəyişmək üzrəsiniz. Bu əməliyyat ödəniş qəbuluna təsir edə bilər.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmToggle}>Təsdiqlə</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
