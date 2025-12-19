import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter, Eye } from "lucide-react";
import { useState } from "react";
import { AuditDiffViewer } from "./AuditDiffViewer";

const MOCK_LOGS = [
    { id: 1, actor: "admin@company.com", action: "USER_CREATE", resource: "User: jdoe", status: "success", ip: "192.168.1.5", time: "2024-12-18 10:30:00" },
    { id: 2, actor: "system", action: "BACKUP_DAILY", resource: "DB: main", status: "success", ip: "127.0.0.1", time: "2024-12-18 02:00:00" },
    { id: 3, actor: "hr_manager", action: "SALARY_VIEW", resource: "Employee: #452", status: "warning", ip: "10.0.0.25", time: "2024-12-17 15:45:00" },
    { id: 4, actor: "unknown", action: "LOGIN_ATTEMPT", resource: "Auth", status: "failure", ip: "45.2.1.99", time: "2024-12-17 09:12:00" },
    { id: 5, actor: "admin@company.com", action: "CONFIG_CHANGE", resource: "Settings", status: "success", ip: "192.168.1.5", time: "2024-12-16 14:20:00" },
];

export default function AuditLogsPage() {
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    return (
        <div className="space-y-4 p-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">Audit Logs</h2>
                    <p className="text-sm text-muted-foreground">Sistem üzrə bütün əməliyyatların tarixçəsi.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Eksport</Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Axtarış (User, IP, Action)..." className="pl-9" />
                </div>
                <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vaxt</TableHead>
                            <TableHead>İstifadəçi (Actor)</TableHead>
                            <TableHead>Əməliyyat</TableHead>
                            <TableHead>Resurs</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_LOGS.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-mono text-xs">{log.time}</TableCell>
                                <TableCell>{log.actor}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{log.action}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{log.resource}</TableCell>
                                <TableCell>
                                    {log.status === 'success' && <Badge className="bg-green-600">Success</Badge>}
                                    {log.status === 'warning' && <Badge variant="secondary" className="bg-amber-100 text-amber-800">Warning</Badge>}
                                    {log.status === 'failure' && <Badge variant="destructive">Failure</Badge>}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(log)}>
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AuditDiffViewer
                open={!!selectedRecord}
                onOpenChange={(v) => !v && setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    );
}
