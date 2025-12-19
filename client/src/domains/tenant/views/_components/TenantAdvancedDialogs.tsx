
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, CheckCircle2 } from "lucide-react"

interface TenantModulesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (modules: Record<string, boolean>) => void
}

export function TenantModulesDialog({ open, onOpenChange, onSave }: TenantModulesDialogProps) {
    const [modules, setModules] = useState({
        hr: true,
        finance: true,
        crm: false,
        inventory: false,
        procurement: false,
        payroll: true
    })

    const handleSave = () => {
        onSave(modules)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modul Konfiqurasiyası</DialogTitle>
                    <DialogDescription>
                        Tenant üçün aktiv olan modulları seçin.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                        <Label htmlFor="mod-hr" className="flex flex-col space-y-1">
                            <span>İnsan Resursları (HR)</span>
                            <span className="font-normal text-xs text-muted-foreground">İşçilər, davamiyyət və s.</span>
                        </Label>
                        <Switch id="mod-hr" checked={modules.hr} onCheckedChange={(c) => setModules({ ...modules, hr: c })} />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                        <Label htmlFor="mod-fin" className="flex flex-col space-y-1">
                            <span>Maliyyə və Mühasibatlıq</span>
                            <span className="font-normal text-xs text-muted-foreground">Kassa, bank, əməliyyatlar</span>
                        </Label>
                        <Switch id="mod-fin" checked={modules.finance} onCheckedChange={(c) => setModules({ ...modules, finance: c })} />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                        <Label htmlFor="mod-pay" className="flex flex-col space-y-1">
                            <span>Əmək Haqqı (Payroll)</span>
                            <span className="font-normal text-xs text-muted-foreground">Maaş hesablanması</span>
                        </Label>
                        <Switch id="mod-pay" checked={modules.payroll} onCheckedChange={(c) => setModules({ ...modules, payroll: c })} />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                        <Label htmlFor="mod-crm" className="flex flex-col space-y-1">
                            <span>CRM</span>
                            <span className="font-normal text-xs text-muted-foreground">Müştəri münasibətləri</span>
                        </Label>
                        <Switch id="mod-crm" checked={modules.crm} onCheckedChange={(c) => setModules({ ...modules, crm: c })} />
                    </div>
                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                        <Label htmlFor="mod-inv" className="flex flex-col space-y-1">
                            <span>Anbar (Inventory)</span>
                            <span className="font-normal text-xs text-muted-foreground">Məhsul və anbar qalığı</span>
                        </Label>
                        <Switch id="mod-inv" checked={modules.inventory} onCheckedChange={(c) => setModules({ ...modules, inventory: c })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Yadda Saxla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface TenantBillingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TenantBillingDialog({ open, onOpenChange }: TenantBillingDialogProps) {
    // Mock invoices
    const invoices = [
        { id: "INV-001", date: "2023-11-01", amount: "59.00 AZN", status: "PAID" },
        { id: "INV-002", date: "2023-10-01", amount: "59.00 AZN", status: "PAID" },
        { id: "INV-003", date: "2023-09-01", amount: "59.00 AZN", status: "PAID" },
        { id: "INV-004", date: "2023-08-01", amount: "45.00 AZN", status: "PAID" },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Ödəniş Tarixçəsi</DialogTitle>
                    <DialogDescription>
                        Son 12 ayın faktura və ödənişləri.
                    </DialogDescription>
                </DialogHeader>
                <div className="rounded-md border my-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Faktura №</TableHead>
                                <TableHead>Tarix</TableHead>
                                <TableHead>Məbləğ</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Yüklə</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-medium">{inv.id}</TableCell>
                                    <TableCell>{inv.date}</TableCell>
                                    <TableCell>{inv.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Ödənilib
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Bağla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
