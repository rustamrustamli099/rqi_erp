
import { useState, useMemo } from "react";
import { DataTable } from "@/shared/components/ui/data-table";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Download, Eye, FileText, Mail, MoreHorizontal, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface Invoice {
    id: string;
    number: string;
    tenant: string;
    plan: string;
    amount: number;
    currency: string;
    status: "paid" | "pending" | "overdue" | "cancelled";
    period: string; // e.g. "Jan 01 - Feb 01, 2024"
    date: string;
}

const MOCK_INVOICES: Invoice[] = [
    { id: "inv_001", number: "INV-2024-001", tenant: "Global Corp", plan: "Enterprise", amount: 199.99, currency: "AZN", status: "paid", period: "Jan 01 - Feb 01, 2024", date: "2024-01-01" },
    { id: "inv_002", number: "INV-2024-002", tenant: "Global Corp", plan: "Enterprise", amount: 199.99, currency: "AZN", status: "paid", period: "Feb 01 - Mar 01, 2024", date: "2024-02-01" },
    { id: "inv_003", number: "INV-2024-003", tenant: "Global Corp", plan: "Enterprise", amount: 199.99, currency: "AZN", status: "pending", period: "Mar 01 - Apr 01, 2024", date: "2024-03-01" },
];

export function InvoicesView() {
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [confirmDownload, setConfirmDownload] = useState<string | null>(null);
    const [confirmResend, setConfirmResend] = useState<string | null>(null);

    const handleDownload = (id: string) => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: "PDF yüklənir...",
            success: "Faktura yükləndi",
            error: "Xəta baş verdi"
        });
        setConfirmDownload(null);
    };

    const handleResend = (id: string) => {
        toast.success("Faktura e-poçt ünvanına göndərildi");
        setConfirmResend(null);
    };

    const columns: ColumnDef<Invoice>[] = useMemo(() => [
        {
            accessorKey: "number",
            header: "Faktura №",
            cell: ({ row }) => <span className="font-medium">{row.original.number}</span>
        },
        {
            accessorKey: "plan",
            header: "Plan / Paket",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.plan}</span>
                    <span className="text-xs text-muted-foreground">{row.original.tenant}</span>
                </div>
            )
        },
        {
            accessorKey: "period",
            header: "Dövr",
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.period}</span>
        },
        {
            accessorKey: "date",
            header: "Tarix",
        },
        {
            accessorKey: "amount",
            header: "Məbləğ",
            cell: ({ row }) => <span className="font-bold">{row.original.amount.toFixed(2)} {row.original.currency}</span>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    variant={row.original.status === 'paid' ? 'default' : row.original.status === 'pending' ? 'secondary' : 'destructive'}
                    className={cn(
                        row.original.status === 'paid' && "bg-green-600 hover:bg-green-700",
                        row.original.status === 'pending' && "bg-orange-500 hover:bg-orange-600 text-white",
                        row.original.status === 'overdue' && "bg-red-600"
                    )}
                >
                    {row.original.status === 'paid' ? "Ödənilib" : row.original.status === 'pending' ? "Gözləyir" : row.original.status === 'overdue' ? "Gecikir" : "Ləğv"}
                </Badge>
            )
        },
        {
            id: "actions",
            header: () => <div className="text-right">Əməliyyatlar</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> Bax
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmDownload(row.original.id)}>
                                <Download className="mr-2 h-4 w-4" /> PDF Endir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmResend(row.original.id)}>
                                <Mail className="mr-2 h-4 w-4" /> Yenidən Göndər
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ödənilmiş</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Son 30 gün</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gözləyən</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">1</div>
                        <p className="text-xs text-muted-foreground">199.99 AZN</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-background rounded-md border">
                <DataTable
                    columns={columns}
                    data={invoices}
                    searchKey="number"
                    filterPlaceholder="Faktura nömrəsi ilə axtar..."
                />
            </div>

            <ConfirmationDialog
                open={!!confirmDownload}
                onOpenChange={(val: boolean) => !val && setConfirmDownload(null)}
                title="PDF Endir"
                description="Bu fakturanı PDF formatında yükləmək istəyirsiniz?"
                onConfirm={() => confirmDownload && handleDownload(confirmDownload)}
            />

            <ConfirmationDialog
                open={!!confirmResend}
                onOpenChange={(val: boolean) => !val && setConfirmResend(null)}
                title="Yenidən Göndər"
                description="Fakturanı müştərinin e-poçt ünvanına yenidən göndərmək istəyirsiniz?"
                onConfirm={() => confirmResend && handleResend(confirmResend)}
            />
        </div>
    );
}
