
import { PageHeader } from "@/shared/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Archive, Trash2, CalendarClock } from "lucide-react";

const mockPolicies = [
    { id: 1, entity: "Audit Logs", keepDays: 365, action: "archive", filter: "All" },
    { id: 2, entity: "System Notifications", keepDays: 90, action: "delete", filter: "Read Only" },
    { id: 3, entity: "Inactive User Sessions", keepDays: 7, action: "delete", filter: "All" },
    { id: 4, entity: "Old Invoices (Draft)", keepDays: 180, action: "archive", filter: "Status=Draft" },
];

export default function RetentionPolicyPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                heading="Məlumat Saxlama Siyasəti (Retention Rules)"
                text="Köhnə məlumatların avtomatik arxivlənməsi və ya silinməsi qaydaları."
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Aktiv Siyasətlər</CardTitle>
                            <CardDescription>Bu qaydalar hər gecə saat 02:00-da yoxlanılır.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Obyekt (Entity)</TableHead>
                                <TableHead>Saxlama Müddəti</TableHead>
                                <TableHead>Əməliyyat</TableHead>
                                <TableHead>Filtr</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPolicies.map((policy) => (
                                <TableRow key={policy.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <CalendarClock className="w-4 h-4 text-muted-foreground" />
                                        {policy.entity}
                                    </TableCell>
                                    <TableCell>{policy.keepDays} gün</TableCell>
                                    <TableCell>
                                        <Badge variant={policy.action === 'archive' ? 'secondary' : 'destructive'} className="uppercase text-[10px]">
                                            {policy.action === 'archive' ? <Archive className="w-3 h-3 mr-1" /> : <Trash2 className="w-3 h-3 mr-1" />}
                                            {policy.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{policy.filter}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
